var addEle = function(text){
    html(getEle('qunit-fixture')).innerHTML(text);
}
var getEle = function(id){
    return document.getElementById(id);
}
var expando = '__events__',
    expandoLength = expando.length;

var clearQunitFixture = function(){
    html.get('#qunit-fixture').empty();
}

var renderChildren = function(testData){
    html.get('#qunit-fixture').div().each(testData, function(data, index){
		html.get(this)
			.span(index).$()
			.checkbox(data.checked).$().space(2)
			.span(data.Name).$().space(5)
			.span(data.Age).$()
			.button('Delete').click(function(model){testData.remove(model);}, data).$().br()
		.$$();
	});
};

module("Test common function - shorthand query");
test('Excute onload event', function(){
	var test = html('#qunit-fixture').$$();
	ok(test.id === 'qunit-fixture', 'Got qunit fixture element');
});

//module("Test common function - onload event handling");
//test('Excute onload event', 1, function(){
//	html(function(){
//	    //var pointer = html('#qunit-fixture').$$();
//		//ok(pointer !== null, 'qunit not null');
//		ok(true, "This line of assertion should be reached");
//	});
//});

module("Test common function - get");
test('Get a div tag with className "testQuery" id "htmlQuery"', function(){
    addEle('<div id="htmlQuery" class="testQuery" ></div>');
    var div = html.get('div#htmlQuery').$$();
    ok(div !== null && div.id === "htmlQuery", 'Ok, query with id htmlQuery');

    var div2 = html.get('div.testQuery').$$();
    ok(div2 !== null && div2.className === 'testQuery', 'Ok, query with className testQuery');
});

test('Get an input inside div tag with attribute type and name', function(){
    addEle('<div id="htmlQuery" class="testQuery">' +
        '<input type="text" name="shouldBeGotten" />' +
        '<input type="checkbox" name="shouldBeGotten2" />' +
        '<input type="text" name="shouldNotBeGotten" />' +
        '<input type="checkbox" name="shouldNotBeGotten2" />' +
        '</div');
    var input = html.get('#htmlQuery input[type="text"][name="shouldBeGotten"]').$$();
    ok(input !== null && input.type === "text" && input.name === 'shouldBeGotten'
        , 'Ok, query an input with type and name attribute');

    var input2 = html.get('#htmlQuery input[type="checkbox"][name="shouldBeGotten2"]').$$();
    ok(input2 !== null && input2.type === "checkbox" && input2.name === 'shouldBeGotten2'
        , 'Ok, query an input with type and name attribute');
});

test('Get a span inside div tag', function(){
    addEle('<div id="htmlQuery" class="testQuery">' +
        '<input type="text" name="shouldNotBeGotten" />' +
        '<input type="checkbox" name="shouldNotBeGotten2" />' +
        '<span class="shouldBeGotten"></span>' +
        '</div');

    var span = html.get('#htmlQuery span').$$();
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

    var span = html.get('#htmlQuery').find('span').$$();
    ok(span.nodeName.toLowerCase() === 'span' && span.className === "shouldBeGotten"
        , 'Ok, query a span');

    var inp = html.get('#htmlQuery').find('input[type="text"]').$$();
    ok(inp.nodeName.toLowerCase() === 'input' && inp.className === "shouldBeGotten"
        , 'Ok, query an input');
});

module("Test common function - getData");
test("test getData function", function(){
    //input
    var input = html.data(123);

    //test it is not a function
    equal(typeof input, 'function', 'Ok html.data is a function, not a value');
    //test it
    equal(123, html.getData(input), 'Equal succeeds if return data is 123');
});

test("test getData function - get a simple computed value", function () {
    //input
    var input = html.data(function(){
        return 'some magic string';
    });

    //test
    equal('some magic string', html.getData(input), 'Return data is a string');
});

test("test getData function - get a complex computed value", function(){
    //input
    var tmp = html.data(123);
    var tmp2 = html.data(456);
    var input = html.data(function(){
        return tmp() + tmp2();
    });

    equal('579', html.getData(input), 'Return data is 579');
});

test("test getData function - get a null value", function(){
    //input
    var input = html.data(null);

    equal(null, html.getData(input), 'Return data is null');
});

test("test getData function - get undefined value", function(){
    //input
    var input = html.data(undefined);
    //test it
    equal(undefined, html.getData(input), 'Return data is 579');
});

module("Test common function - bind + trigger normal case");

test('Add event reference on element\'s expando property - 1 methods', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'Run code here in change event.');
    }

    html.bind(input, 'change', changeCallback, false);
    html(input).trigger('change');
});

