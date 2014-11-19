@nodereq nulllogger:logger
@nodereq underscore:_
@nodereq htmlparser2
@nodereq events
@nodereq async
@nodereq path
@nodereq fs
@nodereq vm

@include Compiler

logger = logger("nhp");

class Template extends events.EventEmitter {
	private static rawElements = [
		"textarea",
		"script",
		"style",
		"pre"
	];
	
    private _nhp;
	private _compiledScript;
    private _dirname:String;
    private _filename:String;
	private _compiler:Compiler;
    constructor(filename:String, nhp) {
		super();
		
        this._nhp = nhp;
        this._filename = filename;
        this._dirname = path.dirname(filename);
		
		this.compile();
		var self = this;
		fs.watch(this._filename, function(event) {
			self.compile();
		});
    }

 	public static encodeHTML(html:String, attr:boolean) {
		html = html.replace(["<", ">"], ["&lt;","&gt;"]);
		if(attr)
			return html.replace("\"", "&quot;");
		return html;
	}
 
	public isCompiled() {
		return this._compiledScript;
	}

	public hasAsyncInstructions() {
		return true;
	}

	private compile() {
		try {
			// Stop the active compiler, if any
			this._compiler.cancel();
		} catch(e) {}
		
		try {
			var self = this;
			logger.gears("Compiling", this._filename);
			this._compiler = new Compiler(this._nhp);
			this._compiler.compile(fs.createReadStream(this._filename), function(err) {
				try {
					if(err) throw err;
					var firstTime = !self._compiledScript;

					self._compiler.optimize(self._nhp.constants, function(err) {
						var source;
						try {
							if(err) {
								logger.warning(err);
								throw new Error("Failed to optimize", this._filename, self._compiler._instructions);
							}

							source = self._compiler.generateSource();
							logger.debug("Generated source code", this._filename, source);
							self._compiledScript = vm.createScript(source.toString(), self._filename);

							if(firstTime)
								self.emit("compiled");
							self.emit("updated");

							logger.gears("Compiled", self._filename);
							delete self._compiled
						} catch(e) {
							logger.error("Failed to compile", self._filename, source, e);
							self.emit("error", e);
						}
					});
				} catch(e) {
					logger.warning("Failed to optimize", self._filename, e);
					if(!self._compiledScript)
						self._compiledScript = e;
					self.emit("error", e);
				}
			});
		} catch(e) {
			logger.warning("Failed to compile", self._filename, e);
			if(!self._compiledScript)
				self._compiledScript = e;
			self.emit("error", e);
		}
	}
    
