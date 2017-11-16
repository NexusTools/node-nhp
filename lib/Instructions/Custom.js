"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log = require("nulllogger");
var logger = new log("nhp");
class Custom {
    constructor(run, generateSource) {
        this.generateSource = generateSource;
        this.run = run;
    }
    save() {
        return "";
    }
    load(data) { }
    process(source) { }
    async() {
        return false;
    }
}
exports.Custom = Custom;
//# sourceMappingURL=Custom.js.map