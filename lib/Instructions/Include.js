"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = new log("nhp");
class Include {
    constructor(source, root) {
        try {
            eval("(function(){return " + source + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + source + "`");
        }
        if (root)
            try {
                eval("(function(){return " + root + ";})");
            }
            catch (e) {
                logger.error(e);
                throw new Error("Failed to compile source `" + root + "`");
            }
        this._source = source;
        this._root = root;
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
        source += ", __next";
        if (this._root) {
            source += ", ";
            source += this._root;
        }
        source += ");}catch(e){__out.write(__error(e));__next();};";
        return source;
    }
    run(runtime, out) { }
    async() {
        return false;
    }
}
exports.Include = Include;
//# sourceMappingURL=Include.js.map