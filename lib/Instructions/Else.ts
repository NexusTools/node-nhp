/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Else implements Instruction {
    readonly usesStackControl = true;
    
    constructor() {}

    generateSource(stackControl: {push: Function, pop: Function}): string {
        stackControl.pop();
        stackControl.push();
        return "} else {";
    }

}