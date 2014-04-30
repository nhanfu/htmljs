var addEle = function(text){
    html.render(getEle('qunit-fixture')).innerHTML(text);
}
var getEle = function(id){
    return document.getElementById(id);
}
module("Test common function getData");
test("test getData function", function(){
    //input
    var input = html.data(123);
    
    //test it is not a function
    equal(typeof input, 'function', 'Ok html.data is a function, not a value');
    //test it
    equal(123, html.getData(input), 'Equal succeeds if return data is 123');
});

test("test getData function - get a simple computed value", function(){
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

module("Test common function - bind");

test('Add event function to element\'s expando property - 1 methods', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'callback not run because there\'s no trigger');
    }
    
    html.bind(input, 'change', changeCallback, false);
    deepEqual(input['__engine__events__change'], [changeCallback], 'Add change callback function to input\' expando property named: __engine__events__change');
});

test('Add event function to element\'s expando property - 2 methods', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'callback not run because there\'s no trigger');
    }
    
    html.bind(input, 'change', changeCallback, false);
    html.bind(input, 'change', changeCallback, false);
    deepEqual(input['__engine__events__change'], [changeCallback, changeCallback], 'Add change callback function to input\' expando property named: __engine__events__change');
});

test('Element and callback function are not null, bind 1 method, trigger event by code', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'callback run once when user change that input\'s value or manually trigger that event');
    }
    
    html.bind(input, 'change', changeCallback, false);
    html.trigger(input, 'change');
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
    html.trigger(input, 'change');
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

module("Test dispose method");
test("Dispose an input", 1, function(){
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
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
    html.trigger(input, 'change');
});

module("Test unbindAll method");
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
    html.trigger(input, 'click');
    //Unable to fire the click event
    html.trigger(input2, 'click');
    //Unable to fire the change event
    html.trigger(input2, 'change');
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
    html.trigger(div, 'click');
    //Unable to fire the click event
    html.trigger(input, 'click');
    //Unable to fire the click event
    html.trigger(input2, 'click');
    //Unable to fire the change event
    html.trigger(input2, 'change');
    ok(true, 'No event has been fired');
});

test('Pass null value as parameter', 1, function(){
    throws(
        function() {
            html.unbindAll(null);
        },
        "Element to unbind all events must be specified"
    )
});





