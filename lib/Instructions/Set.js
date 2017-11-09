"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var syntax = /^([^\s]+)\s(.+)$/;
var Set = (function () {
    function Set(input) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?set sytnax");
        this._what = parts[1];
        this._to = parts[2];
        try {
            eval("(function(){return " + this._to + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + this._to + "`");
        }
    }
    Set.prototype.save = function () {
        return JSON.stringify([this._what, this._to]);
    };
    Set.prototype.load = function (data) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._to = obj[0];
    };
    Set.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Set.prototype.generateSource = function () {
        return "try{__set(" + JSON.stringify(this._what) + ", " + this._to + ");__next();}catch(e){__out.write(__error(e));__next();};";
    };
    Set.prototype.run = function (runtime, out, callback) {
    };
    Set.prototype.async = function () {
        return false;
    };
    return Set;
}());
exports.Set = Set;
//# sourceMappingURL=Set.js.map