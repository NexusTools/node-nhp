"use strict";
var MoustacheResolver = (function () {
    function MoustacheResolver(key, attrib, raw) {
        this._key = key;
    }
    MoustacheResolver.prototype.save = function () {
        return this._key;
    };
    MoustacheResolver.prototype.load = function (data) { };
    MoustacheResolver.prototype.process = function (source) {
        this._source = source;
    };
    MoustacheResolver.prototype.generateSource = function () {
        var source = "try{__resolver(";
        source += JSON.stringify(this._key);
        source += ")(function(err, value){try{if(err){throw err;};__out.write(__string(value";
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
        source += "));};__next();});}catch(e){__out.write(__error(e";
        if (this._attrib) {
            source += ",true";
            if (this._raw)
                source += ",true";
        }
        else if (this._raw)
            source += ",false,true";
        source += "));__next();};";
        return source;
    };
    MoustacheResolver.prototype.run = function (runtime, out) {
    };
    MoustacheResolver.prototype.async = function () {
        return true;
    };
    return MoustacheResolver;
}());
exports.MoustacheResolver = MoustacheResolver;
//# sourceMappingURL=MoustacheResolver.js.map