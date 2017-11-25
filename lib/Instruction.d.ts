/**
 * A single instruction in a NHP template;
 */
export interface Instruction {
    /**
     * Generate JavaScript source for this Instruction.
     *
     * @param stackControl A object for controlling the stack of the runtime
     * @returns A string containing JavaScript for this Instruction
     */
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
    /**
     * Check whether or not this instruction requires an async context.
     *
     * @returns True if async required, False otherwise
     */
    async(): boolean;
}
