/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = new log("nhp");

var syntax = /^([^\s]+)\s(.+)$/;
export class Set implements Instruction {
    private _what: string;
    private _to: string;

    constructor(input: string) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?set sytnax");
        this._what = parts[1];
        this._to = parts[2];

        try {
            eval("(function(){return " + this._to + ";})"); // Verify it compiles
        } catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + this._to + "`");
        }
    }

    save(): string {
        return JSON.stringify([this._what, this._to]);
    }
    load(data: string) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._to = obj[0];
    }

    process(source: string) {
        throw new Error("This instruction can't process data");
    }

    generateSource(): string {
        return "try{__set(" + JSON.stringify(this._what) + ", " + this._to + ");__next();}catch(e){__out.write(__error(e));__next();};";
    }

    run(runtime: Runtime, out: stream.Writable, callback: Function) {
    }

    async(): boolean {
        return false;
    }

}