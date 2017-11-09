"use strict";
var EndIf = (function () {
    function EndIf() {
    }
    EndIf.prototype.save = function () {
        return "";
    };
    EndIf.prototype.load = function (data) { };
    EndIf.prototype.process = function (source) {
        throw new Error("This instruction can't process data");
    };
    EndIf.prototype.generateSource = function (stackControl) {
        stackControl.pop();
        return "]]], __next);}catch(e){__out.write(__error(e));__next();};";
    };
    EndIf.prototype.run = function (runtime, out, callback) {
    };
    EndIf.prototype.async = function () {
        return false;
    };
    return EndIf;
}());
exports.EndIf = EndIf;
//# sourceMappingURL=EndIf.js.map