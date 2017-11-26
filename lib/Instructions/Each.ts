/// <reference types="node" />

import {Instruction,StackControl} from "../Instruction";

export class Each implements Instruction {
    readonly async = true;
    private _eachOf: string;

    constructor(eachOf: string) {
        try {
            eval("(function(){return " + eachOf + ";})"); // Verify it compiles
        } catch (e) {
            throw new Error("Failed to compile eachOf `" + eachOf + "`");
        }

        this._eachOf = eachOf;
    }

    generateSource(stackControl: StackControl): string {
        stackControl.push();
        return "__each(" + this._eachOf + ", function(entry, __next) {";
    }

}