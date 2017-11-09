"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = log("nhp");
var syntax = /^([^\s]+)\s(.+)$/;
class Set {
    constructor(input) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?set sytnax");
        this._what = parts[1];
        this._to = parts[2];
        try {
            eval("(function(){return " + this._to + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + this._to + "`");
        }
    }
    save() {
        return JSON.stringify([this._what, this._to]);
    }
    load(data) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._to = obj[0];
    }
    process(source) {
        throw new Error("This instruction can't process data");
    }
    generateSource() {
        return "try{__set(" + JSON.stringify(this._what) + ", " + this._to + ");__next();}catch(e){__out.write(__error(e));__next();};";
    }
    run(runtime, out, callback) {
    }
    async() {
        return false;
    }
}
exports.Set = Set;
//# sourceMappingURL=Set.js.map