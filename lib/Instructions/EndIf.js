"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class EndIf {
    constructor() {
        this.usesStackControl = true;
    }
    generateSource(stackControl, asyncContext) {
        if (stackControl.pop({ omitcb: true })['else'] || !asyncContext)
            return "}";
        return "}else{__next()}";
    }
}
exports.EndIf = EndIf;
//# sourceMappingURL=EndIf.js.map