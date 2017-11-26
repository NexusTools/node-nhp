/// <reference types="node" />

import {Instruction} from "../Instruction";

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
            throw new Error("Failed to compile source `" + this._what + "`: " + e);
        }
    }

    generateSource(): string {
        return "__add(" + JSON.stringify(this._to) + ", " + this._what + ");";
    }

}