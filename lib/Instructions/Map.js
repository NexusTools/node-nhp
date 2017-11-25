"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
var short = /^([^\s]+)\s([^\s]+)\s*$/;
var syntax = /^([^\s]+)\s([^\s]+)\s(.+)$/;
class Map {
    constructor(input) {
        var parts = input.match(syntax);
        if (!parts) {
            parts = input.match(short);
            if (!parts)
                throw new Error("Invalid <?map sytnax");
            parts[3] = "{}";
        }
        this._what = parts[1];
        this._at = parts[2];
        this._with = parts[3];
        try {
            eval("(function(){return " + this._with + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile with `" + this._with + "`: " + e);
        }
    }
    generateSource() {
        return "__map(" + JSON.stringify(this._what) + ", " + JSON.stringify(this._at) + ", " + this._with + ");";
    }
}
exports.Map = Map;
//# sourceMappingURL=Map.js.map