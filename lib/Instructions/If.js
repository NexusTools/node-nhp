"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var If = (function () {
    function If(condition) {
        try {
            eval("(function(){return " + condition + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile condition `" + condition + "`");
        }
        this._condition = condition;
    }
    If.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    If.prototype.save = function () {
        return this._condition;
    };
    If.prototype.load = function (data) {
        this._condition = data;
    };
    If.prototype.generateSource = function (stackControl) {
        stackControl.push();
        return "try{__if([[function(){return " + this._condition + ";}, [";
    };
    If.prototype.run = function (runtime, out, callback) {
    };
    If.prototype.async = function () {
        return false;
    };
    return If;
}());
exports.If = If;
//# sourceMappingURL=If.js.map