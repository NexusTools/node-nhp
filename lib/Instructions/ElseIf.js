"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = new log("nhp");
class ElseIf {
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
        return "";
    }
    load(data) { }
    generateSource(stackControl) {
        stackControl.pop();
        stackControl.push();
        return "]],[function(){" + this._condition + ";}, [";
    }
    run(runtime, out, callback) {
    }
    async() {
        return false;
    }
}
exports.ElseIf = ElseIf;
//# sourceMappingURL=ElseIf.js.map