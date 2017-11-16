/// <reference types="node" />
import { Instruction } from "../Instruction";
import { Runtime } from "../Runtime";
import stream = require("stream");
export declare class Custom implements Instruction {
    generateSource: () => string;
    run: (runtime: Runtime, out: stream.Writable) => void;
    constructor(run: (runtime: Runtime, out: stream.Writable) => void, generateSource: () => string);
    save(): string;
    load(data: string): void;
    process(source: string): void;
    async(): boolean;
}
