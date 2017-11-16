/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = new log("nhp");

export class Custom implements Instruction {
    generateSource: () => string;
    run: (runtime: Runtime, out: stream.Writable) => void;
    constructor(run: (runtime: Runtime, out: stream.Writable) => void, generateSource: () => string) {
        this.generateSource = generateSource;
        this.run = run;
    }
    
    
    save(): string {
        return "";
    }
    load(data: string) {}
    process(source: string) {}
    async(): boolean {
        return false;
    }
}