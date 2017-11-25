"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Else {
    constructor() {
        this.usesStackControl = true;
    }
    generateSource(stackControl) {
        stackControl.pop();
        stackControl.push();
        return "} else {";
    }
}
exports.Else = Else;
//# sourceMappingURL=Else.js.map