var testCase = require('mocha').describe
var pre = require('mocha').before
var assertions = require('mocha').assertions
var path = require('path')
var assert = require('assert')

var nhp;
it('include index.js', function() { // added "done" as parameter
    nhp = require(path.dirname(__dirname) + path.sep + "index");
    nhp = new nhp();
});
describe('Code', function() {
    describe('Constants', function() {
        it('true', function() {
            var code = nhp.compileCode("true");
            assert.equal(code.run(), true);
        });
        it('false', function() {
            var code = nhp.compileCode("false");
            assert.equal(code.run(), false);
        });
        it('null', function() {
            var code = nhp.compileCode("null");
            assert.equal(code.run(), null);
        });
        it('undefined', function() {
            var code = nhp.compileCode("undefined");
            assert.equal(code.run(), undefined);
        });
    });
    describe('Comparisons', function() {
        it('`12 == 12` == true', function() {
            var code = nhp.compileCode("12 == 12");
            assert.equal(code.run(), true);
        });
        it('`false || true` == true', function() {
            var code = nhp.compileCode("false || true");
            assert.equal(code.run(), true);
        });
        it('`false ? "Yes" : "No"` == true'/*, function() {
            var code = nhp.compileCode("false ? \"Yes\" : \"No\"");
            assert.equal(code.run(), "No");
        }*/);
    });
    describe('Brackets', function() {
        it('code false || ( 0 || "Farm" ) == "Farm"', undefined);
    });
});
var compiledTemplate;
describe('Compile', function() {
    it('compile test', function(done) {
        var compiler;
    	compiler = nhp.compile(
                __dirname + path.sep +
                "test.nhp", function(error) {
    		if(error)
    			throw error;
    		
            compiledTemplate = compiler.template;
    		done();
    	});
    });
});
describe('Template', function() {
    it('run compiled template', function(done) {
        console.log(__dirname + path.sep + "test.html");
        compiledTemplate.run(__dirname + path.sep + "test.html", {
            platform: "nodejs",
            title: "Test"
        }, done);
    });
});
