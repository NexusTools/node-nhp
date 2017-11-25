"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Exec {
    constructor(source) {
        try {
            eval("(function(){" + source + "})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile source `" + source + "`: " + e);
        }
        this._source = source;
    }
    generateSource() {
        return "try{" + this._source + ";}catch(e){__out.write(__error(e));};";
    }
}
exports.Exec = Exec;
//# sourceMappingURL=Exec.js.map