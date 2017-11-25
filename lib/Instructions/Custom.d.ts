import { Instruction } from "../Instruction";
export declare class Custom implements Instruction {
    async: boolean;
    generateSource: () => string;
    constructor(generateSource: () => string, async?: boolean);
}
