/// <reference types="node" />
import { Instruction } from "./Instruction";
import { Template } from "./Template";
export interface NHPOptions {
    tidyAttribs?: string[];
    tidyComments?: string;
    tidyOutput?: boolean;
}
export declare class NHP {
    private static defaults;
    constants: any;
    options: NHPOptions;
    private templates;
    private static PROCESSORS;
    private resolvers;
    static create(constants: Object): NHP;
    constructor(constants?: any, options?: NHPOptions);
    processingInstruction(name: string, data: string): Instruction;
    resolver(name: string): any;
    installResolver(name: string, resolver: Function): void;
    setConstant(name: string, value: any): void;
    hasConstant(name: string): boolean;
    getConstant(name: string): any;
    mixin(object: Object): void;
    template(filename: string): Template;
    genSource(filename: string, options: any, cb: (err?: Error, source?: string) => void): void;
    render(filename: string, options: any, cb: (err?: Error, html?: string) => void): void;
    renderToStream(filename: string, options: any, stream: NodeJS.WritableStream, cb: (err?: Error) => void): void;
    static __express(options?: NHPOptions): any;
}
