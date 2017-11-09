"use strict";
var Else = (function () {
    function Else() {
    }
    Else.prototype.save = function () {
        return "";
    };
    Else.prototype.load = function (data) { };
    Else.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    Else.prototype.generateSource = function (stackControl) {
        stackControl.pop();
        stackControl.push();
        return "]],[function(){return true;}, [";
    };
    Else.prototype.run = function (runtime, out, callback) { };
    Else.prototype.async = function () {
        return false;
    };
    return Else;
}());
exports.Else = Else;
//# sourceMappingURL=Else.js.map