"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Bundle {
    constructor(bundle) {
        this.bundle = bundle;
    }
    generateSource() {
        var source = "";
        this.bundle.forEach(function (instruction) {
            source += instruction.generateSource(undefined, false);
        });
        return source;
    }
}
exports.Bundle = Bundle;
//# sourceMappingURL=Bundle.js.map