/// <reference types="node" />
import { Instruction } from "../Instruction";
import { Runtime } from "../Runtime";
import stream = require("stream");
export declare class Echo implements Instruction {
    _data: string;
    constructor(data: string);
    save(): string;
    load(data: string): void;
    process(source: string): void;
    generateSource(): string;
    run(runtime: Runtime, out: stream.Writable, callback: Function): void;
    async(): boolean;
}
