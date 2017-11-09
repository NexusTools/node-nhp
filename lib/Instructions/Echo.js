"use strict";
var Echo = (function () {
    function Echo(data) {
        this._data = data;
    }
    Echo.prototype.save = function () {
        return this._data;
    };
    Echo.prototype.load = function (data) {
        this._data = data;
    };
    Echo.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Echo.prototype.generateSource = function () {
        return "__out.write(" + JSON.stringify(this._data) + ");__next();";
    };
    Echo.prototype.run = function (runtime, out, callback) {
        out.write(this._data);
        callback();
    };
    Echo.prototype.async = function () {
        return false;
    };
    return Echo;
}());
exports.Echo = Echo;
//# sourceMappingURL=Echo.js.map