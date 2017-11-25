import { Instruction } from "../Instruction";
export declare class Bundle implements Instruction {
    private bundle;
    constructor(bundle: Instruction[]);
    generateSource(): string;
}
