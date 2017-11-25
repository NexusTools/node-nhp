"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class ElseIf {
    constructor(condition) {
        this.usesStackControl = true;
        try {
            eval("(function(){return " + condition + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile condition `" + condition + "`");
        }
        this._condition = condition;
    }
    generateSource(stackControl) {
        stackControl.pop();
        stackControl.push();
        return "} else if(" + this._condition + ") {";
    }
}
exports.ElseIf = ElseIf;
//# sourceMappingURL=ElseIf.js.map