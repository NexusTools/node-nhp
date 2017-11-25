"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Include {
    constructor(source, root) {
        this.async = true;
        try {
            eval("(function(){return " + source + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile source `" + source + "`: " + e);
        }
        if (root)
            try {
                eval("(function(){return " + root + ";})"); // Verify it compiles
            }
            catch (e) {
                throw new Error("Failed to compile source `" + root + "`: " + e);
            }
        this._source = source;
        this._root = root;
    }
    generateSource() {
        var source = "__include(";
        source += this._source;
        source += ", __next";
        if (this._root) {
            source += ", ";
            source += this._root;
        }
        source += ");";
        return source;
    }
}
exports.Include = Include;
//# sourceMappingURL=Include.js.map