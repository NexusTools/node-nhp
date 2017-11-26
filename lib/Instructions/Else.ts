/// <reference types="node" />

import {Instruction,StackControl} from "../Instruction";

export class Else implements Instruction {
    readonly usesStackControl = true;
    
    constructor() {}

    generateSource(stackControl: StackControl): string {
        stackControl.pop();
        stackControl.push({else:true});
        return "} else {";
    }

}