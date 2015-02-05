var testCase = require('mocha').describe
var pre = require('mocha').before
var assertions = require('mocha').assertions
var path = require('path')
var assert = require('assert')

var nhp;
it('include index.js', function() { // added "done" as parameter
    nhp = require(path.resolve(path.dirname(__dirname), "index"));
    nhp = new nhp();
});

var compiledTemplate;
describe('api', function() {
	var template;
    it('compile test', function(done) {
		template = nhp.template(path.resolve(__dirname, "test.nhp"));
		template.on("compiled", done);
		template.on("error", done);
    });
    it('run test', function(done) {
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
		}, process.stdout, function(err) {
			if(err) {
				done(err);
				return;
			}
			
			process.stdout.write("\n");
			done();
		});
    });
    it('compile false.nhp', function(done) {
		template = nhp.template(path.resolve(__dirname, "false.nhp"));
		template.on("compiled", done);
		template.on("error", done);
    });
    it('test false.nhp', function(done) {
		template.run({
			platform: "nodejs",
			name: false
		}, process.stdout, function(err) {
			if(err) {
				done(err);
				return;
			}
			
			process.stdout.write("\n");
			done();
		});
    });
});
