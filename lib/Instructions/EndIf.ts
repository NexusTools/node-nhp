/// <reference types="node" />

import {Instruction,StackControl} from "../Instruction";

export class EndIf implements Instruction {
    readonly usesStackControl = true;
    constructor() {}

    generateSource(stackControl: StackControl): string {
        if (stackControl.pop().else)
            return "}";
        return "}else{__next()}"
    }

}