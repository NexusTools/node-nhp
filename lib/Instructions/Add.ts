/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = new log("nhp");

var syntax = /^([^\s]+)\s(.+)$/;
export class Add implements Instruction {
    private _what: string;
    private _to: string;

    constructor(input: string) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?add sytnax");
        this._what = parts[2];
        this._to = parts[1];

        try {
            eval("(function(){return " + this._what + ";})"); // Verify it compiles
        } catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + this._what + "`");
        }
    }

    generateSource(): string {
        return "__add(" + JSON.stringify(this._to) + ", " + this._what + ");";
    }

}