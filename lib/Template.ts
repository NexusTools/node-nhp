@nodereq nulllogger:logger
@nodereq lodash:_
@nodereq htmlparser2
@nodereq events
@nodereq async
@nodereq path
@nodereq fs

var vm;
var USE_VM = process.env.USE_VM !== undefined;
if(USE_VM) {
	logger.warn("Using NodeJS VM");
	vm = require("vm");
}
var IGNORED_KEYWORDS = ['JSON', 'Array', 'Date', 'let', 'class', 'const', 'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'false', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'null', 'return', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with'];

@include Compiler

logger = logger("nhp");

class Template extends events.EventEmitter {
    private static echoElements = /(title|body|error)/;
    private static rawElements = /(textarea|script|style|pre)/;
    private static $break = new Object();

    private _nhp;
    private _source: String;
    private _compiledScript;
    private _dirname: String;
    private _filename: String;
    private _compiler: Compiler;
    constructor(filename: String, nhp) {
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

    public static encodeHTML(html: String, attr: boolean) {
        html = html.replace(/</g, "&lt;");
        html = html.replace(/>/g, "&gt;");
        if (attr)
            return html.replace(/"/g, "&quot;");
        return html;
    }
    
    public getSource() {
        return this._source;
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
        } catch (e) { }

        try {
            var self = this;
            logger.gears("Compiling", this._filename);
            this._compiler = new Compiler(this._nhp);
            this._compiler.compile(fs.createReadStream(this._filename), function(err) {
                try {
                    if (err) throw err;
                    var firstTime = !self._compiledScript;

                    self._compiler.optimize(self._nhp.constants, function(err) {
                        try {
                            if (err) {
                                logger.warning(err);
                                throw new Error("Failed to optimize", this._filename, self._compiler._instructions);
                            }

                            self._source = ""+self._compiler.generateSource();
                            logger.debug("Generated source code", this._filename, self._source);
							if(USE_VM)
								self._compiledScript = vm.createScript(self._source, self._filename);
							else {
								var match, inquote, variables = [];
								var reg = /(["']|(^|\b)([$A-Z_][0-9A-Z_$]*)(\\.[$A-Z_][0-9A-Z_$]*)*(\b|$))/gi;
								while(match = reg.exec(self._source)) {
									if(inquote && inquote == match[0])
										inquote = false;
									else if(match[0] == "\"" || match[0] == "'")
										inquote = match[0];
									else if(variables.indexOf(match[1]) == -1 &&
											IGNORED_KEYWORDS.indexOf(match[1]) == -1)
										variables.push(match[1]);
								}
								
								var modifiedSource = "(function(vmc) {"
								variables.forEach(function(variable) {
									modifiedSource += "var " + variable + " = vmc." + variable + ";";
								});
								modifiedSource += self._source + "})";
								
								self._compiledScript = {
									runInContext: eval(modifiedSource)
								};
							}

                            if (firstTime)
                                self.emit("compiled");
                            self.emit("updated");

                            logger.gears("Compiled", self._filename);
                            delete self._compiler
                        } catch (e) {
                            logger.error("Failed to compile", self._filename, self._source, e);
                            self.emit("error", e);
                        }
                    });
                } catch (e) {
                    logger.warning("Failed to optimize", self._filename, e);
                    if (!self._compiledScript)
                        self._compiledScript = e;
                    self.emit("error", e);
                }
            });
        } catch (e) {
            logger.warning("Failed to compile", self._filename, e);
            if (!self._compiledScript)
                self._compiledScript = e;
            self.emit("error", e);
        }
    }

    public run(context, out: stream.Writable, callback, contextIsVMC) {
        if (!this._compiledScript)
            throw new Error("Not compiled yet");
        if (this._compiledScript instanceof Error)
            throw this._compiledScript;

        var vmc;
        if (contextIsVMC) {
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
            vmc = USE_VM ? vm.createContext() : {};

            vmc.env = {};
            _.merge(vmc, this._nhp.constants);
            _.merge(vmc, context);
            delete context;

            var options = this._nhp.options;
            if (options.tidyOutput) {
                var realOut = out, parser;
                var inTag = function(regex) {
                    try {
                        parser._stack.forEach(function(tag) {
                            if (regex.test(tag))
                                throw Template.$break;
                        });
                    } catch (e) {
                        if (e !== Template.$break)
                            throw e;
                        return true;
                    }
                    return false;
                };
                var self = this, tagCache = {};
                var updateTagCache = function() {
                    tagCache.echo = (tagCache.raw = inTag(Template.rawElements)) || inTag(Template.echoElements);
                };
                var validComment;
                var textTidyBuffer = "";
                if (options.tidyComments) {
                    if (options.tidyComments == "not-if")
                        validComment = /^\[if .+$/;
                    else
                        validComment = false;
                } else
                    validComment = /.+/;
                var endsInSpace = /^.*\s$/, startsWithSpace = /^\s.*$/, endSpace = true;
                var dumpBuffer = function() {
                    if (textTidyBuffer.length > 0) {
                        textTidyBuffer = textTidyBuffer.replace(/\s+/gm, " ");
                        var _endSpace = endsInSpace.test(textTidyBuffer);
                        if (endSpace && startsWithSpace.test(textTidyBuffer))
                            textTidyBuffer = textTidyBuffer.substring(1);
                        if (textTidyBuffer.length > 0) {
                            realOut.write(textTidyBuffer);
                            textTidyBuffer = "";
                        }
                        endSpace = _endSpace;
                    }
                }
                parser = vmc.__out = new htmlparser2.Parser({
                    onopentag: function(name, attribs) {
                        dumpBuffer();
                        updateTagCache();

                        realOut.write("<" + name);
                        for (var key in attribs) {
                            var value = attribs[key];
                            if (options.tidyAttribs.indexOf(value) > -1)
                                continue;

                            realOut.write(" " + key + "=\"" + value + "\"");
                        }
                        if (Compiler.isVoidElement(name))
                            realOut.write(" />");
                        else
                            realOut.write(">");
                    },
                    ontext: function(text) {
                        if (tagCache.raw)
                            realOut.write(text);
                        else if (tagCache.echo)
                            textTidyBuffer += text;
                    },
                    onclosetag: function(name) {
                        if (!Compiler.isVoidElement(name)) {
                            dumpBuffer();
                            realOut.write("</" + name + ">");
                        }
                        updateTagCache();
                    },
                    onprocessinginstruction: function(name, data) {
                        dumpBuffer();
                        realOut.write("<" + data + ">\n"); // Assume doctype
                        // TODO: Check if this is the first thing being written
                    },
                    oncomment: function(data) {
                        if (validComment && validComment.test(data)) {
                            dumpBuffer();
                            realOut.write("<!--" + data + "-->");
                        }
                    },
                    onerror: function(err) {
                        logger.warning(err);
                        callback(err);

                        callback = null;
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
                    if (calls++ >= 50) {
                        process.nextTick(function() {
                            iterator(entry, callback);
                        });
                        calls = 0;
                    } else
                        iterator(entry, callback);
                }
                if (_.isArray(eachOf)) {
                    if (eachOf.length > 50)
                        async.eachSeries(eachOf, iterate, callback);
                    else
                        async.eachSeries(eachOf, iterator, callback);
                } else if (_.isObject(eachOf))
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
                    if (i < segments.length) {
                        var segment = segments[i++];
                        if (segment[0]())
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
                if (!_.isArray(arr))
                    vmc.env[to] = arr = [];
                arr.push(what);
            };
            vmc.__set = function(what, to) {
                vmc.env[what] = to;
            };
            vmc.__map = function(what, at, to) {
                var map = vmc.env[what];
                if (!_.isObject(map))
                    vmc.env[what] = map = {};
                map[at] = to;
            };
            vmc.__get = function(what) {
                return vmc.env[what];
            };
            vmc.__error = function(err, attr, triple) {
                err = "" + err;
                if (attr) {
                    if (triple)
                        return encodeURIComponent(err).replace("%20", "+");
                    return Template.encodeHTML(err, true);
                }
                return "<error>" + Template.encodeHTML(err) + "</error>";
            }
            vmc.__include = function(file, callback) {
                logger.info("Including", file);

                var template = self._nhp.template(path.resolve(self._dirname, file));
                if (template.isCompiled())
                    process.nextTick(function() {
                        template.run(vmc, out, callback, true);
                    });
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
                data = "" + data;
                if (attr) {
                    if (triple)
                        return encodeURIComponent(data).replace("%20", "+");
                    return Template.encodeHTML(data, true);
                } else if (triple)
                    return data;
                return Template.encodeHTML(data);
            }
        }
        this._compiledScript.runInContext(vmc);
    }
}

@main Template