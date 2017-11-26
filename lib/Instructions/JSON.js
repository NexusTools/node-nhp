"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class JSON {
    constructor(source) {
        this._source = source;
        try {
            eval("(function(){return " + source + ";})"); // Verify it compiles
        }
        catch (e) {
            throw new Error("Failed to compile source `" + source + "`: " + e);
        }
    }
    generateSource() {
        var source = "try{__out.write(JSON.stringify(";
        source += this._source;
        source += "))}catch(e){__out.write(__error(e))}";
        return source;
    }
}
exports.JSON = JSON;
//# sourceMappingURL=JSON.js.map