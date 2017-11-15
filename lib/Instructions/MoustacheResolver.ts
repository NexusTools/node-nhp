/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import stream = require("stream");

export class MoustacheResolver implements Instruction {
    private _key: string;
    private _source: string;
    private _attrib: boolean;
    private _raw: boolean;

    constructor(key: string, attrib: boolean, raw: boolean) {
        this._key = key;
    }

    save(): string {
        return this._key;
    }

    load(data: string) {}

    process(source: string) {
        this._source = source;
    }

    generateSource(): string {
        var source = "try{__resolver(";
        source += JSON.stringify(this._key);
        source += ")(function(err, value){try{if(err){throw err;};__out.write(__string(value";
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        } else if (this._raw)
            source += ",false,true";
        source += "));}catch(e){__out.write(__error(e";
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        } else if (this._raw)
            source += ",false,true";
        source += "));};__next();});}catch(e){__out.write(__error(e";
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        } else if (this._raw)
            source += ",false,true";
        source += "));__next();};";
        return source
    }

    run(runtime: Runtime, out: stream.Writable) {

    }

    async(): boolean {
        return true;
    }

}