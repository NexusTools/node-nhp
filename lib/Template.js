"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
const htmlparser2 = require("htmlparser2");
const chokidar = require("chokidar");
const events = require("events");
const stream_1 = require("stream");
const async = require("async");
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const logger = new log("nhp");
var IGNORED_KEYWORDS = ['__updateVars', 'JSON', 'Array', 'Date', "abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield", "__next", "vmc", "env"];
const Compiler_1 = require("./Compiler");
const readSourceFiles = process.env.NHP_READ_SOURCE;
const writeSourceFiles = process.env.NHP_WRITE_SOURCE;
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
class Template extends events.EventEmitter {
    constructor(filename, nhp, mutable = true) {
        super();
        this._cache = {};
        this._nhp = nhp;
        this._filename = filename;
        this._dirname = path.dirname(filename);
        if (mutable) {
            const fswatcher = this._fswatcher = chokidar.watch(this._filename, {
                awaitWriteFinish: {
                    stabilityThreshold: 400,
                    pollInterval: 2000
                }
            });
            fswatcher.on("change", () => this.compile());
        }
        this.addListener("error", function (err) {
            logger.warn(err);
        });
        this.compile();
    }
    /**
     * Render this template and return HTML.
     *
     * @param locals The locals to use for rendering
     * @param cb The callback
     */
    render(locals, cb) {
        const bufferedWritable = new BufferedWritable();
        //        if(locals && locals.cache) {
        //            var cache;
        //            if(locals.cache === true)
        //                locals.cache = crypto.createHash('md5').update(JSON.stringify(locals)).digest("hex");
        //            if(cache = this._cache[locals.cache])
        //                return cb(undefined, cache);
        //        }
        this.renderToStream(locals, bufferedWritable, function (err) {
            if (err)
                cb(err);
            else
                cb(undefined, bufferedWritable.buffer);
        });
    }
    /**
     * Render this template to a stream.
     *
     * @param locals The locals to use for rendering
     * @param stream The target stream
     * @param cb The callback
     */
    renderToStream(locals, stream, cb) {
        if (this.isCompiled())
            this.run(locals, stream, cb);
        else {
            var onCompiled, onError;
            this.on("compiled", onCompiled = () => {
                this.removeListener("compiled", onCompiled);
                this.removeListener("error", onError);
                this.run(locals, stream, cb);
            });
            this.on("error", onError = (err) => {
                this.removeListener("compiled", onCompiled);
                this.removeListener("error", onError);
                cb(err);
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
    /**
     * Get the last successfully generated JavaScript source for this template.
     *
     * @returns The source, or undefined if not compiled yet or an error occured.
     */
    getSource() {
        return this._source;
    }
    /**
     * Check whether this template has been compiled or not.
     *
     * @returns True if compiled, False otherwise.
     */
    isCompiled() {
        return !!this._compiledScript;
    }
    compile() {
        try {
            // Stop the active compiler, if any
            this._compiler.cancel();
        }
        catch (e) { }
        try {
            var self = this;
            const jsfile = self._filename.replace(/\.nhp$/, "") + ".compiled.nhp.js";
            if (readSourceFiles)
                fs.readFile(jsfile, "utf8", function (err, source) {
                    try {
                        if (err)
                            throw err;
                        const data = JSON.parse(source);
                        self.variables = data.variables;
                        self._compiledScript = eval(data.source);
                        self.emit("compiled");
                        self.emit("updated");
                    }
                    catch (e) {
                        logger.warning("Failed to optimize", self._filename, e);
                        if (!self._compiledScript)
                            self._compiledScript = e;
                        self.emit("error", e);
                    }
                });
            else {
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
                                var ignoredStack = [];
                                var inCatchOrFunction = false;
                                var ignored = IGNORED_KEYWORDS.slice(0);
                                var match, inquote = false, variables = [];
                                var reg = /(\\?'|\\?"|}|(^|[\^~\/\%\=\<\>\|\&\!+\-\[{\s;\(]|\n)([$A-Z_][0-9A-Z_$]*)(\b|$)|{)/gi;
                                while (match = reg.exec(self._source)) {
                                    if (inCatchOrFunction) {
                                        const mat = match[3];
                                        if (/^{/.test(match[0])) {
                                            inCatchOrFunction = false;
                                            if (mat)
                                                if (variables.indexOf(mat) == -1 &&
                                                    ignored.indexOf(mat) == -1)
                                                    variables.push(mat);
                                        }
                                        else if (mat)
                                            ignored.push(mat);
                                    }
                                    else if (/^{/.test(match[0])) {
                                        ignoredStack.push(ignored.slice(0));
                                        const mat = match[3];
                                        if (mat && variables.indexOf(mat) == -1 &&
                                            ignored.indexOf(mat) == -1)
                                            variables.push(mat);
                                    }
                                    else if (match[0] == "}") {
                                        ignored = ignoredStack.pop();
                                    }
                                    else if (inquote) {
                                        if (match[0] == "\\\"" || match[0] == "\\'")
                                            continue;
                                        if (inquote == match[0])
                                            inquote = false;
                                        else
                                            continue;
                                    }
                                    else if (match[0] == "\"" || match[0] == "'")
                                        inquote = match[0];
                                    else {
                                        const mat = match[3];
                                        if (mat) {
                                            if (mat == "catch" || mat == "function") {
                                                ignoredStack.push(ignored.slice(0));
                                                inCatchOrFunction = true;
                                            }
                                            else {
                                                if (variables.indexOf(mat) == -1 &&
                                                    ignored.indexOf(mat) == -1)
                                                    variables.push(mat);
                                            }
                                        }
                                    }
                                }
                                var first = 1;
                                const basename = path.basename(self._filename);
                                var modifiedSource = "(function tmpl_" + basename.replace(/\W+/g, "_") + "(vmc, __next) {const env=vmc.env;var ";
                                variables.forEach(function (variable) {
                                    if (first)
                                        first = 0;
                                    else
                                        modifiedSource += ", ";
                                    modifiedSource += variable;
                                });
                                first = 1;
                                modifiedSource += ";const __updateVars = function() {";
                                variables.forEach(function (variable) {
                                    if (first)
                                        first = 0;
                                    else
                                        modifiedSource += ";";
                                    modifiedSource += variable + "=" + JSON.stringify(variable) + " in vmc?vmc." + variable + " : env." + variable;
                                });
                                modifiedSource += "};__updateVars();";
                                modifiedSource += self._source + "})\n//# sourceURL=" + path.basename(self._filename) + ".js";
                                self._compiledScript = eval(self._compiledSource = modifiedSource);
                                self.variables = variables;
                                if (firstTime)
                                    self.emit("compiled");
                                self.emit("updated");
                                logger.gears("Compiled", self._filename);
                                if (writeSourceFiles)
                                    fs.writeFile(jsfile, JSON.stringify({ variables, source: modifiedSource }), function (err) {
                                        if (err)
                                            logger.warning(err);
                                    });
                                delete self._compiler;
                            }
                            catch (e) {
                                logger.error("Failed to compile", self._filename, self._compiledSource || self._source, e);
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
        }
        catch (e) {
            logger.warning("Failed to compile", self._filename, e);
            if (!self._compiledScript)
                self._compiledScript = e;
            self.emit("error", e);
        }
    }
    run(context, out, callback) {
        if (!this._compiledScript)
            throw new Error("Not compiled yet");
        if (this._compiledScript instanceof Error)
            throw this._compiledScript;
        var vmc;
        //        if(context && context.cache) {
        //            var cache: string;
        //            if(context.cache === true)
        //                context.cache = crypto.createHash('md5').update(JSON.stringify(options, function(key, val) {
        //                    if(key == "cache")
        //                        return;
        //                    return val;
        //                })).digest("hex");
        //            if(cache = this._cache[context.cache]) {
        //                out.write(cache);
        //                return callback(undefined);
        //            }
        //
        //            const cb = callback;
        //            cache = context.cache;
        //            out = new SplitBufferedWritable(out);
        //            callback = (err?: Error) => {
        //                if(err)
        //                    cb(err);
        //                else {
        //                    this._cache[cache] = (out as SplitBufferedWritable).buffer;
        //                    cb();
        //                }
        //            }
        //            context.cache == true;
        //        }
        vmc = {};
        _.assign(vmc, this._nhp.constants);
        vmc.env = vmc.env || {};
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
                    realOut.write("<" + data + ">\n"); // Assume doctype
                    // TODO: Check if this is the first thing being written
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
        vmc.__series = async.series;
        vmc.__dirname = this._dirname;
        vmc.__filename = this._filename;
        vmc.__each = function (eachOf, iterator, callback) {
            var calls = 0;
            if (_.isArray(eachOf)) {
                if (eachOf.length > 50)
                    async.eachSeries(eachOf, function (entry, callback) {
                        if (!(calls++ % 50))
                            process.nextTick(function () {
                                iterator(entry, callback);
                            });
                        else
                            iterator(entry, callback);
                    }, callback);
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
                callback(); // Silently fail
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
        vmc.__include = function (file, _cb, root) {
            const cb = function (err) {
                if (err)
                    vmc.__out.write(vmc.__error(err));
                _cb();
            };
            var template = self._nhp.template(path.resolve(root || self._dirname, file));
            const compiledScript = template._compiledScript;
            if (compiledScript)
                compiledScript(vmc, cb);
            else {
                var onCompiled, onError;
                template.once("compiled", onCompiled = function () {
                    template.removeListener("compiled", onCompiled);
                    template.removeListener("error", onError);
                    if (template._compiledScript)
                        template._compiledScript(vmc, cb);
                    else
                        vmc.__out.write(vmc.__error(new Error("Template compiled emitted, but implementation is missing")));
                });
                template.once("error", onError = function (err) {
                    template.removeListener("compiled", onCompiled);
                    template.removeListener("error", onError);
                    out.write(vmc.__error(err));
                    logger.warning(err);
                    cb();
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
        _.assign(vmc, context);
        this._compiledScript(vmc, callback);
    }
    destroy() {
        if (this._fswatcher)
            this._fswatcher.close();
    }
}
Template.echoElements = /(title|body|error)/;
Template.rawElements = /(textarea|script|style|pre)/;
Template.$break = new Object();
exports.Template = Template;
//# sourceMappingURL=Template.js.map