    public run(context, out:stream.Writable, callback, contextIsVMC) {
		if(!this._compiledScript)
			throw new Error("Not compiled yet");
		if(this._compiledScript instanceof Error)
			throw this._compiledScript;
		
		var vmc;
		if(contextIsVMC) {
			vmc = context;
			var oldDone = vmc.__done;
			vmc.__done = function(err) {
				try {
					callback(err);
				} finally {
					vmc.__done = oldDone;
				}
			};
		} else {
			vmc = vm.createContext();
			
			vmc.env = {};
			_.extend(vmc, this._nhp.constants);
			_.extend(vmc, context);
			delete context;
			
				
			if(this._nhp.options.tidyOutput) {
				var realOut = out, parser;
				var inTag = function(name) {
					return parser._stack.indexOf(name) > -1;
				};
				var self = this, tagCache = {};
				var updateTagCache = function() {
					tagCache.raw = false;
					tagCache.body = inTag("body");
					if(tagCache.body)
						Template.rawElements.forEach(function(elem) {
							tagCache.raw = tagCache.raw || inTag(elem);
						});
				};
				var validComment;
				var textTidyBuffer = "";
				if(this._nhp.options.tidyComments) {
					if(this._nhp.options.tidyComments == "not-if")
						validComment = /^\[if .+$/;
					else
						validComment = false;
				} else
					validComment = /.+/;
				var endsInSpace = /^.*\s$/, startsWithSpace = /^\s.*$/, endSpace = true;
				var dumpBuffer = function() {
					if(textTidyBuffer.length > 0) {
						textTidyBuffer = textTidyBuffer.replace(/\s+/gm, " ");
						var _endSpace = endsInSpace.test(textTidyBuffer);
						if(endSpace && startsWithSpace.test(textTidyBuffer))
							textTidyBuffer = textTidyBuffer.substring(1);
						if(textTidyBuffer.length > 0) {
							realOut.write(textTidyBuffer);
							textTidyBuffer = "";
						}
						endSpace = _endSpace;
					}
				}
				parser = vmc.__out = new htmlparser2.Parser({
					onopentag: function(name, attribs){
						dumpBuffer();
						updateTagCache();
						
						realOut.write("<" + name);
						for(var key in attribs)
							realOut.write(" " + key + "=\"" + attribs[key] + "\"");
						if(Compiler.isVoidElement(name))
							realOut.write(" />");
						else
							realOut.write(">");
					},
					ontext: function(text){
						if(tagCache.raw)
							realOut.write(text);
						else if(tagCache.body)
							textTidyBuffer += text;
					},
					onclosetag: function(name){
						if(!Compiler.isVoidElement(name)) {
							dumpBuffer();
							realOut.write("</" + name +">");
						}
						updateTagCache();
					},
					onprocessinginstruction: function(name, data) {
						dumpBuffer();
						realOut.write("<" + data + ">\n"); // Assume doctype
						// TODO: Check if this is the first thing being written
					},
					oncomment: function(data) {
						if(validComment && validComment.test(data)) {
							dumpBuffer();
							realOut.write("<!--" + data + "-->");
						}
					},
					onerror: function(err) {
						logger.warning(err);
						realOut.end();
					},
					onend: function() {
						realOut.end();
					}
				});
			} else
				vmc.__out = out;
			vmc._ = _;
			vmc.__done = callback;
			vmc.__series = async.series;
			vmc.__dirname = this._dirname;
			vmc.__filename = this._filename;
			vmc.__each = function(eachOf, iterator, callback) {
				var calls = 0;
				var iterate = function(entry, callback) {
					if(calls++ >= 500) {
						process.nextTick(function() {
							iterator(entry, callback);
						});
						calls = 0;
					} else
						iterator(entry, callback);
				}
				if(_.isArray(eachOf)) {
					if(eachOf.length > 500)
						async.eachSeries(eachOf, function(entry, callback) {
							iterate(entry, callback);
						}, callback);
					else
						async.eachSeries(eachOf, iterate, callback);
				} else if(_.isObject(eachOf))
					async.eachSeries(_.keys(eachOf), function(key, callback) {
						iterator({
							"key": key,
							"value": eachOf[key]
						}, callback);
					}, callback);
				else
					callback(); // Silently fail
			};
			vmc.__if = function(segments, callback) {
				var __next, i = 0;
				__next = function() {
					if(i < segments.length) {
						var segment = segments[i++];
						if(segment[0]())
							async.series(segment[1], callback);
						else
							__next();
					} else
						callback();
				}
				__next();
			};
			vmc.__add = function(to, what) {
				var arr = vmc.env[to];
				if(!_.isArray(arr))
					vmc.env[to] = arr = [];
				arr.push(what);
			};
			vmc.__set = function(what, to) {
				vmc.env[what] = to;
			};
			vmc.__map = function(what, at, to) {
				var map = vmc.env[what];
				if(!_.isObject(map))
					vmc.env[what] = map = {};
				map[at] = to;
			};
			vmc.__get = function(what) {
				return vmc.env[what];
			};
			vmc.__error = function(err, encodeMode=false) {
				err = "" + err;
				if(encodeMode)
					switch(encodeMode) {
						case 2:
							return encodeURIComponent(err).replace("%20", "+");
						default:
							return Template.encodeHTML(err, true);
					}
				return "<error>" + Template.encodeHTML(err) + "</error>";
			}
			vmc.__include = function(file, callback) {
				logger.info("Including", file);

				var template = self._nhp.template(path.resolve(self._dirname, file));
				if(template.isCompiled())
					template.run(vmc, out, callback, true);
				else {
					template.once("compiled", function() {
						template.run(vmc, out, callback, true);
					});
					template.once("error", function(err) {
						logger.warning(err);
						out.write(vmc.__error(err));
						callback();
					});
				}
			}
			vmc.__encode = Template.encodeHTML;
			vmc.__resolver = function(name, callback) {
				self._nhp.resolver(name)(callback);
			}
			vmc.__string = function(data, attr, triple) {
				data = ""+data;
				if(attr) {
					if(triple)
						return encodeURIComponent(data).replace("%20", "+");
					return Template.encodeHTML(data, true);
				} else if(triple)
					return data;
				return Template.encodeHTML(data);
			}
		}
		this._compiledScript.runInContext(vmc);
    }
}

@main Template