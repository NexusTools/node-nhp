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

import {If} from "./Instructions/If";
import {ElseIf} from "./Instructions/ElseIf";
import {Else} from "./Instructions/Else";
import {EndIf} from "./Instructions/EndIf";

import {Include} from "./Instructions/Include";

interface Processor {
    (data: string): Instruction;
}

var extension = /\.\w+$/;
export interface NHPOptions {
    tidyAttribs?: string[];
    tidyComments?: string;
    tidyOutput?: boolean;
}
export class NHP {
    private static defaults: NHPOptions = {
        tidyAttribs: ["false", "null", "undefined"],
        tidyComments: "not-if",
        tidyOutput: true
    }

    constants:any;
    options: NHPOptions;
    private templates: {[index: string]:Template};
    private static PROCESSORS: {[index:string]: Processor} = {
        "set": function(data:string) {
            return new Set(data);
        },
        "add": function(data:string) {
            return new Add(data);
        },
        "map": function(data:string) {
            return new Map(data);
        },

        "exec": function(source:string) {
            return new Exec(source);
        },
        "json": function(source:string) {
            return new JSON(source);
        },

        "each": function(data:string) {
            return new Each(data);
        },
        "done": function() {
            return new Done();
        },

        "if": function(condition:string) {
            return new If(condition);
        },
        "elseif": function(condition:string) {
            return new ElseIf(condition);
        },
        "else": function() {
            return new Else();
        },
        "endif": function() {
            return new EndIf();
        },

        "include": function(file:string) {
            return new Include(file);
        }
    };
    private resolvers:any;

    public static create(constants: Object) {
        return new NHP(constants);
    }

    public constructor(constants:any={}, options?: NHPOptions) {
        if (!(this instanceof NHP))
            return new NHP(constants);

        this.resolvers = {};
        this.templates = {};
        this.constants = constants;
        this.options = {} as any;
        _.merge(this.options, NHP.defaults);
        if(options)
            _.merge(this.options, options);
    }

    public processingInstruction(name:string, data:string) {
        if (!(name in NHP.PROCESSORS))
            throw new Error("No processor found with name `" + name + "`");
        return NHP.PROCESSORS[name](data);
    }

    public resolver(name:string):any {
        if (!(name in this.resolvers))
            throw new Error("No resolver found with name `" + name + "`");
        return this.resolvers[name];
    }

    public installResolver(name:string, resolver:Function) {
        this.resolvers[name] = resolver;
    }

    public setConstant(name:string, value:any) {
        if (this.hasConstant(name))
            throw new Error("Cannot redefine constant: " + name);
        this.constants[name] = value;
    }

    public hasConstant(name:string) {
        return name in this.constants;
    }

    public getConstant(name:string) {
        return this.constants[name];
    }

    public mixin(object:Object) {
        _.merge(this.constants, object);
    }

    public template(filename:string) {
        if (!extension.test(filename))
            filename += ".nhp";
        filename = path.resolve(filename);

        if (!(filename in this.templates))
            return this.templates[filename] = new Template(filename, this);

        return this.templates[filename];
    }

    private static __expressInst: NHP;
    public static instance() {
        if (!NHP.__expressInst)
            return NHP.__expressInst = new NHP();
        return NHP.__expressInst;
    }

    public static __express(path:any, options:any, callback:any) {
        throw new Error("No idea where the documentation is on what options actually contains... once thats figured out this will work...");
    }

}