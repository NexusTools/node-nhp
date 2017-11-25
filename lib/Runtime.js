"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vm");
class Runtime {
    constructor(instructions, context) {
        this._instructions = instructions;
        this._context = context || vm.createContext();
    }
    static _apply(from, to) {
    }
    apply(data) {
        Runtime._apply(data, this._context);
    }
    /*
            Marks the current cursor location
    */
    mark(state) {
    }
    // Returns the current marked state, if any
    peek() {
    }
    /*
            Resets to the last marked location, returns the last state
    */
    reset() {
    }
    /*
            Clears the last marked location, returns the last state
    */
    done() {
    }
    /**
            Includes a file onto the runtime

            @param file File to include
            @param sandbox Whether or not to merge runtime contexts
    */
    include(file, sandbox = false) {
    }
    /*
            Runs the instructions in this runtime
    */
    run(out) {
        var self = this;
        /*this._instructions.forEach(function(instruction:Instruction) {
                instruction.run(self, out);
        });*/
    }
}
exports.Runtime = Runtime;
//# sourceMappingURL=Runtime.js.map