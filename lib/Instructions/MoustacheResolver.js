"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MoustacheResolver {
    constructor(key, attrib, raw) {
        this._key = key;
    }
    save() {
        return this._key;
    }
    load(data) { }
    process(source) {
        this._source = source;
    }
    generateSource() {
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
    }
    run(runtime, out) {
    }
    async() {
        return true;
    }
}
exports.MoustacheResolver = MoustacheResolver;
//# sourceMappingURL=MoustacheResolver.js.map