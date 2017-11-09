"use strict";
var Translate = (function () {
    function Translate(data) {
        this._data = data;
    }
    Translate.prototype.save = function () {
        return this._data;
    };
    Translate.prototype.load = function (data) {
        this._data = data;
    };
    Translate.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Translate.prototype.generateSource = function () {
        return "__out.write(__(" + JSON.stringify(this._data) + "));__next();";
    };
    Translate.prototype.run = function (runtime, out, callback) {
        out.write(this._data);
        callback();
    };
    Translate.prototype.async = function () {
        return false;
    };
    return Translate;
}());
exports.Translate = Translate;
//# sourceMappingURL=Translate.js.map