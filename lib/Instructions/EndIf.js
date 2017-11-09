"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EndIf {
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
        return "]]], __next);}catch(e){__out.write(__error(e));__next();};";
    }
    run(runtime, out, callback) {
    }
    async() {
        return false;
    }
}
exports.EndIf = EndIf;
//# sourceMappingURL=EndIf.js.map