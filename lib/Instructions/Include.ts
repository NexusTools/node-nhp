/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Include implements Instruction {
    readonly async = true;
    private _source: string;
    private _root: string;

    constructor(source: string, root?: string) {
        try {
            eval("(function(){return " + source + ";})"); // Verify it compiles
        } catch (e) {
            throw new Error("Failed to compile source `" + source + "`: " + e);
        }
        if (root)
            try {
                eval("(function(){return " + root + ";})"); // Verify it compiles
            } catch (e) {
                throw new Error("Failed to compile source `" + root + "`: " + e);
            }

        this._source = source;
        this._root = root;
    }

    generateSource(): string {
        var source = "__include(";
        source += this._source;
        source += ", __next";
        if (this._root) {
            source += ", ";
            source += this._root;
        }
        source += ");";
        return source;
    }

}