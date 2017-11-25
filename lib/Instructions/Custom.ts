/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Custom implements Instruction {
    async: boolean;
    generateSource: () => string;
    constructor(generateSource: () => string, async = false) {
        this.generateSource = generateSource;
        this.async = async;
    }
}