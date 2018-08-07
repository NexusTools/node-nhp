"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support").install();
const assert = require("assert");
const NHP_1 = require("../lib/NHP");
const path = require("path");
require("mocha");
describe('api', function () {
    var nhp = new NHP_1.NHP();
    var template;
    it('compile test', function (done) {
        template = nhp.template(path.resolve(__dirname, "test.nhp"));
        template.on("compiled", done);
        template.on("error", done);
    });
    it('run test', function (done) {
        template.render({
            platform: "nodejs",
            title: "Many people",
            entries: [
                "Dog",
                "Snake",
                "Hamster",
                "Bird",
                "Cat",
                "Cow"
            ],
            html: "<textarea></textarea>",
            name: false
        }, function (err, html) {
            console.log(html);
            if (err)
                done(err);
            else {
                assert.ok(html.indexOf("Father Harrington") > -1);
                done();
            }
        });
    });
    it('compile false.nhp', function (done) {
        template = nhp.template(path.resolve(__dirname, "false.nhp"));
        template.on("compiled", done);
        template.on("error", done);
    });
    it('test false.nhp', function (done) {
        template.render({
            platform: "nodejs",
            name: false
        }, function (err, html) {
            if (err) {
                done(err);
                return;
            }
            done();
        });
    });
    it('translate false.nhp', function (done) {
        template.render({
            __: function (text) {
                return text.replace(/Entry/ig, "Soup");
            },
            platform: "nodejs",
            name: false
        }, function (err, html) {
            if (err) {
                done(err);
                return;
            }
            done();
        });
    });
});
//# sourceMappingURL=tests.js.map