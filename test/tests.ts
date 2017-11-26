require("source-map-support").install();
import { Template } from "../lib/Template";
import assert = require('assert');
import { NHP } from "../lib/NHP";
import path = require('path');
import "mocha";

describe('api', function () {
    var nhp = new NHP();
    var template: Template;
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
        }, function(err, html) {
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
            __: function (text: string) {
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
