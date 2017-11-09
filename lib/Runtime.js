"use strict";
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
    mark(state) {
    }
    peek() {
    }
    reset() {
    }
    done() {
    }
    include(file, sandbox = false) {
    }
    run(out) {
        var self = this;
    }
}
exports.Runtime = Runtime;
//# sourceMappingURL=Runtime.js.map