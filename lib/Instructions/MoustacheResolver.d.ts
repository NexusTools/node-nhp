/// <reference types="node" />
import { Instruction } from "../Instruction";
import { Runtime } from "../Runtime";
import stream = require("stream");
export declare class MoustacheResolver implements Instruction {
    private _key;
    private _source;
    private _attrib;
    private _raw;
    constructor(key: string, attrib: boolean, raw: boolean);
    save(): string;
    load(data: string): void;
    process(source: string): void;
    generateSource(): string;
    run(runtime: Runtime, out: stream.Writable): void;
    async(): boolean;
}
