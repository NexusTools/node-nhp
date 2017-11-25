/// <reference types="node" />

import {Instruction} from "../Instruction";

export class JSON implements Instruction {
    private _source: string;

    constructor(source: string) {
        try {
            eval("(function(){return " + source + ";})"); // Verify it compiles
        } catch (e) {
            throw new Error("Failed to compile source `" + source + "`: " + e);
        }
    }

    generateSource(): string {
        var source = "try{__out.write(JSON.stringify(" + this._source;
        source += "))}catch(e){__out.write(__error(e";
        source += "))}";
        return source;
    }

}