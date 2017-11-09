"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = new log("nhp");
class If {
    constructor(condition) {
        try {
            eval("(function(){return " + condition + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile condition `" + condition + "`");
        }
        this._condition = condition;
    }
    process(source) {
        throw new Error("This instruction can't process data");
    }
    save() {
        return this._condition;
    }
    load(data) {
        this._condition = data;
    }
    generateSource(stackControl) {
        stackControl.push();
        return "try{__if([[function(){return " + this._condition + ";}, [";
    }
    run(runtime, out, callback) {
    }
    async() {
        return false;
    }
}
exports.If = If;
//# sourceMappingURL=If.js.map