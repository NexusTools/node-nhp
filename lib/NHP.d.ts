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
import { Custom } from "./Instructions/Custom";
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
    /**
     * References to the built in Instructions
     */
    static readonly Instructions: {
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
        Custom: typeof Custom;
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
    /**
     * Return a processing instruction for a processor by name and with data.
     *
     * @param name The name of the processor
     * @param data The data to pass to the processor
     */
    processingInstruction(name: string, data: string): Instruction;
    resolver(name: string): any;
    installResolver(name: string, resolver: Function): void;
    /**
     * Install a processor for key.
     *
     * @param key The key to use
     * @param processor The processor to install
     */
    installProcessor(key: string, processor: Processor): void;
    /**
     * Set or update a constant.
     *
     * @param key The key for the constant
     * @param value The value of the constant
     */
    setConstant(key: string, value: any): void;
    /**
     * Check whether or not a specific constant is set for a given key.
     *
     * @param key The key
     * @returns true if key is set, false otherwise
     */
    hasConstant(key: string): boolean;
    /**
     * Delete a constant for a specific key
     *
     * @param key The key
     * @returns true if deleted, false otherwise
     */
    deleteConstant(key: string): boolean;
    /**
     * Retreive a constant by key.
     *
     * @param key The key
     * @returns The value of the constant, or undefined
     */
    constant(name: string): any;
    /**
     * Assign the source object's properties to the constants for this NHP instance.
     *
     * @param object The source object
     */
    assignConstants(object: Object): void;
    /**
     * Create or retreive a template associated to this NHP instance.
     *
     * @param filename The template filename
     * @param mutable Whether or not to watch for changes, true by default
     */
    template(filename: string, mutable?: boolean): Template;
    /**
     * Generate JavaScript source for a given NHP template.
     *
     * @param filename The template filename
     * @param cb The callback
     */
    genSource(filename: string, cb: (err?: Error, source?: string) => void): void;
    /**
     * Render a NHP template and return HTML
     *
     * @param filename The filename
     * @param locals The locals to use for rendering
     * @param cb The callback
     */
    render(filename: string, options: any, cb: (err?: Error, html?: string) => void): void;
    /**
     * Render a NHP template to a stream
     *
     * @param filename The filename
     * @param locals The locals to use for rendering
     * @param stream The target stream
     * @param cb The callback
     */
    renderToStream(filename: string, locals: any, stream: NodeJS.WritableStream, cb: (err?: Error) => void): void;
    /**
     * Create an express handler out of this NHP instance.
     */
    __express(): any;
}
