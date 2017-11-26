"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Each {
    constructor(eachOf) {
        this.async = true;
        try {
            eval("(function(){return " + eachOf + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile eachOf `" + eachOf + "`");
        }
        this._eachOf = eachOf;
    }
    generateSource(stackControl) {
        stackControl.push();
        return "__each(" + this._eachOf + ", function(entry, __next) {";
    }
}
exports.Each = Each;
//# sourceMappingURL=Each.js.map