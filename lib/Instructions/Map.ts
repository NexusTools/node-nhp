/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = new log("nhp");

var short = /^([^\s]+)\s([^\s]+)\s*$/;
var syntax = /^([^\s]+)\s([^\s]+)\s(.+)$/;
export class Map implements Instruction {
    private _what: string;
    private _at: string;
    private _with: string;

    constructor(input: string) {
        var parts = input.match(syntax);
        if (!parts) {
            parts = input.match(short);
            if (!parts)
                throw new Error("Invalid <?map sytnax");
            parts[3] = "{}";
        }
        this._what = parts[1];
        this._at = parts[2];
        this._with = parts[3];

        try {
            eval("(function(){return " + this._with + ";})"); // Verify it compiles
        } catch (e) {
            logger.error(e);
            throw new Error("Failed to compile with `" + this._with + "`");
        }
    }

    save(): string {
        return JSON.stringify([this._what, this._at, this._with]);
    }
    load(data: string) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._at = obj[1];
        this._with = obj[2];
    }

    process(source: string) {
        throw new Error("This instruction can't process data");
    }

    generateSource(): string {
        return "try{__map(" + JSON.stringify(this._what) + ", " + JSON.stringify(this._at) + ", " + this._with + ");__next();}catch(e){__out.write(__error(e));__next();};";
    }

    run(runtime: Runtime, out: stream.Writable, callback: Function) {
    }

    async(): boolean {
        return false;
    }

}