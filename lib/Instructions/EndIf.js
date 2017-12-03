"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class EndIf {
    constructor() {
        this.usesStackControl = true;
    }
    generateSource(stackControl, asyncContext) {
        if (stackControl.pop({ omitcb: true })['else'] || !asyncContext)
            return "}}catch(e){__out.write(__error(e))}";
        return "}else{__next()}}catch(e){__out.write(__error(e));__next()}";
    }
}
exports.EndIf = EndIf;
//# sourceMappingURL=EndIf.js.map