/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Moustache implements Instruction {
    private _source: string;
    private _attrib: boolean;
    private _raw: boolean;

    constructor(source: string, attrib: boolean, raw: boolean) {
        try {
            eval("(function(){return " + source + ";})"); // Verify it compiles
        } catch (e) {
            throw new Error("Failed to compile source `" + source + "`: " + e);
        }

        this._source = source;
        this._attrib = attrib;
        this._raw = raw;
    }

    generateSource(): string {
        var source = "try{__out.write(__string(" + this._source;
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        } else if (this._raw)
            source += ",false,true";
        source += "))}catch(e){__out.write(__error(e";
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        } else if (this._raw)
            source += ",false,true";
        source += "))}";
        return source
    }

}