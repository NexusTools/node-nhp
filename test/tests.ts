require("source-map-support").install();
import { Template } from "../lib/Template";
import { NHP } from "../lib/NHP";
import path = require('path');
import "mocha";

var compiledTemplate;
describe('api', function () {
    var nhp = new NHP();
    var template: Template;
    it('compile test', function (done) {
        template = nhp.template(path.resolve(__dirname, "test.nhp"));
        template.on("compiled", done);
        template.on("error", done);
    });
    it('run test', function (done) {
        template.run({
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
        }, process.stdout, function (err) {
            if (err) {
                done(err);
                return;
            }

            process.stdout.write("\n");
            done();
        });
    });
    it('compile false.nhp', function (done) {
        template = nhp.template(path.resolve(__dirname, "false.nhp"));
        template.on("compiled", done);
        template.on("error", done);
    });
    it('test false.nhp', function (done) {
        template.run({
            platform: "nodejs",
            name: false
        }, process.stdout, function (err) {
            if (err) {
                done(err);
                return;
            }

            process.stdout.write("\n");
            done();
        });
    });
    it('translate false.nhp', function (done) {
        template.run({
            __: function (text: string) {
                return text.replace(/Entry/ig, "Soup");
            },
            platform: "nodejs",
            name: false
        }, process.stdout, function (err) {
            if (err) {
                done(err);
                return;
            }

            process.stdout.write("\n");
            done();
        });
    });
});
