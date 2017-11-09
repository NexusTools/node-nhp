"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vm = require("vm");
var Runtime = (function () {
    function Runtime(instructions, context) {
        this._instructions = instructions;
        this._context = context || vm.createContext();
    }
    Runtime._apply = function (from, to) {
    };
    Runtime.prototype.apply = function (data) {
        Runtime._apply(data, this._context);
    };
    Runtime.prototype.mark = function (state) {
    };
    Runtime.prototype.peek = function () {
    };
    Runtime.prototype.reset = function () {
    };
    Runtime.prototype.done = function () {
    };
    Runtime.prototype.include = function (file, sandbox) {
        if (sandbox === void 0) { sandbox = false; }
    };
    Runtime.prototype.run = function (out) {
        var self = this;
    };
    return Runtime;
}());
exports.Runtime = Runtime;
//# sourceMappingURL=Runtime.js.map