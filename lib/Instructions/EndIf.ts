/// <reference types="node" />

import {Instruction} from "../Instruction";

export class EndIf implements Instruction {
    readonly usesStackControl = true;
    constructor() {}

    generateSource(stackControl: {push: Function, pop: Function}): string {
        stackControl.pop();
        return "}";
    }

}