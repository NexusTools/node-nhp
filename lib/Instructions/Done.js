"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
class Done {
    constructor() {
        this.async = true;
    }
    generateSource(stackControl) {
        stackControl.pop();
        return "}, __next);";
    }
}
exports.Done = Done;
//# sourceMappingURL=Done.js.map