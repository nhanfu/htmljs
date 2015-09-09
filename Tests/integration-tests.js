var addEle = function(text){
    html(getEle('qunit-fixture')).innerHTML(text);
}

var getEle = function(id){
    return document.getElementById(id);
}

var clearQunitFixture = function(){
    html('#qunit-fixture').empty();
}

var renderChildren = function(testData){
    html('#qunit-fixture').each(testData, function(data, index){
        html.span.text(index).$
            .checkbox(data.checked).$.span.text('  ').$
            .span.text(data.Name).$.span.text('     ').$
            .span.text(data.Age).$
            .button.text('Delete').click(function (e, model) {
                testData.remove(model);
            }, data).$.br
    });
}

module('Test html.data APIs');

test('Test isComputed in html.data', 2, function () {
	stop();
    var someString = html.data('abc');
    var testDataString = html.data(function(){
        return someString();
    });

	// binding to input and span
    html('#qunit-fixture')
		.input(someString).id('inputTest').$
		.span.text(testDataString).id('spanTest').$;

    someString('def');
	var input = html('#inputTest').$$();
	var span = html('#spanTest').$$();
	equal(input.value, 'def', 'The input value SHOULD BE CHANGED after setting observer value');
	setTimeout(function () {
		equal(span.innerHTML, 'def', 'The input value SHOULD BE CHANGED after setting observer value');
		start();
	});
});

