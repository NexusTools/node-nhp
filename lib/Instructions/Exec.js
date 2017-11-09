"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var Exec = (function () {
    function Exec(source) {
        try {
            eval("(function(){" + source + "})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + source + "`");
        }
        this._source = source;
    }
    Exec.prototype.save = function () {
        return this._source;
    };
    Exec.prototype.load = function (data) {
        this._source = data;
    };
    Exec.prototype.process = function (source) {
        this._source = source;
    };
    Exec.prototype.generateSource = function () {
        return "try{" + this._source + ";}catch(e){__out.write(__error(e));};__next();";
    };
    Exec.prototype.run = function (runtime, out) {
    };
    Exec.prototype.async = function () {
        return false;
    };
    return Exec;
}());
exports.Exec = Exec;
//# sourceMappingURL=Exec.js.map