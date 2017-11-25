/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Bundle implements Instruction {
    private bundle: Instruction[];
    constructor(bundle: Instruction[]) {
        this.bundle = bundle;
    }
    generateSource(): string {
        var source = "";
        this.bundle.forEach(function(instruction) {
            source += instruction.generateSource();
        })
        return source;
    }
}