"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = new log("nhp");
var syntax = /^([^\s]+)\s(.+)$/;
class Add {
    constructor(input) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?add sytnax");
        this._what = parts[2];
        this._to = parts[1];
        try {
            eval("(function(){return " + this._what + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + this._what + "`");
        }
    }
    save() {
        return JSON.stringify([this._what, this._to]);
    }
    load(data) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._to = obj[1];
    }
    process(source) {
        throw new Error("This instruction can't process data");
    }
    generateSource() {
        return "try{__add(" + JSON.stringify(this._to) + ", " + this._what + ");__next();}catch(e){__out.write(__error(e));__next();};";
    }
    run(runtime, out, callback) {
    }
    async() {
        return false;
    }
}
exports.Add = Add;
//# sourceMappingURL=Add.js.map