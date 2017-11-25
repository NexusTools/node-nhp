import { Instruction } from "../Instruction";
export declare class If implements Instruction {
    readonly usesStackControl: boolean;
    private _condition;
    constructor(condition: string);
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
}
