/// <reference types="node" />

import {Instruction} from "../Instruction";

export class MoustacheResolver implements Instruction {
    private _key: string;
    private _source: string;
    private _attrib: boolean;
    private _raw: boolean;

    constructor(key: string, attrib: boolean, raw: boolean) {
        this._key = key;
    }

    process(source: string) {
        this._source = source;
    }

    generateSource(): string {
        var source = "__out.write(\"<error>Resolvers not implemented.</error>\");";
        return source
    }

}