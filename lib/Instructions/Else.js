"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Else {
    constructor() { }
    save() {
        return "";
    }
    load(data) { }
    process(source) {
        throw new Error("This instruction can't process data");
    }
    generateSource(stackControl) {
        stackControl.pop();
        stackControl.push();
        return "]],[function(){return true;}, [";
    }
    run(runtime, out, callback) { }
    async() {
        return false;
    }
}
exports.Else = Else;
//# sourceMappingURL=Else.js.map