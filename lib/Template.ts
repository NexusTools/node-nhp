@nodereq nulllogger:logger
@nodereq underscore:_
@nodereq entities
@nodereq events
@nodereq async
@nodereq path
@nodereq fs
@nodereq vm

@include Compiler

logger = logger("nhp");

class Template extends events.EventEmitter {
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
			_.extend(vmc, this._nhp.constants);
			_.extend(vmc, context);
			delete context;
			vmc.env = {};
			
			var self = this;
			vmc.__out = out;
			vmc.__done = callback;
			vmc.__series = async.series;
			vmc.__dirname = this._dirname;
			vmc.__filename = this._filename;
			vmc.__each = function(eachOf, iterator, callback) {
				if(_.isArray(eachOf))
					async.eachSeries(eachOf, iterator, callback);
				else if(_.isObject(eachOf))
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
			vmc.__get = function(what) {
				return vmc.env[what];
			};
			vmc.__error = function(err, attrib:boolean = false) {
				err = entities.encodeHTML("" + err);
				if(attrib)
					return err;
				return "<error>" + err + "</error>";
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
			vmc.__encode = entities.encodeHTML;
			vmc.__resolver = function(name, callback) {
				self._nhp.resolver(name)(callback);
			}
			vmc.__string = function(data, raw) {
				if(raw)
					return "" + data;
				return entities.encodeHTML("" + data);
			}
		}
		this._compiledScript.runInContext(vmc);
    }
}

@main Template