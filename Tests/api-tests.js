var addEle = function(text){
    getEle('qunit-fixture').innerHTML = text;
}
var getEle = function(id){
    return document.getElementById(id);
}
var expando = '__events__',
    expandoLength = expando.length;

var clearQunitFixture = function(){
    html('#qunit-fixture').empty();
}

module("Test common function - shorthand query");
test('Excute onload event', function(){
	var test = html('#qunit-fixture').context;
	ok(test.id === 'qunit-fixture', 'Got qunit fixture element');
});

//module("Test common function - onload event handling");
//test('Excute onload event', 1, function(){
//	html(function(){
//	    //var pointer = html('#qunit-fixture').context;
//		//ok(pointer !== null, 'qunit not null');
//		ok(true, "This line of assertion should be reached");
//	});
//});

module("Test common function - get");
test('Get a div tag with className "testQuery" id "htmlQuery"', function(){
    addEle('<div id="htmlQuery" class="testQuery" ></div>');
    var div = html('div#htmlQuery').context;
    ok(div !== null && div.id === "htmlQuery", 'Ok, query with id htmlQuery');

    var div2 = html('div.testQuery').context;
    ok(div2 !== null && div2.className === 'testQuery', 'Ok, query with className testQuery');
});

test('Get an input inside div tag with attribute type and name', function(){
    addEle('<div id="htmlQuery" class="testQuery">' +
        '<input type="text" name="shouldBeGotten" />' +
        '<input type="checkbox" name="shouldBeGotten2" />' +
        '<input type="text" name="shouldNotBeGotten" />' +
        '<input type="checkbox" name="shouldNotBeGotten2" />' +
        '</div');
    var input = html('#htmlQuery input[type="text"][name="shouldBeGotten"]').context;
    ok(input !== null && input.type === "text" && input.name === 'shouldBeGotten'
        , 'Ok, query an input with type and name attribute');

    var input2 = html('#htmlQuery input[type="checkbox"][name="shouldBeGotten2"]').context;
    ok(input2 !== null && input2.type === "checkbox" && input2.name === 'shouldBeGotten2'
        , 'Ok, query an input with type and name attribute');
});

test('Get a span inside div tag', function(){
    addEle('<div id="htmlQuery" class="testQuery">' +
        '<input type="text" name="shouldNotBeGotten" />' +
        '<input type="checkbox" name="shouldNotBeGotten2" />' +
        '<span class="shouldBeGotten"></span>' +
        '</div');

    var span = html('#htmlQuery span').context;
    ok(span !== null && span.className === "shouldBeGotten"
        , 'Ok, query a span');
});

module('Test common function - find');
test('Get a span, an input inside div tag using find', function(){
    addEle('<div id="htmlQuery" class="testQuery">' +
        '<input type="text" class="shouldBeGotten" />' +
        '<input type="checkbox" class="shouldNotBeGotten2" />' +
        '<span class="shouldBeGotten"></span>' +
        '</div');

    var span = html('#htmlQuery').find('span').context;
    ok(span.nodeName.toLowerCase() === 'span' && span.className === "shouldBeGotten"
        , 'Ok, query a span');

    var inp = html('#htmlQuery').find('input[type="text"]').context;
    ok(inp.nodeName.toLowerCase() === 'input' && inp.className === "shouldBeGotten"
        , 'Ok, query an input');
});

module("Test common function - getData");
test("test getData function", function(){
    //input
    var input = html.observable(123);

    //test it is not a function
    equal(input instanceof html.observable, true, 'The object created is html.observable');
    //test it
    equal(123, html.unwrapData(input), 'Equal succeeds if return data is 123');
});

test("test getData function - get a simple computed value", function () {
    //input
    var input = html.observable(function(){
        return 'some magic string';
    });

    //test
    equal('some magic string', html.unwrapData(input), 'Return data is a string');
});

test("test getData function - get a complex computed value", function(){
    //input
    var tmp = html.observable(123);
    var tmp2 = html.observable(456);
    var input = html.observable(function(){
        return tmp.data + tmp2.data;
    });

    equal('579', html.unwrapData(input), 'Return data is 579');
});

test("test getData function - get a null value", function(){
    //input
    var input = html.observable(null);

    equal(null, html.unwrapData(input), 'Return data is null');
});

test("test getData function - get undefined value", function(){
    //input
    var input = html.observable(undefined);
    //test it
    equal(undefined, html.unwrapData(input), 'Return data is 579');
});

