var addEle = function(text){
    html.render(getEle('testContainer')).innerHTML(text);
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

module("test common function - bind (means binding event)");
test('normal case, element and callback function are not null', 1, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    var changeCallback = function(e){
        ok(true, 'callback run once when user change that input\'s value or manually trigger that event');
    }
    
    html.bind(input, 'change', changeCallback, false);
    html.trigger(input, 'change');
});

test('normal case, element and callback function are not null', 2, function(){
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

test('abnormal case, element is not null but callback is null', 0, function(){
    //create input
    addEle('<input id="bindTest" type="text" value="123" />');
    var input = getEle('bindTest');
    
    html.bind(input, 'change', null, false);
});

module("Clear test Container");
test("Just clear test Container children", 1, function(){
    html.empty(getEle('testContainer'));
    ok(getEle('testContainer').children.length === 0, 'Clear all children of test container');
});