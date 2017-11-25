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
    /**
     * References to the built in Instructions
     */
    public static readonly Instructions = {
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

    /**
     * Return a processing instruction for a processor by name and with data.
     * 
     * @param name The name of the processor
     * @param data The data to pass to the processor
     */
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
    
    /**
     * Install a processor for key.
     * 
     * @param key The key to use
     * @param processor The processor to install
     */
    public installProcessor(key: string, processor: Processor) {
        this.processors[key] = processor;
    }

    /**
     * Set or update a constant.
     * 
     * @param key The key for the constant
     * @param value The value of the constant
     */
    public setConstant(key: string, value: any) {
        if (this.hasConstant(key))
            throw new Error("Cannot redefine constant: " + key);
        this.constants[key] = value;
    }

    /**
     * Check whether or not a specific constant is set for a given key.
     * 
     * @param key The key
     * @returns true if key is set, false otherwise
     */
    public hasConstant(key: string) {
        return key in this.constants;
    }
    
    /**
     * Delete a constant for a specific key
     * 
     * @param key The key
     * @returns true if deleted, false otherwise
     */
    public deleteConstant(key: string) {
        return delete this.constants[key];
    }

    /**
     * Retreive a constant by key.
     * 
     * @param key The key
     * @returns The value of the constant, or undefined
     */
    public constant(name: string) {
        return this.constants[name];
    }

    /**
     * Assign the source object's properties to the constants for this NHP instance.
     * 
     * @param object The source object
     */
    public assignConstants(object: Object) {
        _.assignIn(this.constants, object);
    }

    /**
     * Create or retreive a template associated to this NHP instance.
     * 
     * @param filename The template filename
     * @param mutable Whether or not to watch for changes, true by default
     */
    public template(filename: string, mutable = true) {
        if (!extension.test(filename))
            filename += ".nhp";
        filename = path.resolve(filename);

        if (!(filename in this.templates))
            return this.templates[filename] = new Template(filename, this, mutable);

        return this.templates[filename];
    }

    /**
     * Generate JavaScript source for a given NHP template.
     * 
     * @param filename The template filename
     * @param cb The callback
     */
    public genSource(filename: string, cb: (err?: Error, source?: string) => void) {
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

    /**
     * Render a NHP template and return HTML
     * 
     * @param filename The filename
     * @param locals The locals to use for rendering
     * @param cb The callback
     */
    public render(filename: string, options: any, cb: (err?: Error, html?: string) => void) {
        this.template(filename).render(options, cb);
    }

    /**
     * Render a NHP template to a stream
     * 
     * @param filename The filename
     * @param locals The locals to use for rendering
     * @param stream The target stream
     * @param cb The callback
     */
    public renderToStream(filename: string, locals: any, stream: NodeJS.WritableStream, cb: (err?: Error) => void) {
        this.template(filename).renderToStream(locals, stream, cb);
    }

    /**
     * Create an express handler out of this NHP instance.
     */
    public __express() {
        return this.render.bind(this);
    }

}