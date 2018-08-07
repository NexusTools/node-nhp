import { Instruction } from "./Instruction";
import { NHP } from "./NHP";
export declare class Compiler {
    private static resolverRegex;
    private static logicRegex;
    _instructions: Array<Instruction>;
    private _nhp;
    private static voidElements;
    static isVoidElement(el: string): boolean;
    constructor(nhp: NHP);
    private static compileText;
    private cancelActive;
    compile(source: any, callback: Function): void;
    generateSource(): string;
    optimize(constants: any, callback: Function): void;
    cancel(): void;
}
