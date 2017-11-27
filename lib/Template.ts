/// <reference types="node" />

import log = require("nulllogger");
import htmlparser2 = require("htmlparser2");
import chokidar = require("chokidar");
import events = require("events");
import { Writable } from "stream";
import crypto = require('crypto');
import async = require("async");
import path = require("path");
import _ = require("lodash");
import fs = require("fs");

const logger = new log("nhp");

var IGNORED_KEYWORDS = ['JSON', 'Array', 'Date', "abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield", "__next"];

import {NHP} from "./NHP";
import {Compiler} from "./Compiler";

class BufferedWritable extends Writable {
    buffer = "";
    _write(chunk: any, encoding: string, callback: Function) {
        this.buffer += chunk.toString("utf8");
        callback();
    }
}
class SplitBufferedWritable extends Writable {
    buffer = "";
    out: NodeJS.WritableStream;
    constructor(out: NodeJS.WritableStream) {
        super();
        this.out = out;
    }
    _write(chunk: any, encoding: string, callback: (err?: Error) => void) {
        this.buffer += chunk.toString("utf8");
        this.out.write(chunk, encoding, callback);
    }
}
export class Template extends events.EventEmitter {
    private static echoElements = /(title|body|error)/;
    private static rawElements = /(textarea|script|style|pre)/;
    private static $break = new Object();

