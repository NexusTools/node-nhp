"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class If {
    constructor(condition) {
        this.usesStackControl = true;
        try {
            eval("(function(){return " + condition + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile condition `" + condition + "`: " + e);
        }
        this._condition = condition;
    }
    generateSource(stackControl) {
        stackControl.push();
        return "if (" + this._condition + ") {";
    }
}
exports.If = If;
//# sourceMappingURL=If.js.map