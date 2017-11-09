"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var Each = (function () {
    function Each(eachOf) {
        try {
            eval("(function(){return " + eachOf + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile eachOf `" + eachOf + "`");
        }
        this._eachOf = eachOf;
    }
    Each.prototype.save = function () {
        return this._eachOf;
    };
    Each.prototype.load = function (data) {
        this._eachOf = data;
    };
    Each.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Each.prototype.generateSource = function (stackControl) {
        stackControl.push();
        return "try{__each(" + this._eachOf + ", function(entry, __next) {__series([";
    };
    Each.prototype.run = function (runtime, out, callback) {
    };
    Each.prototype.async = function () {
        return false;
    };
    return Each;
}());
exports.Each = Each;
//# sourceMappingURL=Each.js.map