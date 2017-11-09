/// <reference types="node" />
import { Instruction } from "../Instruction";
import { Runtime } from "../Runtime";
import stream = require("stream");
export declare class JSON implements Instruction {
    private _source;
    constructor(source: string);
    save(): string;
    load(data: string): void;
    process(source: string): void;
    generateSource(): string;
    run(runtime: Runtime, out: stream.Writable): void;
    async(): boolean;
}
