"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Echo {
    constructor(data) {
        this._data = data;
    }
    generateSource() {
        return "__out.write(" + JSON.stringify(this._data) + ");";
    }
}
exports.Echo = Echo;
//# sourceMappingURL=Echo.js.map