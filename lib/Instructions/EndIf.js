"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class EndIf {
    constructor() {
        this.usesStackControl = true;
    }
    generateSource(stackControl) {
        stackControl.pop();
        return "}";
    }
}
exports.EndIf = EndIf;
//# sourceMappingURL=EndIf.js.map