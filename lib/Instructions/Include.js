"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = new log("nhp");
class Include {
    constructor(source) {
        try {
            eval("(function(){return " + source + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + source + "`");
        }
        this._source = source;
    }
    save() {
        return this._source;
    }
    load(data) {
        this._source = data;
    }
    process(source) {
        throw new Error("This instruction cannot process data...");
    }
    generateSource() {
        var source = "try{__include(";
        source += this._source;
        source += ", __next);}catch(e){__out.write(__error(e));__next();};";
        return source;
    }
    run(runtime, out) { }
    async() {
        return false;
    }
}
exports.Include = Include;
//# sourceMappingURL=Include.js.map