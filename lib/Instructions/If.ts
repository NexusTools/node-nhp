/// <reference types="node" />

import {Instruction} from "../Instruction";

export class If implements Instruction {
    readonly usesStackControl = true;
    private _condition: string;

    constructor(condition: string) {
        try {
            eval("(function(){return " + condition + ";})"); // Verify it compiles
        } catch (e) {
            throw new Error("Failed to compile condition `" + condition + "`: " + e);
        }

        this._condition = condition;
    }


    generateSource(stackControl: {push: Function, pop: Function}): string {
        stackControl.push();
        return "if (" + this._condition + ") {";
    }

}