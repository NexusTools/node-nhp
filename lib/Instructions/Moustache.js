"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = log("nhp");
class Moustache {
    constructor(source, attrib, raw) {
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
    save() {
        return this._source;
    }
    load(data) { }
    process(source) {
        this._source = source;
    }
    generateSource() {
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
    }
    run(runtime, out) { }
    async() {
        return false;
    }
}
exports.Moustache = Moustache;
//# sourceMappingURL=Moustache.js.map