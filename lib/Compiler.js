"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var htmlparser2 = require("htmlparser2");
var log = require("nulllogger");
var domain = require("domain");
var stream = require("stream");
var _ = require("lodash");
var Moustache_1 = require("./Instructions/Moustache");
var MoustacheResolver_1 = require("./Instructions/MoustacheResolver");
var Translate_1 = require("./Instructions/Translate");
var Echo_1 = require("./Instructions/Echo");
var logger = log("nhp");
var Compiler = (function () {
    function Compiler(nhp) {
        this._instructions = [];
        this._nhp = nhp;
    }
    Compiler.isVoidElement = function (el) {
        return Compiler.voidElements.indexOf(el) > -1;
    };
    Compiler.compileText = function (text, compiler, attrib) {
        if (attrib === void 0) { attrib = false; }
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
                break;
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
        if (at < text.length)
            compiler._instructions.push(attrib ? new Echo_1.Echo(text.substring(at)) : new Translate_1.Translate(text.substring(at)));
    };
    Compiler.prototype.compile = function (source, callback) {
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
    };
    Compiler.prototype.generateSource = function () {
        var stack = [{
                first: true,
                popped: false,
                pushed: false
            }];
        var stackControl = {
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
        var source = "__series([";
        this._instructions.forEach(function (instruction) {
            var instructionSource = instruction.generateSource(stackControl);
            var frame = stack[stack.length - 1];
            if (!frame.popped) {
                if (frame.first)
                    frame.first = false;
                else
                    source += ",";
            }
            if (frame.pushed)
                frame.first = true;
            if (!frame.popped)
                source += "function(__next){";
            else
                delete frame.popped;
            source += instructionSource;
            if (!frame.pushed)
                source += "}";
            else
                delete frame.pushed;
        });
        source += "], __done);";
        return source;
    };
    Compiler.prototype.optimize = function (constants, callback) {
        var cBuffer = "";
        var optimized = [];
        this._instructions.forEach(function (instruction) {
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
        callback();
    };
    Compiler.prototype.cancel = function () {
        try {
            this.cancelActive();
        }
        catch (e) { }
    };
    Compiler.resolverRegex = /^\#/;
    Compiler.logicRegex = /^\?.+\?$/;
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
    return Compiler;
}());
exports.Compiler = Compiler;
//# sourceMappingURL=Compiler.js.map