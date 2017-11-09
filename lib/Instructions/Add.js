"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var syntax = /^([^\s]+)\s(.+)$/;
var Add = (function () {
    function Add(input) {
        var parts = input.match(syntax);
        if (!parts)
            throw new Error("Invalid <?add sytnax");
        this._what = parts[2];
        this._to = parts[1];
        try {
            eval("(function(){return " + this._what + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + this._what + "`");
        }
    }
    Add.prototype.save = function () {
        return JSON.stringify([this._what, this._to]);
    };
    Add.prototype.load = function (data) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._to = obj[1];
    };
    Add.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Add.prototype.generateSource = function () {
        return "try{__add(" + JSON.stringify(this._to) + ", " + this._what + ");__next();}catch(e){__out.write(__error(e));__next();};";
    };
    Add.prototype.run = function (runtime, out, callback) {
    };
    Add.prototype.async = function () {
        return false;
    };
    return Add;
}());
exports.Add = Add;
//# sourceMappingURL=Add.js.map