"use strict";
var Done = (function () {
    function Done() {
    }
    Done.prototype.save = function () {
        return "";
    };
    Done.prototype.load = function (data) { };
    Done.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Done.prototype.generateSource = function (stackControl) {
        stackControl.pop();
        return "], __next);}, __next);}catch(e){__out.write(__error(e));__next();};";
    };
    Done.prototype.run = function (runtime, out, callback) {
    };
    Done.prototype.async = function () {
        return false;
    };
    return Done;
}());
exports.Done = Done;
//# sourceMappingURL=Done.js.map