"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Echo {
    constructor(data) {
        this._data = data;
    }
    save() {
        return this._data;
    }
    load(data) {
        this._data = data;
    }
    process(source) {
        throw new Error("This instruction can't process data");
    }
    generateSource() {
        return "__out.write(" + JSON.stringify(this._data) + ");__next();";
    }
    run(runtime, out, callback) {
        out.write(this._data);
        callback();
    }
    async() {
        return false;
    }
}
exports.Echo = Echo;
//# sourceMappingURL=Echo.js.map