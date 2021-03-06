"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
var syntax = /^([^\s]+)\s(.+)$/;
class Add {
    constructor(input) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?add sytnax");
        this._what = parts[2];
        this._to = parts[1];
        try {
            eval("(function(){return " + this._what + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile source `" + this._what + "`: " + e);
        }
    }
    generateSource() {
        return "__add(" + JSON.stringify(this._to) + ", " + this._what + ");";
    }
}
exports.Add = Add;
//# sourceMappingURL=Add.js.map