/// <reference types="node" />

export interface StackControl {
    push(data?: Object): void;
    pop(): Object;
}
/**
 * A single instruction in a NHP template;
 */
export interface Instruction {
    /**
     * Whether or not this instruction requires an async context.
     */
    async?: boolean;
    /**
     * Whether or not this instruction uses stack control.
     * This can affect optimizations.
     */
    usesStackControl?: boolean;
    /**
     * Generate JavaScript source for this Instruction.
     * 
     * @param stackControl A object for controlling the stack of the runtime
     * @returns A string containing JavaScript for this Instruction
     */
    generateSource(stackControl: StackControl): string;
}