module("Test common function - bind + trigger normal case");

test('Add event reference on element\'s expando property - 1 methods', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'Run code here in change event.');
    }

    html(input).onChange(changeCallback, false);
    html(input).onChange();
});

test('Add event function to element\'s expando property - 2 methods', function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e) {
        ok(true, 'Should run here once although binding change event twice, however IE < 9 call tiwce.');
    }

    html(input).onChange(changeCallback, false);
    html(input).onChange(changeCallback, false);
    html(input).onChange();
});

test('Element and callback function are not null, bind 1 method, trigger event by code', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'callback run once when user change that input\'s value or manually trigger that event');
    }

    html(input).onChange(changeCallback, false);
    html(input).onChange();
});

test('Element and callback function are not null, bind 2 method, trigger event by code', 2, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'Run first, this callback run once when user change that input\'s value or manually trigger that event');
    };
    var changeCallback2 = function(e){
        ok(true, 'Run last, this callback run once when user change that input\'s value or manually trigger that event');
    }

    html(input).onChange(changeCallback, false);
    html(input).onChange(changeCallback2, false);
    html(input).onChange();
});

test('Element and event name are not null', 2, function() {
    //create an input inside qunit-fixture
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');

    // change event
    var change = function() {
        ok(true, 'This assert shouldn\'t be reached');
    };
    // click event
    var click = function(){
        ok(true, 'Event fired, this assert should be reached');
    };

    // try to bind 2 methods
    html(input).onChange(change);
    html(input).onClick(click);

    //trigger by code to see how many events run
    html(input).trigger('change');
    html(input).trigger('click');
});

module("Test common function - createElement");
test('Create an input inside qunit fixture', function(){
    var test = html('#qunit-fixture').input;

	var fixture = document.getElementById('qunit-fixture');
	var input = fixture.getElementsByTagName('input');
	ok(true, 'An input has been added to qunit-fixture');
});

test('Create a checkbox inside qunit fixture', function(){
    var test = html('#qunit-fixture').checkbox();

	var fixture = document.getElementById('qunit-fixture');
	var input = fixture.getElementsByTagName('input')[0];
	ok(input, 'An input has been added to qunit-fixture');
	ok(input.type === 'checkbox', 'Type of input is checkbox');
});

test('Create a div inside qunit fixture', function(){
    var test = html('#qunit-fixture').div.context;
    test.id = 'Mytest';

	var div = document.getElementById('Mytest');
	ok(div, 'A div has been added to qunit-fixture and its id is Mytest');
});

test("Check old data after initialize", function () {
    var price = html.observable(100);
    var sut = html.observable(function () {
        return price.data * 0.8;
    });
    equal(sut._oldData, 80, 'Got the old value of observer object.');
});

//test empty function
module("Test empty function");
test("Remove all children element of tag", function () {
    addEle('<div id="htmlEmpty">' +
        '<h3 class="htmlEmptyTitle">This is Test case for HtmlJs Empty function.</h3>' +
        '<p>This test is done</p>' +
        '</div>');
    var parentEle = document.getElementById("htmlEmpty");
    var childNodesBeforeEmpty = parentEle.children.length;

    ok(childNodesBeforeEmpty > 0, "The element has children");
    var childNodesAfterEmpty;

    html(parentEle).empty();
    childNodesAfterEmpty = parentEle.children.length;
    equal(childNodesAfterEmpty, 0, "The element has no children");
});

test("Test throw null exception", function() {
  throws(function () {
      html(null).empty();
  }, "Expect a context to execute this function. Please query an element first.");
});

test("Element not have a child", function () {
    addEle('<div id="htmlEmptyNoChild"></div>');
    var element = document.getElementById("htmlEmptyNoChild");
    var childNodeAfterEmpty;
    html(element).empty();
    childNodesAfterEmpty = element.children.length;
    equal(childNodesAfterEmpty, 0, "An element has no child");
    equal(element.id, "htmlEmptyNoChild", "Return context");
});

test("Test throw null exception", function() {
  throws(function () {
      html(null).empty();   
  }, "Expect a context to execute this function. Please query an element first.");
});

test("Test css binding get/set", function() {
    html('#qunit-fixture').button.text('Click me')
        .attr({id: 'myButton'})
        .css({backgroundColor: "rgb(48, 113, 169)"});

    equal(html('#myButton').css('backgroundColor'), "rgb(48, 113, 169)", 'The button background color is "rgb(48, 113, 169)"');
});