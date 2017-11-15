/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = new log("nhp");

export class Each implements Instruction {
    private _eachOf: string;

    constructor(eachOf: string) {
        try {
            eval("(function(){return " + eachOf + ";})"); // Verify it compiles
        } catch (e) {
            logger.error(e);
            throw new Error("Failed to compile eachOf `" + eachOf + "`");
        }

        this._eachOf = eachOf;
    }

    save(): string {
        return this._eachOf;
    }

    load(data: string) {
        this._eachOf = data;
    }

    process(source: String) {
        throw new Error("This instruction can't process data");
    }

    generateSource(stackControl: {push: Function, pop: Function}): string {
        stackControl.push();
        return "try{__each(" + this._eachOf + ", function(entry, __next) {__series([";
    }

    run(runtime: Runtime, out: stream.Writable, callback: Function) {
    }

    async(): boolean {
        return false;
    }

}