test('Add event function to element\'s expando property - 2 methods', function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'Should run here once although binding change event twice, however IE < 9 call tiwce.');
    }

    html.bind(input, 'change', changeCallback, false);
    html.bind(input, 'change', changeCallback, false);
    html(input).trigger('change');
});

test('Element and callback function are not null, bind 1 method, trigger event by code', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'callback run once when user change that input\'s value or manually trigger that event');
    }

    html.bind(input, 'change', changeCallback, false);
    html(input).trigger('change');
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

    html.bind(input, 'change', changeCallback, false);
    html.bind(input, 'change', changeCallback2, false);
    html(input).trigger('change');
});

test('Element is null', 1, function(){
    throws(
        function() {
            html.bind(undefined, 'change', null, false);
        },
        "Element must be specified"
    );
});

test('Event name is null', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');

    throws(
        function() {
            html.bind(input, null, null, false);
        },
        "Event name must be specified"
    );
});

test('Element is not null but callback is null', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');

    throws(
        function() {
            html.bind(input, 'change', null, false);
        },
        "Callback must be specified"
    );
});

module("Test common function - trigger");
test('Trigger no element', 1, function(){
    throws(
        function(){
            html(null).trigger('click');
        },
        'Element must be specified'
    )
});
test('Trigger no event', 1, function(){
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    throws(
        function(){
            html(input).trigger(null);
        },
        'Event name must be specified'
    )
});

module("Test common function - dispose");
test("Dispose an input", 1, function(){
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    html.dispose(input);
    equal(getEle('qunit-fixture').children.length, 0, 'Removed the element from qunit-fixture');
});

test("Dispose an input, that input has no parent", 1, function(){
    var input = document.createElement('input');
    html.dispose(input);
    equal(getEle('qunit-fixture').children.length, 0, 'Removed the element from qunit-fixture');
});

test("Avoid memory leak", 1, function(){
    //add 2 inputs into qunit-fixture div
    addEle('<input id="bindTest" type="text" value="123" /><input id="removed" type="text" value="123" />');
    var input = getEle('bindTest');
    var _removed = getEle('removed');

    //binding change event to first input
    html.bind(input, 'change', function(){
        ok(getEle('removed') === null, 'Test if the removed input has been dispose from memory');
    });

    //dispose the second input
    html.dispose(_removed);
    //run event to see whether the second input has been removed
    html(input).trigger('change');
});

module("Test common function - unbindAll");
test('Unbind every event within qunit-fixture', 1, function(){
    //create 2 inputs inside qunit-fixture
    addEle('<input id="bindTest" type="text" value="123" /><input id="removed" type="text" value="123" />');
    var input = getEle('bindTest');
    var input2 = getEle('removed');

    //binding click event to input 1
    html.bind(input, 'click', function(){
        ok(true, 'This assertion shouldn\'t be reached');
    });
    //binding click event to input 2
    html.bind(input2, 'click', function(){
        ok(true, 'This assertion shouldn\'t be reached');
    });

    //binding change event to input 2
    html.bind(input2, 'change', function(){
        ok(true, 'This assertion shouldn\'t be reached');
    });

    //unbindAll
    html.unbindAll(getEle('qunit-fixture'));

    //Unable to fire the click event
    html(input).trigger('click');
    //Unable to fire the click event
    html(input2).trigger('click');
    //Unable to fire the change event
    html(input2).trigger('change');
    ok(true, 'No event has been fired');
});

test('Unbind every event within qunit-fixture, unbind recursively', 1, function(){
    //create 2 inputs inside qunit-fixture
    addEle('<div id="unbind"><input id="bindTest" type="text" value="123" /><input id="removed" type="text" value="123" /></div>');
    var div = getEle('unbind');
    var input = getEle('bindTest');
    var input2 = getEle('removed');

    //binding click event to the div
    html.bind(div, 'click', function(){
        ok(true, 'This assertion shouldn\'t be reached');
    });
    //binding click event to input 1
    html.bind(input, 'click', function(){
        ok(true, 'This assertion shouldn\'t be reached');
    });
    //binding click event to input 2
    html.bind(input2, 'click', function(){
        ok(true, 'This assertion shouldn\'t be reached');
    });

    //binding change event to input 2
    html.bind(input2, 'change', function(){
        ok(true, 'This assertion shouldn\'t be reached');
    });

    //unbindAll
    html.unbindAll(getEle('unbind'));

    //Unable to fire the click event
    html(div).trigger('click');
    //Unable to fire the click event
    html(input).trigger('click');
    //Unable to fire the click event
    html(input2).trigger('click');
    //Unable to fire the change event
    html(input2).trigger('change');
    ok(true, 'No event has been fired');
});

