var addEle = function (text) {
    getEle('qunit-fixture').innerHTML = text;
}

var getEle = function (id) {
    return document.getElementById(id);
}

var clearQunitFixture = function () {
    html('#qunit-fixture').empty();
}

var renderChildren = function (testData) {
    html('#qunit-fixture').each(testData, function (data, index) {
        html.span.text(index).$
            .checkbox(data.checked).$.span.text('  ').$
            .span.text(data.Name).$.span.text('     ').$
            .span.text(data.Age).$
            .button.text('Delete').onClick(function (e, model) {
                testData.remove(model);
            }, data).$.br;
    });
}

module('Test html.observable APIs');

test('Test isComputed in html.observable', 2, function () {
    stop();
    var someString = html.observable('abc');
    var testDataString = html.observable(function () {
        return someString.data;
    });

    // binding to input and span
    html('#qunit-fixture')
        .input.value(someString).attr('id', 'inputTest').$
        .span.text(testDataString).attr('id', 'spanTest').$;

    someString.data = ('def');
    var input = html('#inputTest').context;
    var span = html('#spanTest').context;
    equal(input.value, 'def', 'The input value SHOULD BE CHANGED after setting observer value');

    setTimeout(function () {
        equal(span.innerHTML, 'def', 'The input value SHOULD BE CHANGED after setting observer value');
        start();
    });
});

module('Test each method');
test('Create a list item inside qunit-fixture', function () {
    var testData = html.observableArray([
        { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
    ]);
    renderChildren(testData);

    var fixture = getEle('qunit-fixture');
    equal(fixture.children.length, 24, 'There\'re 7x3 child elements inside qunit fixture');
});

test('Delete/Add an item in qunit-fixture', function () {
    var testData = html.observableArray([
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

test('Add an element at first index', function () {
    var testData = html.observableArray([
        { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
    ]);

    renderChildren(testData);
    var fixture = getEle('qunit-fixture');
    ok(fixture.children.length, 24, 'Qunit has 24 child elements');
    testData.add({ Name: 'Nhan', Age: '25' }, 0);
    ok(fixture.children.length, 32, 'Qunit has 8x4 child elements');
    equal(fixture.children[3].innerHTML, 'Nhan', 'Ok, value at element 4 is Nhan');

    clearQunitFixture();
});

test('Add an element at last index', function () {
    var testData = html.observableArray([
        { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
    ]);

    renderChildren(testData);
    var fixture = getEle('qunit-fixture');
    ok(fixture.children.length, 24, 'Qunit has 24 child elements');
    testData.push({ Name: 'Nhan', Age: 25 });
    ok(fixture.children.length, 32, 'Qunit has 8x4 child elements');
    equal(fixture.children[27].innerHTML, 'Nhan', 'Ok, value at element 28 is Nhan');
    equal(fixture.children[29].innerHTML, '25', 'Ok, value at element 30 is 24');

    clearQunitFixture();
});

test('Trigger button delete by code', function () {
    var testData = html.observableArray([
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

test('Select all children by code', function () {
    stop();
    var testData = html.observableArray([
        { Name: 'Adrew', Age: 10, checked: html.observable(true) },
        { Name: 'Peter', Age: 15, checked: html.observable(true) },
        { Name: 'Jackson', Age: 20, checked: html.observable(false) },
        { Name: 'Nhan', Age: 20, checked: html.observable(false) }
    ]);

    var CheckAll_Changed = function (e) {
        var checked = this.checked === true;
        for (var i = 0, j = testData.data.length; i < j; i++) {
            testData.data[i].checked.data = checked;
        }
    };

    var CheckAll = html.observable(function () {
        if (!testData.data.length) return false;
        for (var i = 0, j = testData.data.length; i < j; i++) {
            if (!testData.data[i].checked.data) return false;
        }
        return true;
    });

    function removeChild(model) {
        testData.remove(model);
    }
    html('#qunit-fixture').checkbox(CheckAll).attr('id', 'chkCheckAll').onClick(CheckAll_Changed).$()

    html('#qunit-fixture').div.each(testData, function (data, index) {
        html.span.text(index).$
            .checkbox(data.checked).$.span.text('&nbsp;&nbsp;').$
            .span.text(data.Name).$.span.text('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;').$
            .span.text(data.Age).$
            .button.text('Delete').onClick(removeChild, data).$.br;
    });

    html('#chkCheckAll').trigger('click');

    setTimeout(function () {
        var data = testData.data;
        for (var i = 0, j = data.length; i < j; i++) {
            equal(data[i].checked.data, true, 'Ok, Checked all');
        }
        start();
    }, 2);
});

test('ClassName binding', function () {
    var selectedClass = html.observable('selected');
    var testClass = html.observable('');
    html('#qunit-fixture').div.attr('id', 'sut').className(selectedClass).className(testClass);

    var div = document.getElementById('sut');
    equal(div.className, 'selected', 'ClassName should be "selected"');
    selectedClass.data = '';
    equal(div.className, '', 'ClassName should be ""');
    selectedClass.data = 'selected';
    testClass.data = 'test';
    equal(div.className, 'selected test', 'ClassName should be "selected"');
});