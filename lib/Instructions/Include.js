"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var Include = (function () {
    function Include(source) {
        try {
            eval("(function(){return " + source + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + source + "`");
        }
        this._source = source;
    }
    Include.prototype.save = function () {
        return this._source;
    };
    Include.prototype.load = function (data) {
        this._source = data;
    };
    Include.prototype.process = function (source) {
        throw new Error("This instruction cannot process data...");
    };
    Include.prototype.generateSource = function () {
        var source = "try{__include(";
        source += this._source;
        source += ", __next);}catch(e){__out.write(__error(e));__next();};";
        return source;
    };
    Include.prototype.run = function (runtime, out) { };
    Include.prototype.async = function () {
        return false;
    };
    return Include;
}());
exports.Include = Include;
//# sourceMappingURL=Include.js.map