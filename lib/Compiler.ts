/// <reference types="node" />

import htmlparser2 = require("htmlparser2");
import log = require("nulllogger");
import domain = require("domain");
import stream = require("stream");
import _ = require("lodash");

import {Instruction} from "./Instruction"
import {NHP} from "./NHP"

// Instructions
import {Bundle} from "./Instructions/Bundle"
import {Moustache} from "./Instructions/Moustache"
import {MoustacheResolver} from "./Instructions/MoustacheResolver"
import {Translate} from "./Instructions/Translate"
import {Echo} from "./Instructions/Echo"

const logger = new log("nhp");

export class Compiler {
    private static resolverRegex = /^\#/;
    private static logicRegex = /^\?.+\?$/;
    _instructions: Array<Instruction> = [];
    private _nhp: NHP;

    // https://github.com/fb55/htmlparser2/blob/748d3da71dc664afb8357aabfe6c4a6f74644a0e/lib/Parser.js#L59
    private static voidElements = [
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

    public static isVoidElement(el: string) {
        return Compiler.voidElements.indexOf(el) > -1;
    }

    constructor(nhp: NHP) {
        this._nhp = nhp;
    }

    private static compileText(text: string, compiler: Compiler, attrib: boolean = false) {
        var at = 0, next: number;
        while ((next = text.indexOf("{{", at)) > -1) {
            var size: number;
            var raw: boolean;
            var end = -1;
            if (text.substring(next + 2, next + 3) == "{") {
                end = text.indexOf("}}}", next + (size = 3));
                raw = true;
            } else {
                end = text.indexOf("}}", next + (size = 2));
                raw = false;
            }
            if (end < 0)
                break; // No end, just output the malformed code...

            if (next > at) {
                var data = text.substring(next, at);
                compiler._instructions.push(new Echo(data.replace('"', "&quote;")));
            }

            var moustache = text.substring(next + size, end);
            if (Compiler.resolverRegex.test(moustache))
                compiler._instructions.push(new MoustacheResolver(moustache.substring(1), attrib, raw));
            else
                compiler._instructions.push(new Moustache(moustache, attrib, raw));
            at = end + size;
        }
        if (at < text.length) {
            const snippet = text.substring(at);
            compiler._instructions.push(attrib || !/[a-z]/i.test(snippet) ? new Echo(snippet) : new Translate(snippet));
        }
    }

    private cancelActive: Function;
    public compile(source: any, callback: Function) {
        try {
            this.cancelActive();
        } catch (e) {}
        var self = this;
        var parser: htmlparser2.Parser;
        var cancelled: boolean = false;
        this.cancelActive = function () {
            cancelled = true;
            try {
                source.unpipe(parser);
            } catch (e) {}
            callback = function () {}
            self.cancelActive = null;
        }
        var self = this;
        var d = domain.create();
        d.run(function () {
            if (_.isString(source)) {
                var nsource = new stream.Readable;
                nsource.push(source);
                nsource.push(null);
                source = nsource;
            } else if (!(source instanceof stream.Readable))
                throw "Source must be a readable stream or a string";
            d.add(source);

            parser = new htmlparser2.Parser({
                onopentag: function (name, attribs) {
                    logger.gears("onopentag", arguments);

                    self._instructions.push(new Echo("<" + name));
                    for (var key in attribs) {
                        self._instructions.push(new Echo(" " + key + "=\""));
                        Compiler.compileText(attribs[key], self, true);
                        self._instructions.push(new Echo("\""));
                    }
                    if (Compiler.isVoidElement(name))
                        self._instructions.push(new Echo(" />"));
                    else
                        self._instructions.push(new Echo(">"));
                },
                ontext: function (text) {
                    logger.gears("ontext", arguments);
                    Compiler.compileText(text, self);
                },
                onclosetag: function (name) {
                    logger.gears("onclosetag", arguments);
                    if (!Compiler.isVoidElement(name))
                        self._instructions.push(new Echo("</" + name + ">"));
                },
                onprocessinginstruction: function (name, data) {
                    try {
                        logger.gears("onprocessinginstruction", arguments);
                        if (Compiler.logicRegex.test(data)) {
                            if (name == data) {
                                name = name.substring(1, name.length - 1);
                                data = "";
                            } else {
                                data = data.substring(name.length + 1, data.length - 1);
                                name = name.substring(1);
                            }
                            self._instructions.push(self._nhp.processingInstruction(name, data));
                        } else
                            self._instructions.push(new Echo("<" + data + ">"));
                    } catch (e) {
                        logger.warning(e);
                        self._instructions.push(new Echo("<error>" + ("" + e).replace("<", "&lt;").replace(">", "&gt;") + "</error>"));
                    }
                },
                oncomment: function (data) {
                    logger.gears("oncomment", arguments);
                    self._instructions.push(new Echo("<!--" + data + "-->"));
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
            d.on("error", function (err: Error) {
                logger.warning(err);
                source.unpipe(parser);
                callback(err);
            });
            if (!cancelled)
                source.pipe(parser);
        });
    }

    public generateSource() {
        var stack: [{first: boolean, popped: boolean, pushed: boolean, data?: Object}] = [{
            first: true,
            popped: false,
            pushed: false,
            data: {}
        }];
        const stackControl = {
            push: function (data: Object = {}) {
                var frame = stack[stack.length - 1];
                stack.push({
                    first: frame.first,
                    popped: frame.popped,
                    pushed: true,
                    data
                });
            },
            pop: function (newData?: Object) {
                if (stack.length < 2)
                    throw new Error("Cannot pop anymore frames from the stack...");

                const data = stack.pop().data;
                const next = stack[stack.length - 1];
                if (next)
                    _.assign(next.data, newData);
                next.popped = true;
                return data;
            }
        };
        var source: string;
        var async = false;
        try {
            this._instructions.forEach(function (instruction: Instruction) {
                if (instruction.async)
                    throw true;
            });
        } catch(e) {
            if(e !== true)
                throw e;
            async = true;
        }
        
        if (async)
            source = "__series([";
        else
            source = "try{";
        this._instructions.forEach(function (instruction: Instruction) {
            var instructionSource = instruction.generateSource(stackControl, async);
            var frame = stack[stack.length - 1];

            if (frame.first)
                frame.first = false;
            else if (async && !frame.data['omitcomma'])
                source += ",";
            if (frame.pushed)
                frame.first = true;

            if (async) {
                if (frame.popped) {
                    source += "], __next)";
                } else if(async) {
                    source += "function(__next){";
                }
            }
                
            source += instructionSource;
            if (!frame.pushed) {
                if (async) {
                    if (!instruction.async && !frame.data['omitcb'])
                        source += "__next()";
                    source += "}";
                }
            } else if (async)
                source += "__series([";
            delete frame.data['omitcb'];
            delete frame.pushed;
            delete frame.popped;
        });
        if (async)
            source += "], __next)";
        else
            source += "__next()}catch(e){__next(e)}";
            
        return source;
    }

    public optimize(constants: any, callback: Function) {
        var cBuffer = "";
        var async = false;
        var optimized: Instruction[] = [];
        this._instructions.forEach(function (instruction) {
            async = async || instruction.async;
            if (instruction instanceof Echo)
                cBuffer += instruction._data;
            else {
                if (cBuffer.length > 0) {
                    optimized.push(new Echo(cBuffer));
                    cBuffer = "";
                }
                optimized.push(instruction);
            }
        });
        if (cBuffer.length > 0)
            optimized.push(new Echo(cBuffer));
        this._instructions = optimized;
        
        if (async) {
            optimized = [];
            var syncStack: Instruction[] = [];
            const dumpSyncStack = function() {
                if (syncStack.length) {
                    if (syncStack.length > 1)
                        optimized.push(new Bundle(syncStack));
                    else
                        optimized.push(syncStack[0]);
                    syncStack = [];
                }
            }
            this._instructions.forEach(function (instruction) {
                if (instruction.async || instruction.usesStackControl) {
                    dumpSyncStack();
                    optimized.push(instruction);
                } else
                    syncStack.push(instruction);
            });
            dumpSyncStack();
            this._instructions = optimized;
        }
        
        callback();
    }

    public cancel() {
        try {
            this.cancelActive();
        } catch (e) {}
    }

}
