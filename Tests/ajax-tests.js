module('Ajax and Promise');

test('Basic test for Promise, 1 done method is run.', 2, function() {
    stop(2);
    html.Promise(function(res, rej) {
        setTimeout(function() {
            res('Ok, got the data.');
            start(2);
        },5);
    })
    .done(function(data){
        ok(1, 'Should run done method, not fail.');
        ok(data === 'Ok, got the data.', 'Correct message.');
    })
    .fail(function(data) {
        ok(1, 'Shouldn\' reach here.');
    });
});

test('Basic test for Promise, 2 done methods are run.', 2, function() {
    stop(2);
    var message = 'Ok, got the data.';
    html.Promise(function(res, rej) {
        setTimeout(function() {
            res(message);
            start(2);
        },5);
    })
    .done(function(data){
        equal(data, message, 'Ok, got the data at first done method.');
    })
    .done(function(data){
        equal(data, message, 'Ok, got the data at second done method.');
    })
    .fail(function(data) {
        ok(1, 'Shouldn\' reach here.');
    });
});

test('Test for Promise, fail method is run.', 1, function() {
    var message = 'Oop, fail.';
    stop(2);
    var promise = html.Promise(function(res, rej) {
        setTimeout(function() {
            rej(message);
            start(2);
        }, 5);
    })
    .done(function(data){
        equal(data, message, 'Ok, got the data at first done method.');
    })
    .fail(function(data) {
        equal(data, message, 'Fail method run.');
    });
});

test('Test for Promise, 2 fail methods run.', 2, function() {
    var message = 'Oop, fail.';
    stop(2);
    var promise = html.Promise(function(res, rej) {
        setTimeout(function() {
            rej(message);
            start(2);
        }, 5);
    })
    .done(function(data){
        equal(data, message, 'Should not run here.');
    })
    .fail(function(data) {
        equal(data, message, 'Fail method run first time.');
    })
    .fail(function(data) {
        equal(data, message, 'Fail method run second time.');
    });
});

test('Test for Promise, mock done data.', 1, function() {
    var message = 'Done, did it.';
    stop();
    var promise = html.Promise(function(res, rej) {
        setTimeout(function() {
            res('The true data from server.');
        }, 5);
    })
    .mockDone(message)
    .done(function(data){
        equal(data, message, 'Great, data from mocking object.');
        start();
    })
    .fail(function(data) {
        equal(data, message, 'Fail method should not run.');
    });
});

test('Basic setup for getting JSON', 1, function() {
    stop();
    var mockData = {"test1":"Nhan","test2":"Nguyen"};
    html.getJSON('testData.json')
    .mockDone(mockData)
    .done(function(data) {
        ok(JSON.stringify(mockData) === JSON.stringify(data), 'Get the expected data.');
        start();
    });
});

test('Basic setup for getting JSON, test fail method and mockFail', 1, function() {
    stop();
    var mockFailReason = 'Can not get the data from server.';
        html.getJSON('testData.json')
        .mockFail(mockFailReason)
        .fail(function(data) {
            ok(JSON.stringify(mockFailReason) === JSON.stringify(data), 'Error occurs when getting data from server.');
            start();
        });
});