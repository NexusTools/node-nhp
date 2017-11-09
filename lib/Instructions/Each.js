"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = log("nhp");
class Each {
    constructor(eachOf) {
        try {
            eval("(function(){return " + eachOf + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile eachOf `" + eachOf + "`");
        }
        this._eachOf = eachOf;
    }
    save() {
        return this._eachOf;
    }
    load(data) {
        this._eachOf = data;
    }
    process(source) {
        throw new Error("This instruction can't process data");
    }
    generateSource(stackControl) {
        stackControl.push();
        return "try{__each(" + this._eachOf + ", function(entry, __next) {__series([";
    }
    run(runtime, out, callback) {
    }
    async() {
        return false;
    }
}
exports.Each = Each;
//# sourceMappingURL=Each.js.map