module('Test each method');
test('Create a list item inside qunit-fixture', function(){
        var testData = html.data([
                { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
        ]);
        renderChildren(testData);

        var fixture = getEle('qunit-fixture');
        equal(fixture.children.length, 24, 'There\'re 7x3 child elements inside qunit fixture');
});

test('Delete/Add an item in qunit-fixture', function(){
        var testData = html.data([
                { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
        ]);
        renderChildren(testData);

        var fixture = getEle('qunit-fixture');
        equal(fixture.children.length, 24, 'There\'re 8x3 child elements inside qunit fixture');
        testData.removeAt(2);
        equal(fixture.children.length, 16, 'After remove element at index 2, There\'re 8x2 child elements inside qunit fixture');
        testData.removeAt(1);
        equal(fixture.children.length, 8, 'After remove element at index 1, There\'re 8x1 child elements inside qunit fixture');
        equal(fixture.children[0].innerHTML, 0);
        equal(fixture.children[1].checked, true);
        equal(fixture.children[2].innerHTML, '  ');
        equal(fixture.children[3].innerHTML, 'Adrew');
        equal(fixture.children[4].innerHTML, '     ');
        equal(fixture.children[5].innerHTML, 10);
        equal(fixture.children[6].innerHTML, 'Delete');
        equal(fixture.children[7].nodeName.toLowerCase(), 'br');
        testData.add({ Name: 'Test', Age: 25, checked: true });
        equal(fixture.children.length, 16, 'After adding an element, There\'re 8x3 child elements inside qunit fixture');
        clearQunitFixture();
});

test('Move an item in qunit-fixture', function(){
        var testData = html.data([
            { Name: 'Adrew', Age: 10, checked: true },
            { Name: 'Peter', Age: 15, checked: false },
            { Name: 'Jackson', Age: 20, checked: true }
        ]);
        renderChildren(testData);

        var fixture = getEle('qunit-fixture');
        testData.move(0, 1);
        equal(fixture.children[0].innerHTML, 1);
        equal(fixture.children[1].checked, false);
        equal(fixture.children[2].innerHTML, '  ');
        equal(fixture.children[3].innerHTML, 'Peter');
        equal(fixture.children[4].innerHTML, '     ');
        equal(fixture.children[5].innerHTML, 15);
        equal(fixture.children[6].innerHTML, 'Delete');
        equal(fixture.children[7].nodeName.toLowerCase(), 'br');

        clearQunitFixture();
});

test('Add an element at first index', function(){
        var testData = html.data([
                { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
        ]);

        renderChildren(testData);
        var fixture = getEle('qunit-fixture');
        ok(fixture.children.length, 24, 'Qunit has 24 child elements');
        testData.add({Name: 'Nhan', Age: '25'}, 0);
        ok(fixture.children.length, 32, 'Qunit has 8x4 child elements');
        equal(fixture.children[3].innerHTML, 'Nhan', 'Ok, value at element 4 is Nhan');

        clearQunitFixture();
});

test('Add an element at last index', function(){
        var testData = html.data([
                { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
        ]);

        renderChildren(testData);
        var fixture = getEle('qunit-fixture');
        ok(fixture.children.length, 24, 'Qunit has 24 child elements');
        testData.push({Name: 'Nhan', Age: 25});
        ok(fixture.children.length, 32, 'Qunit has 8x4 child elements');
        equal(fixture.children[27].innerHTML, 'Nhan', 'Ok, value at element 28 is Nhan');
        equal(fixture.children[29].innerHTML, '25', 'Ok, value at element 30 is 24');

        clearQunitFixture();
});

test('Trigger button delete by code', function(){
        var testData = html.data([
                { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
        ]);

        renderChildren(testData);
        var fixture = getEle('qunit-fixture');
        ok(fixture.children.length, 24, 'Qunit has 24 child elements');

        var firstDeleteButton = document.getElementsByTagName('button')[0];
        html(firstDeleteButton).trigger('click');
        equal(fixture.children.length, 16, 'After triggering click event on first delete button, there\'re 16 child elements in fixture');

        clearQunitFixture();
});

test('Selecte all children by code', function(){
    stop();
    var testData = html.data([
        { Name: 'Adrew', Age: 10, checked: html.data(true) },
        { Name: 'Peter', Age: 15, checked: html.data(true) },
        { Name: 'Jackson', Age: 20, checked: html.data(false) },
        { Name: 'Nhan', Age: 20, checked: html.data(false) }
    ]);

    var CheckAll_Changed = function(e){
        var checked = this.checked === true;
        for(var i = 0, j = testData().length; i < j; i++){
            testData()[i].checked(checked);
        }
    };

    var CheckAll = html.data(function(){
        if(!testData().length) return false;
        for(var i = 0, j = testData().length; i < j; i++) {
            if (!testData()[i].checked()) return false;
        }
        return true;
    });

    html('#qunit-fixture').checkbox(CheckAll).id('chkCheckAll').click(CheckAll_Changed).$()

    html.get('#qunit-fixture').div.each(testData, function(data, index) {
        html.span.text(index).$
            .checkbox(data.checked).$.span.text('&nbsp;&nbsp;').$
            .span.text(data.Name).$.span.text('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;').$
            .span.text(data.Age).$
            .button.text('Delete').click(function(model){testData.remove(model);}, data).$.br;
    });

    html('#chkCheckAll').trigger('click');

    setTimeout(function() {
        var data = testData();
        for(var i = 0, j = data.length; i < j; i++){
            equal(data[i].checked(), true, 'Ok, Checked all');
        }
        start();
    }, 2);
});

test('Filter a list', function () {
    var testData = html.data([
        { Name: 'Adrew', Age: 10, checked: html.data(true) },
        { Name: 'Peter', Age: 15, checked: html.data(true) },
        { Name: 'Jackson', Age: 20, checked: html.data(false) },
        { Name: 'Nhan', Age: 20, checked: html.data(false) }
    ]);
    var searchText = html.data('');

    html('#qunit-fixture')
        .searchbox(testData, searchText).$
        .div
        .each(testData, function(data, index) {
            html.span.text(index).$
                .checkbox(data.checked).$.span.text('&nbsp;&nbsp;').$
                .span.text(data.Name).$.span.text('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;').$
                .span.text(data.Age).$
                .button.text('Delete').click(function(model){testData.remove(model);}, data).$.br;
        });

    searchText('Peter');
    var numOfElement = html('#qunit-fixture div').$$().children.length;
    equal(numOfElement, 8, 'Only one record left');

});

module("Validation");
test("Required and clear required message", 3, function() {
    var sut = html.data("Nhan Nguyen").required('Full name is required.');
    html('#qunit-fixture').input(sut).id('testIsRequired').$();
    html('#testIsRequired').$$().value = '';
    html('#testIsRequired').trigger('change');
    var errorMessage = html('.html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Full name is required.', 'Ok! Got the message as expected: Full name is required.');
    html('#testIsRequired').$$().value = 'abcxyz';
    html('#testIsRequired').trigger('change');
    var errorMessage = html.query('.html-error')[0];
    ok(!errorMessage, 'Ok, error message has been cleared.');
});

test("Maxlength and clear maxlength message", 3, function() {
    var sut = html.data("Nhan Nguyen").maxLength(15, 'Max length is 15.');
    html('#qunit-fixture').input(sut).id('maxLength').$();
    html('#maxLength').$$().value = '123456789123456789';
    html('#maxLength').trigger('change');
    var errorMessage = html('.html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Max length is 15.', 'Ok! Got the message as expected: Max length is 15.');
    html('#maxLength').$$().value = 'abcxyz';
    html('#maxLength').trigger('change');
    var errorMessage = html.query('.html-error')[0];
    ok(!errorMessage, 'Ok, error message has been cleared.');
});

test("Maxlength custom message", function() {
    var sut = html.data("Nhan Nguyen").maxLength(15, 'Name cannot be longer than 15 characters.');
    html('#qunit-fixture').input(sut).id('testmaxLength').$();
    html('#testmaxLength').$$().value = '123456789123456789';
    html('#testmaxLength').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Name cannot be longer than 15 characters.', 'Ok! Got the message as expected: Name cannot be longer than 15 characters.');
});

test("range message", function() {
    var sut = html.data("Nhan Nguyen").range(5, 10);
    html('#qunit-fixture').input(sut).id('testRange').$();
    html('#testRange').$$().value = 'aaa';
    html('#testRange').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'The value must be a number.', 'Ok! Got the message as expected: The value must be a number.');
    html('#testRange').$$().value = '4';
    html('#testRange').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    equal(errorMessage.innerHTML, 'The value can\'t be less than 5.', 'Ok! Got the message as expected: The value can\'t be less than 5.');

    html('#testRange').$$().value = '11';
    html('#testRange').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    equal(errorMessage.innerHTML, 'The value can\'t be greater than 10.', 'Ok! Got the message as expected: The value can\'t be greater than 10.');
});

test("Required and max length maxlength message", 3, function() {
    var sut = html.data("Nhan Nguyen").required('Name is required.').maxLength(15, 'Name cannot be longer than 15.');
    html('#qunit-fixture').input(sut).id('twoValidators').$();
    html('#twoValidators').$$().value = '';
    html('#twoValidators').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Name is required.', 'Ok! Got the message as expected: Name is required.');
    html('#twoValidators').$$().value = '123456789123456789';
    html('#twoValidators').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    equal(errorMessage.innerHTML, 'Name cannot be longer than 15.', 'Ok! Got the message as expected: Name cannot be longer than 15.');
});

test("Asynchronous validation message (ajax - jsonp)", function() {
    stop();
    var sut = html.data("Nhan Nguyen").asyncRequired2();
    html('#qunit-fixture').input(sut).id('testRequire').$();
    html('#testRequire').$$().value = '';
    html('#testRequire').trigger('change');
    setTimeout(function() {
        var errorMessage = html('#qunit-fixture .html-error').$$();
        ok(errorMessage && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
        equal(errorMessage && errorMessage.innerHTML, 'Data is required (from jsonp).', 'Ok! Got the message as expected: Data is required (from jsonp).');
        start();
    }, 100);
});

test("Asynchronous validation message (setTimeout)", function() {
    stop();
    var sut = html.data("Nhan Nguyen").asyncRequired1("Data is required (this message is from cloud).");
    html('#qunit-fixture').input(sut).id('testRange').$();
    html('#testRange').$$().value = '';
    html('#testRange').trigger('change');
    setTimeout(function() {
        var errorMessage = html('#qunit-fixture .html-error').$$();
        ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
        equal(errorMessage.innerHTML, 'Data is required (this message is from cloud).', 'Ok! Got the message as expected: Data is required (this message is from cloud).');
        start();
    }, 100);
});

module('Test binding');
test('iff binding', function () {
	var condition = html.data(true);
	html('#qunit-fixture').iff(condition, function () {
		html.input('I did it').id('iff').$.span.text('I did it').$;
	});
	equal(html('#qunit-fixture').element().children.length, 2, 'There\'re 2 elements inside if container');
	condition(false);
	equal(html('#qunit-fixture').element().children.length, 0, 'There\'re no elements inside if container');
});

test('ClassName binding', function () {
    var selectedClass = html.data('selected');
    var testClass = html.data('');
    html.get('#qunit-fixture').createElement('div');
    html.id('sut').className(selectedClass).className(testClass);

	var div = document.getElementById('sut');
	equal(div.className, 'selected', 'ClassName should be "selected"');
    selectedClass('');
	equal(div.className, '', 'ClassName should be ""');
    selectedClass('selected');
    testClass('test');
    equal(div.className, 'selected test', 'ClassName should be "selected"');
});