"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var JSON = (function () {
    function JSON(source) {
        try {
            if (!global.JSON.stringify(this._source = source))
                throw new Error("Could not parse source");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + source + "`");
        }
    }
    JSON.prototype.save = function () {
        return this._source;
    };
    JSON.prototype.load = function (data) {
        this._source = data;
    };
    JSON.prototype.process = function (source) {
        this._source = source;
    };
    JSON.prototype.generateSource = function () {
        var source = "try{__out.write(JSON.stringify(" + this._source;
        source += "));}catch(e){__out.write(__error(e";
        source += "));};__next();";
        return source;
    };
    JSON.prototype.run = function (runtime, out) {
    };
    JSON.prototype.async = function () {
        return false;
    };
    return JSON;
}());
exports.JSON = JSON;
//# sourceMappingURL=JSON.js.map