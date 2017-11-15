"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
const htmlparser2 = require("htmlparser2");
const events = require("events");
const stream_1 = require("stream");
const crypto = require("crypto");
const async = require("async");
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const logger = new log("nhp");
var vm;
var USE_VM = process.env.USE_VM !== undefined;
if (USE_VM) {
    logger.warn("Using NodeJS VM");
    vm = require("vm");
}
var IGNORED_KEYWORDS = ['JSON', 'Array', 'Date', "abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"];
const Compiler_1 = require("./Compiler");
class BufferedWritable extends stream_1.Writable {
    constructor() {
        super(...arguments);
        this.buffer = "";
    }
    _write(chunk, encoding, callback) {
        this.buffer += chunk.toString("utf8");
        callback();
    }
}
class SplitBufferedWritable extends stream_1.Writable {
    constructor(out) {
        super();
        this.buffer = "";
        this.out = out;
    }
    _write(chunk, encoding, callback) {
        this.buffer += chunk.toString("utf8");
        this.out.write(chunk, encoding, callback);
    }
}
class Template extends events.EventEmitter {
    constructor(filename, nhp) {
        super();
        this._cache = {};
        this._nhp = nhp;
        this._filename = filename;
        this._dirname = path.dirname(filename);
        this.addListener("error", function (err) {
            logger.warn(err);
        });
        fs.watch(this._filename, (event) => {
            this.compile();
        });
        this.compile();
    }
    render(options, cb) {
        const bufferedWritable = new BufferedWritable();
        if (options && options.cache) {
            var cache;
            if (options.cache === true)
                options.cache = crypto.createHash('md5').update(JSON.stringify(options)).digest("hex");
            if (cache = this._cache[options.cache])
                return cb(undefined, cache);
        }
        this.renderToStream(options, bufferedWritable, function (err) {
            if (err)
                cb(err);
            else
                cb(undefined, bufferedWritable.buffer);
        });
    }
    renderToStream(options, stream, cb) {
        if (this.isCompiled())
            this.run(options, stream, cb);
        else {
            var timeout;
            var onCompiled, onError;
            const _cb = (err) => {
                this.removeListener("compiled", onCompiled);
                this.removeListener("error", onError);
                cb(err);
            };
            this.on("compiled", onCompiled = () => {
                timeout = setTimeout(() => {
                    this.run(options, stream, _cb);
                }, 10);
            });
            this.on("error", onError = function (err) {
                try {
                    clearTimeout(timeout);
                }
                catch (e) { }
                _cb(err);
            });
        }
    }
    static encodeHTML(html, attr = false) {
        html = html.replace(/</g, "&lt;");
        html = html.replace(/>/g, "&gt;");
        if (attr)
            return html.replace(/"/g, "&quot;");
        return html;
    }
    getSource() {
        return this._source;
    }
    isCompiled() {
        return this._compiledScript;
    }
    hasAsyncInstructions() {
        return true;
    }
    compile() {
        try {
            this._compiler.cancel();
        }
        catch (e) { }
        try {
            var self = this;
            logger.gears("Compiling", this._filename);
            this._compiler = new Compiler_1.Compiler(this._nhp);
            this._compiler.compile(fs.createReadStream(this._filename), function (err) {
                try {
                    if (err)
                        throw err;
                    var firstTime = !self._compiledScript;
                    self._compiler.optimize(self._nhp.constants, function (err) {
                        try {
                            if (err) {
                                logger.warning(err);
                                throw new Error("Failed to optimize: " + self._filename + ": " + err);
                            }
                            self._source = "" + self._compiler.generateSource();
                            if (USE_VM)
                                self._compiledScript = vm.createScript(self._source, self._filename);
                            else {
                                var match, inquote = false, variables = [];
                                var reg = /(\\?["']|(^|\b)([$A-Z_][0-9A-Z_$]*)(\.[$A-Z_][0-9A-Z_$]*)*(\b|$))/gi;
                                while (match = reg.exec(self._source)) {
                                    if (inquote) {
                                        if (match[0] == "\\\"" || match[0] == "\\'")
                                            continue;
                                        if (inquote == match[0])
                                            inquote = false;
                                        else
                                            continue;
                                    }
                                    else if (match[0] == "\"" || match[0] == "'")
                                        inquote = match[0];
                                    else if (variables.indexOf(match[3]) == -1 &&
                                        IGNORED_KEYWORDS.indexOf(match[3]) == -1)
                                        variables.push(match[3]);
                                    else
                                        continue;
                                }
                                var modifiedSource = "(function(vmc) {";
                                variables.forEach(function (variable) {
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
                            delete self._compiler;
                        }
                        catch (e) {
                            logger.error("Failed to compile", self._filename, self._source, e);
                            self.emit("error", e);
                        }
                    });
                }
                catch (e) {
                    logger.warning("Failed to optimize", self._filename, e);
                    if (!self._compiledScript)
                        self._compiledScript = e;
                    self.emit("error", e);
                }
            });
        }
        catch (e) {
            logger.warning("Failed to compile", self._filename, e);
            if (!self._compiledScript)
                self._compiledScript = e;
            self.emit("error", e);
        }
    }
    run(context, out, callback, contextIsVMC) {
        if (!this._compiledScript)
            throw new Error("Not compiled yet");
        if (this._compiledScript instanceof Error)
            throw this._compiledScript;
        var vmc;
        if (contextIsVMC) {
            vmc = context;
            delete vmc.cache;
            var oldDone = vmc.__done;
            vmc.__done = function (err) {
                try {
                    callback(err);
                }
                finally {
                    vmc.__done = oldDone;
                    callback = function () { };
                }
            };
        }
        else {
            if (context && context.cache) {
                var cache;
                if (context.cache === true)
                    context.cache = crypto.createHash('md5').update(JSON.stringify(options, function (key, val) {
                        if (key == "cache")
                            return;
                        return val;
                    })).digest("hex");
                if (cache = this._cache[context.cache]) {
                    out.write(cache);
                    return callback(undefined);
                }
                const cb = callback;
                cache = context.cache;
                out = new SplitBufferedWritable(out);
                callback = (err) => {
                    if (err)
                        cb(err);
                    else {
                        this._cache[cache] = out.buffer;
                        cb();
                    }
                };
                context.cache == true;
            }
            vmc = USE_VM ? vm.createContext() : {};
            _.merge(vmc, this._nhp.constants);
            vmc.env = {};
            var self = this;
            var options = this._nhp.options;
            if (options.tidyOutput) {
                var realOut = out, parser;
                var inTag = function (regex) {
                    try {
                        parser._stack.forEach(function (tag) {
                            if (regex.test(tag))
                                throw Template.$break;
                        });
                    }
                    catch (e) {
                        if (e !== Template.$break)
                            throw e;
                        return true;
                    }
                    return false;
                };
                var tagCache = {};
                var updateTagCache = function () {
                    tagCache.echo = (tagCache.raw = inTag(Template.rawElements)) || inTag(Template.echoElements);
                };
                var validComment;
                var textTidyBuffer = "";
                if (options.tidyComments) {
                    if (options.tidyComments == "not-if")
                        validComment = /^\[if .+$/;
                    else
                        validComment = false;
                }
                else
                    validComment = /.+/;
                var endsInSpace = /^.*\s$/, startsWithSpace = /^\s.*$/, endSpace = true;
                var dumpBuffer = function () {
                    if (textTidyBuffer) {
                        textTidyBuffer = textTidyBuffer.replace(/\s+/gm, " ");
                        var _endSpace = endsInSpace.test(textTidyBuffer);
                        if (endSpace && startsWithSpace.test(textTidyBuffer))
                            textTidyBuffer = textTidyBuffer.substring(1);
                        if (textTidyBuffer) {
                            realOut.write(textTidyBuffer);
                            textTidyBuffer = "";
                        }
                        endSpace = _endSpace;
                    }
                };
                parser = vmc.__out = new htmlparser2.Parser({
                    onopentag: function (name, attribs) {
                        dumpBuffer();
                        updateTagCache();
                        realOut.write("<" + name);
                        for (var key in attribs) {
                            var value = attribs[key];
                            if (options.tidyAttribs.indexOf(value) > -1)
                                continue;
                            realOut.write(" " + key + "=\"" + value + "\"");
                        }
                        if (Compiler_1.Compiler.isVoidElement(name))
                            realOut.write(" />");
                        else
                            realOut.write(">");
                    },
                    ontext: function (text) {
                        if (tagCache.raw)
                            realOut.write(text);
                        else
                            textTidyBuffer += text;
                    },
                    onclosetag: function (name) {
                        if (!Compiler_1.Compiler.isVoidElement(name)) {
                            dumpBuffer();
                            realOut.write("</" + name + ">");
                        }
                        updateTagCache();
                    },
                    onprocessinginstruction: function (name, data) {
                        dumpBuffer();
                        realOut.write("<" + data + ">\n");
                    },
                    oncomment: function (data) {
                        if (validComment && validComment.test(data)) {
                            dumpBuffer();
                            realOut.write("<!--" + data + "-->");
                        }
                    },
                    onerror: function (err) {
                        logger.warning(err);
                        callback(err);
                        callback = function () { };
                    },
                    onend: function () {
                        realOut.end();
                    }
                });
            }
            else
                vmc.__out = out;
            vmc._ = _;
            vmc.__ = function (text) {
                return text;
            };
            vmc.__done = function () {
                callback();
                callback = function () { };
            };
            vmc.__series = async.series;
            vmc.__dirname = this._dirname;
            vmc.__filename = this._filename;
            vmc.__each = function (eachOf, iterator, callback) {
                var calls = 0;
                var iterate = function (entry, callback) {
                    if (calls++ >= 50) {
                        process.nextTick(function () {
                            iterator(entry, callback);
                        });
                        calls = 0;
                    }
                    else
                        iterator(entry, callback);
                };
                if (_.isArray(eachOf)) {
                    if (eachOf.length > 50)
                        async.eachSeries(eachOf, iterate, callback);
                    else
                        async.eachSeries(eachOf, iterator, callback);
                }
                else if (_.isObject(eachOf))
                    async.eachSeries(_.keys(eachOf), function (key, callback) {
                        iterator({
                            "key": key,
                            "value": eachOf[key]
                        }, callback);
                    }, callback);
                else
                    callback();
            };
            vmc.__if = function (segments, callback) {
                var __next, i = 0;
                __next = function () {
                    if (i < segments.length) {
                        var segment = segments[i++];
                        if (segment[0]())
                            async.series(segment[1], callback);
                        else
                            __next();
                    }
                    else
                        callback();
                };
                __next();
            };
            vmc.__add = function (to, what) {
                var arr = vmc.env[to];
                if (!_.isArray(arr))
                    vmc.env[to] = arr = [];
                arr.push(what);
            };
            vmc.__set = function (what, to) {
                vmc.env[what] = to;
            };
            vmc.__map = function (what, at, to) {
                var map = vmc.env[what];
                if (!_.isObject(map))
                    vmc.env[what] = map = {};
                map[at] = to;
            };
            vmc.__get = function (what) {
                return vmc.env[what];
            };
            vmc.__error = function (err, attr, triple) {
                err = "" + err;
                if (attr) {
                    if (triple)
                        return encodeURIComponent(err).replace("%20", "+");
                    return Template.encodeHTML(err, true);
                }
                return "<error>" + Template.encodeHTML(err) + "</error>";
            };
            vmc.__include = function (file, cb) {
                logger.info("Including", file);
                var template = self._nhp.template(path.resolve(self._dirname, file));
                if (template.isCompiled())
                    process.nextTick(function () {
                        template.run(vmc, out, cb, true);
                    });
                else {
                    var timeout;
                    var onCompiled, onError;
                    const _cb = function () {
                        template.removeListener("compiled", onCompiled);
                        template.removeListener("error", onError);
                        cb();
                    };
                    template.once("compiled", onCompiled = function () {
                        timeout = setTimeout(function () {
                            template.run(vmc, out, _cb, true);
                        }, 100);
                    });
                    template.once("error", onError = function (err) {
                        try {
                            clearTimeout(timeout);
                        }
                        catch (e) { }
                        out.write(vmc.__error(err));
                        logger.warning(err);
                        _cb();
                    });
                }
            };
            vmc.__encode = Template.encodeHTML;
            vmc.__resolver = function (name, callback) {
                self._nhp.resolver(name)(callback);
            };
            vmc.__string = function (data, attr, triple) {
                data = "" + data;
                if (attr) {
                    if (triple)
                        return encodeURIComponent(data).replace("%20", "+");
                    return Template.encodeHTML(data, true);
                }
                else if (triple)
                    return data;
                return Template.encodeHTML(data);
            };
            _.merge(vmc, context);
        }
        this._compiledScript.runInContext(vmc);
    }
}
Template.echoElements = /(title|body|error)/;
Template.rawElements = /(textarea|script|style|pre)/;
Template.$break = new Object();
exports.Template = Template;
//# sourceMappingURL=Template.js.map