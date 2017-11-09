"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = log("nhp");
class JSON {
    constructor(source) {
        try {
            if (!global.JSON.stringify(this._source = source))
                throw new Error("Could not parse source");
        }
        catch (e) {
            logger.error(e);
            throw new Error("Failed to compile source `" + source + "`");
        }
    }
    save() {
        return this._source;
    }
    load(data) {
        this._source = data;
    }
    process(source) {
        this._source = source;
    }
    generateSource() {
        var source = "try{__out.write(JSON.stringify(" + this._source;
        source += "));}catch(e){__out.write(__error(e";
        source += "));};__next();";
        return source;
    }
    run(runtime, out) {
    }
    async() {
        return false;
    }
}
exports.JSON = JSON;
//# sourceMappingURL=JSON.js.map