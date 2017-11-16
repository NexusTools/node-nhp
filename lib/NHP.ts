/// <reference types="node" />

import _ = require("lodash");
import path = require("path");

import {Instruction} from "./Instruction";
import {Template} from "./Template";

import {Set} from "./Instructions/Set";
import {Add} from "./Instructions/Add";
import {Map} from "./Instructions/Map";

import {Exec} from "./Instructions/Exec";
import {JSON} from "./Instructions/JSON";

import {Each} from "./Instructions/Each";
import {Done} from "./Instructions/Done";
import {Custom} from "./Instructions/Custom";

import {If} from "./Instructions/If";
import {ElseIf} from "./Instructions/ElseIf";
import {Else} from "./Instructions/Else";
import {EndIf} from "./Instructions/EndIf";

import {Include} from "./Instructions/Include";

import {Echo} from "./Instructions/Echo";
import {Translate} from "./Instructions/Translate";

import {Moustache} from "./Instructions/Moustache";
import {MoustacheResolver} from "./Instructions/MoustacheResolver";

export interface Processor {
    (data: string): Instruction;
}

var extension = /\.\w+$/;
export interface NHPOptions {
    tidyAttribs?: string[];
    tidyComments?: string;
    tidyOutput?: boolean;
}
export class NHP {
    public static Instructions = {
        Set, Add, Map, Exec, JSON, Each, Done, If, ElseIf, Else, EndIf, Include, Moustache, MoustacheResolver, Echo, Translate, Custom
    };
    
    private static defaults: NHPOptions = {
        tidyAttribs: ["false", "null", "undefined"],
        tidyComments: "not-if",
        tidyOutput: true
    }

    constants: any;
    options: NHPOptions;
    private templates: {[index: string]: Template};
    private processors: {[index: string]: Processor};
    public static defaultProcessors: {[index: string]: Processor} = {
        "set": function (data: string) {
            return new Set(data);
        },
        "add": function (data: string) {
            return new Add(data);
        },
        "map": function (data: string) {
            return new Map(data);
        },

        "exec": function (source: string) {
            return new Exec(source);
        },
        "json": function (source: string) {
            return new JSON(source);
        },

        "each": function (data: string) {
            return new Each(data);
        },
        "done": function () {
            return new Done();
        },

        "if": function (condition: string) {
            return new If(condition);
        },
        "elseif": function (condition: string) {
            return new ElseIf(condition);
        },
        "else": function () {
            return new Else();
        },
        "endif": function () {
            return new EndIf();
        },

        "include": function (file: string) {
            return new Include(file);
        }
    };
    private resolvers: any;

    public static create(constants: Object) {
        return new NHP(constants);
    }

    public constructor(constants?: any, options?: NHPOptions) {
        if (!(this instanceof NHP))
            return new NHP(constants);

        Object.defineProperties(this, {
            processors: {
                value: {}
            },
            resolvers: {
                value: {}
            },
            templates: {
                value: {}
            },
            constants: {
                value: constants || {}
            },
            options: {
                value: {}
            }
        });
        _.merge(this.processors, NHP.defaultProcessors);
        _.merge(this.options, NHP.defaults);
        if (options)
            _.merge(this.options, options);
    }

    public processingInstruction(name: string, data: string) {
        const processor = this.processors[name];
        if (processor)
            return processor(data);
        throw new Error("No processor found with name `" + name + "`");
    }

    public resolver(name: string): any {
        const resolver = this.resolvers[name];
        if (resolver)
            return resolver;
        throw new Error("No resolver found with name `" + name + "`");
    }

    public installResolver(name: string, resolver: Function) {
        this.resolvers[name] = resolver;
    }
    
    public installProcessor(key: string, processor: Processor) {
        this.processors[key] = processor;
    }

    public setConstant(name: string, value: any) {
        if (this.hasConstant(name))
            throw new Error("Cannot redefine constant: " + name);
        this.constants[name] = value;
    }

    public hasConstant(name: string) {
        return name in this.constants;
    }

    public getConstant(name: string) {
        return this.constants[name];
    }

    public mixin(object: Object) {
        _.merge(this.constants, object);
    }

    public template(filename: string) {
        if (!extension.test(filename))
            filename += ".nhp";
        filename = path.resolve(filename);

        if (!(filename in this.templates))
            return this.templates[filename] = new Template(filename, this);

        return this.templates[filename];
    }

    public genSource(filename: string, options: any, cb: (err?: Error, source?: string) => void) {
        const template = this.template(filename);
        if (template.isCompiled())
            cb(undefined, template.getSource());
        else {
            var timeout: NodeJS.Timer;
            var onCompiled: Function, onError: Function;
            const _cb = function(err?: Error, source?: string) {
                template.removeListener("compiled", onCompiled as any);
                template.removeListener("error", onError as any);
                cb(err, source);
            }
            template.on("compiled", onCompiled = function() {
                timeout = setTimeout(function() {
                    _cb(undefined, template.getSource());
                }, 100);
            });
            template.on("error", onError = function(err: Error) {
                try{clearTimeout(timeout);}catch(e){}
                _cb(err);
            });
        }
    }

    public render(filename: string, options: any, cb: (err?: Error, html?: string) => void) {
        this.template(filename).render(options, cb);
    }

    public renderToStream(filename: string, options: any, stream: NodeJS.WritableStream, cb: (err?: Error) => void) {
        this.template(filename).renderToStream(options, stream, cb);
    }

    public static __express(options?: NHPOptions) {
        const nhp = new NHP({}, options);
        return nhp.render.bind(nhp);
    }

}