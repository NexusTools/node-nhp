import { Instruction } from "../Instruction";
export declare class Each implements Instruction {
    readonly async: boolean;
    private _eachOf;
    constructor(eachOf: string);
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
}
