/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Done implements Instruction {
    readonly async = true;
    
    constructor() {}

    generateSource(stackControl: {push: Function, pop: Function}): string {
        stackControl.pop();
        return "], __next);";
    }

}