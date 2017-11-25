"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Translate {
    constructor(data) {
        this._data = data;
    }
    generateSource() {
        return "__out.write(__(" + JSON.stringify(this._data) + "));";
    }
}
exports.Translate = Translate;
//# sourceMappingURL=Translate.js.map