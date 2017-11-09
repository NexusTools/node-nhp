"use strict";
var log = require("nulllogger");
var logger = log("nhp");
var Moustache = (function () {
    function Moustache(source, attrib, raw) {
        try {
            eval("(function(){return " + source + ";})");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + source + "`");
        }
        this._source = source;
        this._attrib = attrib;
        this._raw = raw;
    }
    Moustache.prototype.save = function () {
        return this._source;
    };
    Moustache.prototype.load = function (data) { };
    Moustache.prototype.process = function (source) {
        this._source = source;
    };
    Moustache.prototype.generateSource = function () {
        var source = "try{__out.write(__string(" + this._source;
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        }
        else if (this._raw)
            source += ",false,true";
        source += "));}catch(e){__out.write(__error(e";
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        }
        else if (this._raw)
            source += ",false,true";
        source += "));};__next();";
        return source;
    };
    Moustache.prototype.run = function (runtime, out) { };
    Moustache.prototype.async = function () {
        return false;
    };
    return Moustache;
}());
exports.Moustache = Moustache;
//# sourceMappingURL=Moustache.js.map