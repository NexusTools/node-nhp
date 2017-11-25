"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
var syntax = /^([^\s]+)\s(.+)$/;
class Set {
    constructor(input) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?set sytnax");
        this._what = parts[1];
        this._to = parts[2];
        try {
            eval("(function(){return " + this._to + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile source `" + this._to + "`: " + e);
        }
    }
    generateSource() {
        return "__set(" + JSON.stringify(this._what) + ", " + this._to + ");";
    }
}
exports.Set = Set;
//# sourceMappingURL=Set.js.map