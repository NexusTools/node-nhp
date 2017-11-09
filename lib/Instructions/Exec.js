"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = log("nhp");
class Exec {
    constructor(source) {
        try {
            eval("(function(){" + source + "})");
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
        this._source = source;
    }
    generateSource() {
        return "try{" + this._source + ";}catch(e){__out.write(__error(e));};__next();";
    }
    run(runtime, out) {
    }
    async() {
        return false;
    }
}
exports.Exec = Exec;
//# sourceMappingURL=Exec.js.map