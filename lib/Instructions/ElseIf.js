"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var ElseIf = (function () {
    function ElseIf(condition) {
        try {
            eval("(function(){return " + condition + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile condition `" + condition + "`");
        }
        this._condition = condition;
    }
    ElseIf.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    ElseIf.prototype.save = function () {
        return "";
    };
    ElseIf.prototype.load = function (data) { };
    ElseIf.prototype.generateSource = function (stackControl) {
        stackControl.pop();
        stackControl.push();
        return "]],[function(){" + this._condition + ";}, [";
    };
    ElseIf.prototype.run = function (runtime, out, callback) {
    };
    ElseIf.prototype.async = function () {
        return false;
    };
    return ElseIf;
}());
exports.ElseIf = ElseIf;
//# sourceMappingURL=ElseIf.js.map