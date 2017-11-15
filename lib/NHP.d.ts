/// <reference types="node" />
import { Instruction } from "./Instruction";
import { Template } from "./Template";
import { Set } from "./Instructions/Set";
import { Add } from "./Instructions/Add";
import { Map } from "./Instructions/Map";
import { Exec } from "./Instructions/Exec";
import { JSON } from "./Instructions/JSON";
import { Each } from "./Instructions/Each";
import { Done } from "./Instructions/Done";
import { If } from "./Instructions/If";
import { ElseIf } from "./Instructions/ElseIf";
import { Else } from "./Instructions/Else";
import { EndIf } from "./Instructions/EndIf";
import { Include } from "./Instructions/Include";
import { Echo } from "./Instructions/Echo";
import { Translate } from "./Instructions/Translate";
import { Moustache } from "./Instructions/Moustache";
import { MoustacheResolver } from "./Instructions/MoustacheResolver";
export interface Processor {
    (data: string): Instruction;
}
export interface NHPOptions {
    tidyAttribs?: string[];
    tidyComments?: string;
    tidyOutput?: boolean;
}
export declare class NHP {
    static Instructions: {
        Set: typeof Set;
        Add: typeof Add;
        Map: typeof Map;
        Exec: typeof Exec;
        JSON: typeof JSON;
        Each: typeof Each;
        Done: typeof Done;
        If: typeof If;
        ElseIf: typeof ElseIf;
        Else: typeof Else;
        EndIf: typeof EndIf;
        Include: typeof Include;
        Moustache: typeof Moustache;
        MoustacheResolver: typeof MoustacheResolver;
        Echo: typeof Echo;
        Translate: typeof Translate;
    };
    private static defaults;
    constants: any;
    options: NHPOptions;
    private templates;
    private processors;
    static defaultProcessors: {
        [index: string]: Processor;
    };
    private resolvers;
    static create(constants: Object): NHP;
    constructor(constants?: any, options?: NHPOptions);
    processingInstruction(name: string, data: string): Instruction;
    resolver(name: string): any;
    installResolver(name: string, resolver: Function): void;
    installProcessor(key: string, processor: Processor): void;
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
