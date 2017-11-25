"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class MoustacheResolver {
    constructor(key, attrib, raw) {
        this._key = key;
    }
    process(source) {
        this._source = source;
    }
    generateSource() {
        var source = "__out.write(\"<error>Resolvers not implemented.</error>\");";
        return source;
    }
}
exports.MoustacheResolver = MoustacheResolver;
//# sourceMappingURL=MoustacheResolver.js.map