var addEle = function(text){
    html.render(getEle('qunit-fixture')).innerHTML(text);
}

var getEle = function(id){
    return document.getElementById(id);
}

var clearQunitFixture = function(){
    html.get('#qunit-fixture').empty();
}

var renderChildren = function(testData){
    html.get('#qunit-fixture').each(testData, function(data, index){
                html.get(this)
                        .span(index).$()
                        .checkbox(data.checked).$().space(2)
                        .span(data.Name).$().space(5)
                        .span(data.Age).$()
                        .button('Delete').click(function(e, model){testData.remove(model);}, data).$().br()
                .$$();
        });
}

module('Test html.data APIs');

asyncTest('Test isComputed in html.data', 2, function(){
    var someString = html.data('abc');
    var testDataString = html.data(function(){
        return someString();
    });
    html('#qunit-fixture').input(testDataString).id('inputTest').$().span(testDataString).id('spanTest');
    
    someString('def');
    testDataString.refresh();
    
    setTimeout(function(){
        var input = html.querySelector('#inputTest');
        var span = html.querySelector('#spanTest');
        equal(input.value, 'def', 'The input value SHOULD BE CHANGED after setting observer value');
        equal(span.innerHTML, 'def', 'The input value SHOULD BE CHANGED after setting observer value');
        start();
    },1);
});

module('Test each method');
test('Create a list item inside qunit-fixture', function(){
        var testData = html.data([
                { Name: 'Adrew', Age: 10, checked: true },
        { Name: 'Peter', Age: 15, checked: true },
        { Name: 'Jackson', Age: 20, checked: true }
        ]);
        renderChildren(testData);
        
        ok(1, 'There are 7 emelents rendered per record');
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
        
        ok(1, 'There are 7 emelents rendered per record');
        var fixture = getEle('qunit-fixture');
        equal(fixture.children.length, 24, 'There\'re 8x3 child elements inside qunit fixture');
        testData.removeAt(2);
        equal(fixture.children.length, 16, 'After remove element at index 2, There\'re 8x2 child elements inside qunit fixture');
        testData.removeAt(1);
        equal(fixture.children.length, 8, 'After remove element at index 1, There\'re 8x1 child elements inside qunit fixture');
        equal(fixture.children[0].innerHTML, 0);
        equal(fixture.children[1].checked, true);
        equal(fixture.children[2].innerHTML, '&nbsp;&nbsp;');
        equal(fixture.children[3].innerHTML, 'Adrew');
        equal(fixture.children[4].innerHTML, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        equal(fixture.children[5].innerHTML, 10);
        equal(fixture.children[6].innerHTML, 'Delete');
        equal(fixture.children[7].nodeName.toLowerCase(), 'br');
        testData.add({ Name: 'Test', Age: 25, checked: true });
        equal(fixture.children.length, 16, 'After adding an element, There\'re 8x3 child elements inside qunit fixture');
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

asyncTest('Selecte all children by code', function(){
    
        var testData = html.data([
                { Name: 'Adrew', Age: 10, checked: html.data(true) },
        { Name: 'Peter', Age: 15, checked: html.data(true) },
        { Name: 'Jackson', Age: 20, checked: html.data(false) },
        { Name: 'Nhan', Age: 20, checked: html.data(false) },
        ]);
    
    var CheckAll_Changed = function(e){
                var checked = this.checked === true;
                for(var i = 0, j = testData().length; i < j; i++){
            testData()[i].checked(checked);
        }
        };
    
    var CheckAll = html.data(function(){
                if(!testData().length) return false;
        for(var i = 0, j = testData().length; i < j; i++){
            if(!testData()[i].checked())
                return false;
        }
        return true;
    });
    
    html('#qunit-fixture')
        .checkbox(CheckAll).id('testCheckAll').click(CheckAll_Changed).$()
    
        html.get('#qunit-fixture').div().each(testData, function(data, index){
                html.get(this)
                        .span(index).$()
                        .checkbox(data.checked).$().space(2)
                        .span(data.Name).$().space(5)
                        .span(data.Age).$()
                        .button('Delete').click(function(model){testData.remove(model);}, data).$().br()
                .$$();
        });
    
    var chkCheckAll = html('#testCheckAll').$$();
    html(chkCheckAll).trigger('click');
    
    setTimeout(function(){
        var data = testData();
        for(var i = 0, j = data.length; i < j; i++){
            equal(data[i].checked(), true, 'Ok, Checked all');
        }
        start();
    }, 2);
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
    var errorMessage = document.getElementsByClassName('html-error')[0];
    ok(!errorMessage, 'Ok, error message has been cleared.');
});

test("Maxlength and clear maxlength message", 3, function() {
    var sut = html.data("Nhan Nguyen").maxLength(15, 'Max length is 15.');
    html('#qunit-fixture').input(sut).id('testIsRequired').$();
    html('#testIsRequired').$$().value = '123456789123456789';
    html('#testIsRequired').trigger('change');
    var errorMessage = html('.html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Max length is 15.', 'Ok! Got the message as expected: Max length is 15.');
    html('#testIsRequired').$$().value = 'abcxyz';
    html('#testIsRequired').trigger('change');
    var errorMessage = document.getElementsByClassName('html-error')[0];
    ok(!errorMessage, 'Ok, error message has been cleared.');
});

test("Maxlength custom message", function() {
    var sut = html.data("Nhan Nguyen").maxLength(15, 'Name cannot be longer than 15 characters.');
    html('#qunit-fixture').input(sut).id('testIsRequired').$();
    html('#testIsRequired').$$().value = '123456789123456789';
    html('#testIsRequired').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Name cannot be longer than 15 characters.', 'Ok! Got the message as expected: Name cannot be longer than 15 characters.');
});

test("Required and max length maxlength message", 3, function() {
    var sut = html.data("Nhan Nguyen").required('Name is required.').maxLength(15, 'Name cannot be longer than 15.');
    html('#qunit-fixture').input(sut).id('testIsRequired').$();
    html('#testIsRequired').$$().value = '';
    html('#testIsRequired').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Name is required.', 'Ok! Got the message as expected: Name is required.');
    html('#testIsRequired').$$().value = '123456789123456789';
    html('#testIsRequired').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    equal(errorMessage.innerHTML, 'Name cannot be longer than 15.', 'Ok! Got the message as expected: Name cannot be longer than 15.');
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


html.data.validation.asyncRequired = function(message) {
    var self = this;
    self.validate(function(newValue, oldValue) {
        setTimeout(function() {
            if (newValue === undefined || newValue === null || newValue === '') {
                self.setValidationResult(false, message);
            }
        });
    });
    return this;
};

test("Asynchronous validation message", function() {
    var sut = html.data("Nhan Nguyen").asyncRequired("Data is required (this message is from cloud).");
    html('#qunit-fixture').input(sut).id('testRange').$();
    html('#testRange').$$().value = '';
    html('#testRange').trigger('change');
    var errorMessage = html('#qunit-fixture .html-error').$$();
    ok(errorMessage !== null && errorMessage.className === 'html-error' && errorMessage.nodeName.toLowerCase() === 'span', 'Got an error in span');
    equal(errorMessage.innerHTML, 'Data is required (this message is from cloud).', 'Ok! Got the message as expected: Data is required (this message is from cloud).');
});
