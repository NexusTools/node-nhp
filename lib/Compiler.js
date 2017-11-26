"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const htmlparser2 = require("htmlparser2");
const log = require("nulllogger");
const domain = require("domain");
const stream = require("stream");
const _ = require("lodash");
// Instructions
const Bundle_1 = require("./Instructions/Bundle");
const Moustache_1 = require("./Instructions/Moustache");
const MoustacheResolver_1 = require("./Instructions/MoustacheResolver");
const Translate_1 = require("./Instructions/Translate");
const Echo_1 = require("./Instructions/Echo");
const logger = new log("nhp");
class Compiler {
    constructor(nhp) {
        this._instructions = [];
        this._nhp = nhp;
    }
    static isVoidElement(el) {
        return Compiler.voidElements.indexOf(el) > -1;
    }
    static compileText(text, compiler, attrib = false) {
        var at = 0, next;
        while ((next = text.indexOf("{{", at)) > -1) {
            var size;
            var raw;
            var end = -1;
            if (text.substring(next + 2, next + 3) == "{") {
                end = text.indexOf("}}}", next + (size = 3));
                raw = true;
            }
            else {
                end = text.indexOf("}}", next + (size = 2));
                raw = false;
            }
            if (end < 0)
                break; // No end, just output the malformed code...
            if (next > at) {
                var data = text.substring(next, at);
                compiler._instructions.push(new Echo_1.Echo(data.replace('"', "&quote;")));
            }
            var moustache = text.substring(next + size, end);
            if (Compiler.resolverRegex.test(moustache))
                compiler._instructions.push(new MoustacheResolver_1.MoustacheResolver(moustache.substring(1), attrib, raw));
            else
                compiler._instructions.push(new Moustache_1.Moustache(moustache, attrib, raw));
            at = end + size;
        }
        if (at < text.length) {
            const snippet = text.substring(at);
            compiler._instructions.push(attrib || !/[a-z]/i.test(snippet) ? new Echo_1.Echo(snippet) : new Translate_1.Translate(snippet));
        }
    }
    compile(source, callback) {
        try {
            this.cancelActive();
        }
        catch (e) { }
        var self = this;
        var parser;
        var cancelled = false;
        this.cancelActive = function () {
            cancelled = true;
            try {
                source.unpipe(parser);
            }
            catch (e) { }
            callback = function () { };
            self.cancelActive = null;
        };
        var self = this;
        var d = domain.create();
        d.run(function () {
            if (_.isString(source)) {
                var nsource = new stream.Readable;
                nsource.push(source);
                nsource.push(null);
                source = nsource;
            }
            else if (!(source instanceof stream.Readable))
                throw "Source must be a readable stream or a string";
            d.add(source);
            parser = new htmlparser2.Parser({
                onopentag: function (name, attribs) {
                    logger.gears("onopentag", arguments);
                    self._instructions.push(new Echo_1.Echo("<" + name));
                    for (var key in attribs) {
                        self._instructions.push(new Echo_1.Echo(" " + key + "=\""));
                        Compiler.compileText(attribs[key], self, true);
                        self._instructions.push(new Echo_1.Echo("\""));
                    }
                    if (Compiler.isVoidElement(name))
                        self._instructions.push(new Echo_1.Echo(" />"));
                    else
                        self._instructions.push(new Echo_1.Echo(">"));
                },
                ontext: function (text) {
                    logger.gears("ontext", arguments);
                    Compiler.compileText(text, self);
                },
                onclosetag: function (name) {
                    logger.gears("onclosetag", arguments);
                    if (!Compiler.isVoidElement(name))
                        self._instructions.push(new Echo_1.Echo("</" + name + ">"));
                },
                onprocessinginstruction: function (name, data) {
                    try {
                        logger.gears("onprocessinginstruction", arguments);
                        if (Compiler.logicRegex.test(data)) {
                            if (name == data) {
                                name = name.substring(1, name.length - 1);
                                data = "";
                            }
                            else {
                                data = data.substring(name.length + 1, data.length - 1);
                                name = name.substring(1);
                            }
                            self._instructions.push(self._nhp.processingInstruction(name, data));
                        }
                        else
                            self._instructions.push(new Echo_1.Echo("<" + data + ">"));
                    }
                    catch (e) {
                        logger.warning(e);
                        self._instructions.push(new Echo_1.Echo("<error>" + ("" + e).replace("<", "&lt;").replace(">", "&gt;") + "</error>"));
                    }
                },
                oncomment: function (data) {
                    logger.gears("oncomment", arguments);
                    self._instructions.push(new Echo_1.Echo("<!--" + data + "-->"));
                },
                oncommentend: function () {
                    logger.gears("oncommentend", arguments);
                },
                onerror: function (err) {
                    logger.gears("onerror", arguments);
                    callback(err);
                },
                onend: function () {
                    logger.gears("onend", arguments);
                    callback();
                }
            });
            d.on("error", function (err) {
                logger.warning(err);
                source.unpipe(parser);
                callback(err);
            });
            if (!cancelled)
                source.pipe(parser);
        });
    }
    generateSource() {
        var stack = [{
                first: true,
                popped: false,
                pushed: false
            }];
        const stackControl = {
            push: function () {
                var frame = stack[stack.length - 1];
                stack.push({
                    first: frame.first,
                    popped: frame.popped,
                    pushed: true
                });
            },
            pop: function () {
                if (stack.length < 2)
                    throw new Error("Cannot pop anymore frames from the stack...");
                stack.pop();
                stack[stack.length - 1].popped = true;
            }
        };
        var source = "";
        var async = false;
        try {
            this._instructions.forEach(function (instruction) {
                if (instruction.async)
                    throw true;
            });
        }
        catch (e) {
            if (e !== true)
                throw e;
            async = true;
        }
        if (async)
            source += "__series([";
        this._instructions.forEach(function (instruction) {
            var instructionSource = instruction.generateSource(stackControl);
            var frame = stack[stack.length - 1];
            if (!frame.popped) {
                if (frame.first)
                    frame.first = false;
                else if (async)
                    source += ",";
            }
            if (frame.pushed)
                frame.first = true;
            if (!frame.popped) {
                if (async)
                    source += "function(__next){";
            }
            else {
                source += "], __next)";
            }
            source += instructionSource;
            if (!frame.pushed) {
                if (async) {
                    if (!instruction.async && !frame.popped)
                        source += "__next()";
                    source += "}";
                }
            }
            else if (async)
                source += "__series([";
            delete frame.pushed;
            delete frame.popped;
        });
        if (async)
            source += "], __next)";
        else
            source += "__next()";
        return source;
    }
    optimize(constants, callback) {
        var cBuffer = "";
        var async = false;
        var optimized = [];
        this._instructions.forEach(function (instruction) {
            async = async || instruction.async;
            if (instruction instanceof Echo_1.Echo)
                cBuffer += instruction._data;
            else {
                if (cBuffer.length > 0) {
                    optimized.push(new Echo_1.Echo(cBuffer));
                    cBuffer = "";
                }
                optimized.push(instruction);
            }
        });
        if (cBuffer.length > 0)
            optimized.push(new Echo_1.Echo(cBuffer));
        this._instructions = optimized;
        if (async) {
            optimized = [];
            var syncStack = [];
            const dumpSyncStack = function () {
                if (syncStack.length) {
                    if (syncStack.length > 1)
                        optimized.push(new Bundle_1.Bundle(syncStack));
                    else
                        optimized.push(syncStack[0]);
                    syncStack = [];
                }
            };
            this._instructions.forEach(function (instruction) {
                if (instruction.async || instruction.usesStackControl) {
                    dumpSyncStack();
                    optimized.push(instruction);
                }
                else
                    syncStack.push(instruction);
            });
            dumpSyncStack();
            this._instructions = optimized;
        }
        callback();
    }
    cancel() {
        try {
            this.cancelActive();
        }
        catch (e) { }
    }
}
Compiler.resolverRegex = /^\#/;
Compiler.logicRegex = /^\?.+\?$/;
// https://github.com/fb55/htmlparser2/blob/748d3da71dc664afb8357aabfe6c4a6f74644a0e/lib/Parser.js#L59
Compiler.voidElements = [
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
    //common self closing svg elements
    "path",
    "circle",
    "ellipse",
    "line",
    "rect",
    "use",
    "stop",
    "polyline",
    "polygone"
];
exports.Compiler = Compiler;
//# sourceMappingURL=Compiler.js.map