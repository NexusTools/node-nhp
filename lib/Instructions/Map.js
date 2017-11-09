"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = log("nhp");
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
            eval("(function(){return " + this._with + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile with `" + this._with + "`");
        }
    }
    save() {
        return JSON.stringify([this._what, this._at, this._with]);
    }
    load(data) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._at = obj[1];
        this._with = obj[2];
    }
    process(source) {
        throw new Error("This instruction can't process data");
    }
    generateSource() {
        return "try{__map(" + JSON.stringify(this._what) + ", " + JSON.stringify(this._at) + ", " + this._with + ");__next();}catch(e){__out.write(__error(e));__next();};";
    }
    run(runtime, out, callback) {
    }
    async() {
        return false;
    }
}
exports.Map = Map;
//# sourceMappingURL=Map.js.map