    private _nhp: NHP;
    private _source: string;
    private _compiledScript: (context: any, callback: (err?: Error) => void) => void;
    private _dirname: string;
    private _filename: string;
    private _compiler: Compiler;
    private _fswatcher: chokidar.FSWatcher;
    private _cache: {
        [index: string]: string
    } = {};
    constructor(filename: string, nhp: NHP, mutable = true) {
        super();

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

        this.addListener("error", function(err: Error) {
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
    public render(locals: any, cb: (err?: Error, html?: string) => void) {
        const bufferedWritable = new BufferedWritable();
//        if(locals && locals.cache) {
//            var cache;
//            if(locals.cache === true)
//                locals.cache = crypto.createHash('md5').update(JSON.stringify(locals)).digest("hex");
//            if(cache = this._cache[locals.cache])
//                return cb(undefined, cache);
//        }
        this.renderToStream(locals, bufferedWritable, function(err?: Error) {
            if(err)
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
    public renderToStream(locals: any, stream: NodeJS.WritableStream, cb: (err?: Error) => void) {
        if (this.isCompiled())
            this.run(locals, stream, cb);
        else {
            var onCompiled: Function, onError: Function;
            this.on("compiled", onCompiled = () => {
                this.removeListener("compiled", onCompiled as any);
                this.removeListener("error", onError as any);
                this.run(locals, stream, cb);
            });
            this.on("error", onError = (err: Error) => {
                this.removeListener("compiled", onCompiled as any);
                this.removeListener("error", onError as any);
                cb(err);
            });
        }
    }

    public static encodeHTML(html: string, attr: boolean = false) {
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
    public getSource() {
        return this._source;
    }

    /**
     * Check whether this template has been compiled or not.
     * 
     * @returns True if compiled, False otherwise.
     */
    public isCompiled() {
        return !!this._compiledScript;
    }

    private compile() {
        try {
            // Stop the active compiler, if any
            this._compiler.cancel();
        } catch (e) {}

        try {
            var self = this;
            logger.gears("Compiling", this._filename);
            this._compiler = new Compiler(this._nhp);
            this._compiler.compile(fs.createReadStream(this._filename), function (err: Error) {
                try {
                    if (err) throw err;
                    var firstTime = !self._compiledScript;

                    self._compiler.optimize(self._nhp.constants, function (err: Error) {
                        try {
                            if (err) {
                                logger.warning(err);
                                throw new Error("Failed to optimize: " + self._filename + ": " + err);
                            }

                            self._source = "" + self._compiler.generateSource();
                            var match: any, inquote: any = false, variables: Array<String> = [];
                            var reg = /(\\?["']|(^|\b)([$A-Z_][0-9A-Z_$]*)(\.[$A-Z_][0-9A-Z_$]*)*(\b|$))/gi;
                            while (match = reg.exec(self._source)) {
                                if (inquote) {
                                    if (match[0] == "\\\"" || match[0] == "\\'")
                                        continue;
                                    if (inquote == match[0])
                                        inquote = false;
                                    else
                                        continue;
                                } else if (match[0] == "\"" || match[0] == "'")
                                    inquote = match[0];
                                else if (variables.indexOf(match[3]) == -1 &&
                                    IGNORED_KEYWORDS.indexOf(match[3]) == -1)
                                    variables.push(match[3]);
                                else
                                    continue;
                            }

                            const basename = path.basename(self._filename);
                            var modifiedSource = "(function " + basename.replace(/\W+/g, "_") + "(vmc, __next) {"
                            variables.forEach(function (variable) {
                                modifiedSource += "const " + variable + " = vmc." + variable + ";";
                            });
                            modifiedSource += self._source + "})\n//# sourceURL=" + path.basename(self._filename) + ".js";
                            self._compiledScript = eval(modifiedSource);

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

    
    protected run(context: any, out: NodeJS.WritableStream, callback: (err?: Error) => void) {
        if (!this._compiledScript)
            throw new Error("Not compiled yet");
        if (this._compiledScript instanceof Error)
            throw this._compiledScript;

        var vmc: {
            env: any,
            __next: Function,
            __out: htmlparser2.Parser,
            [key: string]: any
        };
        
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
        
        vmc = {} as any;
        _.assign(vmc, this._nhp.constants);
        vmc.env = vmc.env || {};

        var self = this;
        var options = this._nhp.options;
        if (options.tidyOutput) {
            var realOut = out, parser: htmlparser2.Parser & {
                _stack: string[]
            };
            var inTag = function (regex: RegExp) {
                try {
                    parser._stack.forEach(function (tag: string) {
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
            var tagCache: any = {};
            var updateTagCache = function () {
                tagCache.echo = (tagCache.raw = inTag(Template.rawElements)) || inTag(Template.echoElements);
            };
            var validComment: any;
            var textTidyBuffer = "";
            if (options.tidyComments) {
                if (options.tidyComments == "not-if")
                    validComment = /^\[if .+$/;
                else
                    validComment = false;
            } else
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
            }
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
                    if (Compiler.isVoidElement(name))
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
                    if (!Compiler.isVoidElement(name)) {
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
                    callback = function () {};
                },
                onend: function () {
                    realOut.end();
                }
            }) as any;
        } else
            vmc.__out = out as any;
        vmc._ = _;
        vmc.__ = function (text: String): String{
            return text;
        };
        vmc.__series = async.series;
        vmc.__dirname = this._dirname;
        vmc.__filename = this._filename;
        vmc.__each = function (eachOf: any, iterator: (entry: any, callback: Function) => void, callback: (err?: Error) => void) {
            var calls = 0;
            if (_.isArray(eachOf)) {
                if (eachOf.length > 50)
                    async.eachSeries(eachOf, function (entry: any, callback: Function) {
                        if (!(calls++ % 50))
                            process.nextTick(function () {
                                iterator(entry, callback);
                            });
                        else
                            iterator(entry, callback);
                    }, callback);
                else
                    async.eachSeries(eachOf, iterator, callback);
            } else if (_.isObject(eachOf))
                async.eachSeries(_.keys(eachOf), function (key, callback) {
                    iterator({
                        "key": key,
                        "value": eachOf[key]
                    }, callback);
                }, callback);
            else
                callback(); // Silently fail
        };
        vmc.__add = function (to: string, what: any) {
            var arr = vmc.env[to];
            if (!_.isArray(arr))
                vmc.env[to] = arr = [];
            arr.push(what);
        };
        vmc.__set = function (what: string, to: any) {
            vmc.env[what] = to;
        };
        vmc.__map = function (what: string, at: string, to: any) {
            var map = vmc.env[what];
            if (!_.isObject(map))
                vmc.env[what] = map = {};
            map[at] = to;
        };
        vmc.__get = function (what: string) {
            return vmc.env[what];
        };
        vmc.__error = function (err: any, attr: any, triple: any) {
            err = "" + err;
            if (attr) {
                if (triple)
                    return encodeURIComponent(err).replace("%20", "+");
                return Template.encodeHTML(err, true);
            }
            return "<error>" + Template.encodeHTML(err) + "</error>";
        }
        vmc.__include = function (file: any, _cb: any, root?: string) {
            const cb = function(err?: Error) {
                if (err)
                    vmc.__out.write(vmc.__error(err));
                _cb();
            }
            var template = self._nhp.template(path.resolve(root || self._dirname, file));
            if (template.isCompiled())
                template._compiledScript(vmc, cb);
            else {
                var onCompiled: Function, onError: Function;
                template.once("compiled", onCompiled = function () {
                    template.removeListener("compiled", onCompiled as any);
                    template.removeListener("error", onError as any);
                    template._compiledScript(vmc, cb);
                });
                template.once("error", onError = function (err: Error) {
                    template.removeListener("compiled", onCompiled as any);
                    template.removeListener("error", onError as any);
                    out.write(vmc.__error(err));
                    logger.warning(err);
                    cb();
                });
            }
        }
        vmc.__encode = Template.encodeHTML;
        vmc.__resolver = function (name: string, callback: Function) {
            self._nhp.resolver(name)(callback);
        }
        vmc.__string = function (data: string, attr: boolean, triple: boolean) {
            data = "" + data;
            if (attr) {
                if (triple)
                    return encodeURIComponent(data).replace("%20", "+");
                return Template.encodeHTML(data, true);
            } else if (triple)
                return data;
            return Template.encodeHTML(data);
        }
        _.assign(vmc, context);
        
        this._compiledScript(vmc, callback);
    }
    
    destroy() {
        if (this._fswatcher)
            this._fswatcher.close();
    }
}