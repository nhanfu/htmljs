/* AJAX MODULE */
//must implement ajax using Promise pattern
//we can reuse jQuery ajax for fast release
//firstly, try to implement promise with setTimeout
(function(){
    var _html = this, array = _html.array;
    
    // Promise pattern for calling asynchronous code, usually ajax/setTimeout/setInterval
    this.Promise = function(task) {
        // save reference to done functions and fail function callback
        var done = [], fail = null;
        
        // resolve function, use to call all done functions
        var resolve = function(val) {
            //run all done methods when resolving
            array.each.call(done, function(d) {d(val);});
            promise = null;
        };
        // reject function, use to call fail function
        var reject = function(reason) {
            //run all done methods when resolving
            fail(reason);
            promise = null;
        };
        
        // call the asynchronous task with resolve, reject parameter
        task(resolve, reject);
        
        // declare promise variable
        var promise = {};
        // promise done method, use to set done methods, these methods will be call when the resolve method called
        // we can call done and then as many times as we want
        promise.done = promise.then = function(callback) {
            if(isFunction(callback)) {
                // only push the callback to the queue if it is a function
                done.push(callback);
            }
            return promise;
        };
        // promise fail method, use to set fail method, the method will be call when the reject method called
        // only call fail method once
        promise.fail = function(callback) {
            if(isFunction(callback)) {
                // only set the callback if it is a function
                fail = callback;
            }
            delete promise.fail;
            return promise;
        };
        
        return promise;
    };
    
    // create XHR object for ajax request
    var xhr = function() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();  
        }
        var versions = [ "MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp" ];

        var xhr;
        for(var i = 0; i < versions.length; i++) {
            // try to initialize one version of Microsoft XHR
            try {
                xhr = new ActiveXObject(versions[i]);
                break; // of course break here when initializing succeeded
            } catch (e) { }
        }
        return xhr;
    };

    // ajax method
    // 2 parameters are enough for ajax: url and data
    // all other parameters can be set after this method with fluent API
    var ajax = this.ajax = function(url, data, method, async) {
        var method = method || 'GET', 
            header = {}, parser = null, timeout = null,
            async = isNotNull(async)? async: true,
            username = undefined, password = undefined,
            // the promise object to return, user can set a lot of options using this, of course with done and fail
            promise = _html.Promise(function(resolve, reject) {
                var x = xhr();                                      // init XHR object
                x.open(method, url, async, username, password);     // open connection to server, with username, password if possible
                x.onreadystatechange = function() {
                    if (x.readyState == 4 && x.status === 200) {
                        // call resolve method when the ajax request success
                        resolve(isNotNull(parser)? parser(x.responseText): x.responseText);
                    } else {
                        // call reject method when the ajax request fail
                        reject(x);
                    }
                };
                // set header for the request if possible
                // loop through the values inside header object and set to request header
                for(var h in header) {
                    x.setRequestHeader(h, header);
                }
                if (timeout && timeout > 0) {
                    // handle time out exception defined by user
                    x.timeout = timeout;
                    x.ontimeout = function() { reject('timeout'); };
                }
                // send the request
                x.send(data);
            });
        
        //modified method to get/post
        promise.get = function() {
            method = 'GET';
            return this;
        };
        //modified method to get/post
        promise.post = function() {
            method = 'POST';
            return this;
        };
        // authenticate request with username and password (optional)
        promise.authenticate = function(user, pass) {
            username = user;
            password = pass;
            return this;
        };
        // set header for a request
        // note that I extend the header object instead of replace it
        // so that we can call this method so many times
        promise.header = function(arg) {
            _html.extend(header, arg);
            return this;
        };
        // set header for a request
        // note that I extend the header object instead of replace it
        // so that we can call this method so many times
        promise.async = function(isAsync) {
            async = isAsync;
            return this;
        };
        promise.parser = function(p) {
            parser = p;
            return this;
        };
        promise.timeout = function(miliseconds) {
            timeout = miliseconds;
            return this;
        };
        
        return promise;
    };

    // parser for JSON logic borrowed from jQuery
    var parseJSON = JSON && JSON.parse || function(data) {
		if (data === null) {
			return data;
		}

		if (typeof data === "string") {

			// Make sure leading/trailing white-space is removed (IE can't handle it)
			data = trim( data );

			if (data) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if (/^[\],:{}\s]*$/
                    .test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

					return ( new Function( "return " + data ) )();
				}
			}
		}
        return null;
	};
    
    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }
    var stringify = JSON.stringify || function (obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (_html.isString(t)) obj = '"'+obj+'"';
            // Date type
            if (_html.isDate(t)) obj = '"' +
                obj.getUTCFullYear()       + '-' +
                f(obj.getUTCMonth() + 1)   + '-' +
                f(obj.getUTCDate())        + 'T' +
                f(obj.getUTCHours())       + ':' +
                f(obj.getUTCMinutes())     + ':' +
                f(obj.getUTCSeconds())     + 'Z' +'"';
            return String(obj);
        } else {
            // recursive array or object
            // this method is similar to serialize
            var n, v, json = [], arr = (obj && isArray(obj));
            
            for (n in obj) {
                v = obj[n]; t = typeof(v);
                if (t == "string") v = '"'+v+'"';
                else if (t == "object" && v !== null) v = stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };
    
    if(!JSON) JSON = { parse: parseJSON, stringify: stringify };
    
    // create shorthand for request JSON format with "GET" method
    ajax.getJSON = function(url, data, async) {
        var query = [];
        for (var key in data) {
            // get all parameters and append to query url
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        // do ajax request, and pass JSON parser for user
        // return a promise to user
        return ajax(url + '?' + query.join('&'), null, 'GET', async)
            .parser(parseJSON);
    };

    // create shorthand for request JSON format with "POST" method
    ajax.postJSON = function(url, data, async) {
        // do ajax request, and pass JSON parser for user
        // return a promise to user
        return ajax(url, stringify(data), 'POST', async)
            .header({ 'Content-type': 'application/json' })
            .parser(parseJSON);
    };
    
}).call(html);

/* END OF AJAX MODULE */
