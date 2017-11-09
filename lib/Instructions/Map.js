"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var short = /^([^\s]+)\s([^\s]+)\s*$/;
var syntax = /^([^\s]+)\s([^\s]+)\s(.+)$/;
var Map = (function () {
    function Map(input) {
        var parts = input.match(syntax);
        if (!parts) {
            parts = input.match(short);
            if (!parts)
                throw new Error("Invalid <?map sytnax");
            parts[3] = "{}";
        }
        this._what = parts[1];
        this._at = parts[2];
        this._with = parts[3];
        try {
            eval("(function(){return " + this._with + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile with `" + this._with + "`");
        }
    }
    Map.prototype.save = function () {
        return JSON.stringify([this._what, this._at, this._with]);
    };
    Map.prototype.load = function (data) {
        var obj = JSON.parse(data);
        this._what = obj[0];
        this._at = obj[1];
        this._with = obj[2];
    };
    Map.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Map.prototype.generateSource = function () {
        return "try{__map(" + JSON.stringify(this._what) + ", " + JSON.stringify(this._at) + ", " + this._with + ");__next();}catch(e){__out.write(__error(e));__next();};";
    };
    Map.prototype.run = function (runtime, out, callback) {
    };
    Map.prototype.async = function () {
        return false;
    };
    return Map;
}());
exports.Map = Map;
//# sourceMappingURL=Map.js.map