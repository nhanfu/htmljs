html.config.allowDuplicate = false;

//define styles and scripts path
html.scripts({
	apiTests: 'api-tests.js',
	htmlArrayTests: 'html.array-tests.js',
	integrationTests: 'integration-tests.js'
});
html.scripts({
	testlib: 'qunit-1.14.0.js',
	'all-tests': ['api-tests.js', 'validation.js'],
    'ajax': 'ajax-tests.js'
});

html.styles({
	'qunit': 'qunit-1.14.0.css'
});

//render scripts
html.scripts.render('testlib').done(function(){
	module('Script loading feature');
	test('Test done callback after load test lib', function(){
		ok(true, 'Script loading feature work well');
	});
	
	module("Document ready method");
	test("Check the div with the id testContainer", function(){
		html.ready(function(){
			var testContainer = html('#testContainer').$$();
			ok(testContainer !== null && testContainer.nodeName.toLowerCase() === 'div', 'Ok! select testContainer succeeded');
		});
	});
	test("Select 2 div tags with the id qunit and qunit-fixture", function(){
		html.ready(function(){
			var qunit = html('#qunit').$$();
			ok(qunit !== null && qunit.nodeName.toLowerCase() === 'div', 'Ok! select div tag with id qunit succeeded');
		});
		html.ready(function(){
			var qunit = html('#qunit-fixture').$$();
			ok(qunit !== null && qunit.nodeName.toLowerCase() === 'div', 'Ok! select div tag with id qunit-fixture succeeded');
		});
	});
}).then('all-tests').then('htmlArrayTests')
.then('ajax').then('integrationTests').then('integrationTests')
.then('moduleInjection.js').done(function(module) {
	test("Check test module is not null", function () {
		ok(html.isNotNull(module), 'Ok, module has been loaded correctly');
	});
}, ['testModule']);

//render styles
html.styles.render('qunit');