/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Exec implements Instruction {
    private _source: string;

    constructor(source: string) {
        try {
            eval("(function(){" + source + "})"); // Verify it compiles
        } catch (e) {
            throw new Error("Failed to compile source `" + source + "`: " + e);
        }

        this._source = source;
    }

    generateSource(): string {
        return "try{" + this._source + "}catch(e){__out.write(__error(e))}";
    }

}