test('Pass null value as parameter', 1, function(){
    throws(
        function() {
            html(null).unbindAll();
        },
        "Element to unbind all events must be specified"
    )
});

module("Test common function - unbind");
test('Element is null', function(){
    throws(
        function(){
            html.unbind(null, 'change', function(){})
        },
        'Element to unbind event must be specified'
    )
});

test('Event name is null', function(){
    //create an input inside qunit-fixture
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    throws(
        function(){
            html(input).unbind(null, function(){});
        },
        'Event name must be specified'
    )
});

test('Element and event name are not null', 1, function() {
    //create an input inside qunit-fixture
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');

    //change event
    var change = function(){
        ok(true, 'This assert shouldn\'t be reached');
    };
    //click event
    var click = function(){
        ok(true, 'Event fired, this assert should be reached');
    };

    //try to bind 2 methods
    html.bind(input, 'change', change);
    html.bind(input, 'click', click);

    //unbind one
    html(input).unbind('change', change);

    //trigger by code to see how many events run
    html(input).trigger('change');
    html(input).trigger('click');
});

module("Test common function - subscribe");
test('Subscribe to null object', function(){
    html.subscribe(null, function(){});
    ok(true, 'No exception thrown');
});

test('Subscribe to non observerable object', function(){
    html.subscribe({}, function(){});
    ok(true, 'No exception thrown');
});

test('Subscribe by no method', function(){
    html.subscribe(test, null);
    ok(true, 'No exception thrown');
});

module("Test common function - unsubscribe");
test('Unsubscribe from null object', function(){
    html.unsubscribe(null, function(){});
    ok(true, 'No exception thrown');
});

test('Unsubscribe from non observerable object', function(){
    html.unsubscribe({}, function(){});
    ok(true, 'No exception thrown');
});

test('Unsubscribe by no method', function(){
    html.subscribe(test, null);
    ok(true, 'No exception thrown');
});

module("Test common function - createElement");
test('Create an input inside qunit fixture', function(){
    var test = html.get('#qunit-fixture').createElement('input');

	var fixture = document.getElementById('qunit-fixture');
	var input = fixture.getElementsByTagName('input');
	ok(true, 'An input has been added to qunit-fixture');
});

test('Create a checkbox inside qunit fixture', function(){
    var test = html.get('#qunit-fixture').createElement('input', 'checkbox');

	var fixture = document.getElementById('qunit-fixture');
	var input = fixture.getElementsByTagName('input')[0];
	ok(input, 'An input has been added to qunit-fixture');
	ok(input.type === 'checkbox', 'Type of input is checkbox');
});

test('Create a div inside qunit fixture', function(){
    var test = html.get('#qunit-fixture').createElement('div');
    test.id = 'Mytest';

	var div = document.getElementById('Mytest');
	ok(div, 'A div has been added to qunit-fixture and its id is Mytest');
});

module('Array utils');
test('each method', function () {
    var eachNative = Array.prototype.eachNative;
    Array.prototype.each = eachNative;
    var data = [10, 2, 4, 12, 35];
    html.array.each.call(data, function (number, index) {
        ok(number, 'The current number is ' + number);
    });
    Array.prototype.each = eachNative;
});
test('reduce method', function () {
    var reduceNative = Array.prototype.reduce;
    Array.prototype.reduce = null;
    var data = [10, 2, 4, 12, 35];
    var result = html.array.reduce.call(data, function (first, second) {
        return first + second;
    }, 0);
    equal(result, 63, 'Reduce the list to calculate sum of array number');
    Array.prototype.reduce = reduceNative;
});

module("Utilities");
test("isNumber", function () {
    ok(html.isNumber(5), '5 is a number');
    ok(!html.isNumber('5'), '"5" is not a number');
    ok(!html.isNumber('ABC'), '"ABC" is not a number');
});
test("Document ready", function () {
    html(function () {
        ok(true, 'Document ready function.');
    });
});
test("Trim, trim left, trim right", function () {
    var test = '   abc  ';
    equal(html.trimLeft(test), 'abc  ', 'Trim left works');
    equal(html.trimRight(test), '   abc', 'Trim right works');
    equal(html.trim(test), 'abc', 'Trim works');
});
test("Expando function", function () {
    var key = 'randomNum',
        value = 123456;
    html('#qunit-fixture').div.id('sut').expando('randomNum', 123456);
    equal(html(html.id.sut).expando(key), value, 'Value from expando property "randomNum" of div#sut is 123456');
});

test("Check old data after initialize", function () {
    var price = html.data(100);
    var sut = html.data(function () {
        return price() * 0.8;
    });
    equal(sut._oldData, 80, 'Got the old value of observer object.');
});