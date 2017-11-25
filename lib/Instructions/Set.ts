/// <reference types="node" />

import {Instruction} from "../Instruction";

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
            throw new Error("Failed to compile source `" + this._to + "`: " + e);
        }
    }

    generateSource(): string {
        return "__set(" + JSON.stringify(this._what) + ", " + this._to + ");";
    }

}