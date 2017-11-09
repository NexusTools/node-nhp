/// <reference types="node" />

import stream = require("stream");

import {Runtime} from "./Runtime"

export interface Instruction {
    save():string;
    load(data:string):void;

    process(source:string):void;
    generateSource(stackControl:{push:Function, pop:Function}):string;
    run(runtime:Runtime, out:stream.Writable, callback:Function):void;
    async(): boolean;
}