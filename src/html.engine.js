// HTML engine JavaScript library
// (c) Nguyen Ta An Nhan - http://htmlengine.droppages.com/index.html
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

//Remaining features:
//1. Refactor code
//2. Router (hash/history), ajax
//3. Re-write jQuery controls with the framework(low priority)

(function (root, factory) {
    /* CommonJS/NodeJs */
    if (typeof module === "object" && typeof module.exports === "object") module.exports = factory(root);
        /* AMD module */
    else if (typeof define === 'function' && define.amd) define(factory(root));
        /* Browser global */
    else root.html = factory(root);
}
(this || (0, eval)('this'), function (window) {

var document   = window.document,
    isOldIE    = !document.addEventListener,
    toString   = Object.prototype.toString,
    isArray    = Array.prototype.isArray || function(obj){ return toString.call(obj) == '[object Array]'; },
    isFunction = function (x) { return Object.prototype.toString.call(x) == '[object Function]'; },
    isString   = function(x) { return typeof x === 'string'; },
    isNotNull  = function(x) { return x !== undefined && x !== null; };
    
//declare name-space
var html = function (selector, context) {
    //document ready implementation here
    if (isFunction(selector)) {
        //handle document onload event
        return html.ready(selector);
    }
    if (isString(selector)|| selector.nodeType) {
        //handle querying on document
        return html.get(selector, context);
    }
};
html.isArray = isArray;
(function () {
    var _html = this
        , element
        , focusingInput
        , notifier
        , allEvents = {};

    this.config = {};
    this.config.lazyInput = false;
    //this method doesn't create DOM element
    //this method is for extend properties from object to object
    //this method can't be used in fluent API because it doesn't return html
    //but return destination object instead
    //des (object): destination
    //src (object): source
    this.extend = function (des, src) {
        for (var fn in src) {
            if (src.hasOwnProperty(fn)) {
                des[fn] = src[fn];
            }
        }
        return des;
    };

    //get element by selector
    //assign it to pointer
    this.get = this.render = function (selector, context) {
        //if it is an element then just assign to pointer
        if (selector && selector.nodeType) {
            element = selector;
        } else if (isString(selector)) {
            //if selector is a string
            var result = this.query(selector, context)[0];
            if (!result) {
                //if result can't be found then throw exception for user that there's something wrong with selector 
                throw 'Can\' find element that matches';
            }
            element = result;
        }
        //return html to facilitate fluent API
        return this;
    }

    this.find = function (selector) {
        element = this.query(selector, element)[0];
        return this;
    }

    //use this method for querying data from array, usage is similar to Linq
    //this method is also used for query DOM, using CSS query
    //arg (Array | string)
    //  if it is an array, then apply query fluent API for array
    //  if it is a string, then apply css query selector aka querySelectorAll
    this.array = function () {
        var res = Array.apply({}, arguments[0] || []);
        _html.extend(res, _html.array);
        return res;
    };

    //This function takes html.query object and create methods for html.query namespace
    //html.query methods will be used in any array passed through html.query
    //because that array will inherits from methods inside html.query
    //NOTE: every html.query object method can be used with fluent API
    //for example: html.query([1,2,3,4].select(function(x){return x*x}).where(function(x){return x > 4});
    (function () {
        //each is a common used word, a handful method to loop through a list
        this.each = function (action) {
            for (var i = 0, j = this.length; i < j; i++)
                action(this[i], i);
        }

        //add item into array, simply use push - native method
        this.add = Array.prototype.push;

        //select is similar to map in modern browser
        this.select = function (mapping) {
            if (!mapping) {
                throw 'Mapping function is required';
            }
            var result = [];
            for (var i = 0; i < this.length; i++)
                result.push(mapping(this[i]));
            return _html.array(result);
        }

        //where is similar to filter in modern browser
        this.where = function (predicate) {
            if (!predicate) {
                throw 'Predicate function is required';
            }
            var ret = [];
            for (var i = 0; i < this.length; i++)
                if (predicate(this[i])) {
                    ret.push(this[i]);
                }
            return _html.array(ret);
        }

        //reduce is a famous method in any functional programming language - also can use this with fluent API
        this.reduce = function (iterator, init, context) {
            var result = isNotNull(init)? init : [];
            for (var i = 0, j = this.length; i < j; i++) {
                result = iterator.call(context, result, this[i]);
            }
            return result;
        }

        //similar to reduce
        this.reduceRight = function (iterator, init, context) {
            var result = isNotNull(init)? init : [];
            for (var i = this.length - 1; i >= 0; i--) {
                result = iterator.call(context, result, this[i]);
            }
            return result;
        }

        //find a item that fits the comparer, the array maybe map to another array before performing searching if mapper was passed
        //NOTE: comparer takes 2 arguments and return a "better" one, then the find method can find the "best" one
        this.find = function (comparer, mapper) {
            var arr = mapper ? this.select(mapper) : this;
            return arr.reduce(function (best, current) {
                return best === comparer(best, current) ? best : current;
            }, arr[0]);
        }

        //find the first one that matches condition, throw exception if no item matches
        this.first = function (predicate, predicateOwner) {
            if (!predicate) {
                return this[0];
            }
            for (var i = 0, j = this.length; i < j; i++)
                if (predicate.call(predicateOwner, this[i]))
                    return this[i];
            throw 'Can\'t find any element matches';
        }

        //find the first one that matches condition, if not found return null
        this.firstOrDefault = function (predicate, predicateOwner) {
            if (!predicate) {
                return this[0];
            }
            for (var i = 0, j = this.length; i < j; i++)
                if (predicate.call(predicateOwner, this[i]))
                    return this[i];
            return null;
        }

        //find index of the item in a list, this method is used for old browser
        //if indexOf method is native code, then just call it
        this.indexOf = function (item) {
            if (isFunction(Array.prototype.indexOf))
                return Array.prototype.indexOf.call(this, item);
            for (var i = 0, j = this.length; i < j; i++)
                if (this[i] === item)
                    return i;
            return -1;
        }

        //remove item from a list
        this.remove = function (itemToRemove) {
            var index = this.indexOf(itemToRemove);
            if (index >= 0 && index < this.length)
                this.splice(index, 1);
        }

        //remove specified item from a list by its index
        this.removeAt = function (index) {
            if (index >= 0 && index < this.length)
                this.splice(index, 1);
        }

        //swap to elements in a list
        this.swap = function (fromIndex, toIndex) {
            if (fromIndex >= 0 && fromIndex < this.length && toIndex >= 0 && toIndex < this.length && fromIndex != toIndex) {
                var tmp = this[fromIndex];
                this[fromIndex] = this[toIndex];
                this[toIndex] = tmp;
            }
        }

        //create a comparer from an expression tree
        //only return comparing result when expression tree ends.
        var comparer = function (expTree) {
            return function (a, b) {
                //compare two objects using condition in expression tree
                //compare till we get difference
                for (var i = 0, j = expTree.length; i < j; i++) {
                    var endOfExpression = i === j - 1,
                        first = expTree[i].expression(a),
                        second = expTree[i].expression(b);
                    if (first > second) {
                        return expTree[i].isAscendant ? 1 : -1;
                    }
                    if (first < second) {
                        return expTree[i].isAscendant ? -1 : 1;
                    }
                    if (endOfExpression) {
                        return expTree[i].isAscendant && 0;
                    }
                }
                return 0;
            }
        };

        //orderBy method, used to sort an array by ascending
        //its usage is similar to linq
        //arguments (Function | Array of Object | String | Array of String). For example:
        //  Function: function(x){return x.FullName;}
        //  Array   : {field: 'FullName', isAsc: true}, {field: 'Age', isAsc: false}
        //          : 'FullName', {field: 'Age', isAsc: false}
        //          : 'FullName', 'Age'
        //  String  : 'FullName'
        //NOTE: if arguments is an ARRAY then return result immediately
        this.orderBy = function () {
            //expression tree to build order of sorting fields
            var expTree = [];
            //get the arguments
            var expressionArgs = arguments[0] instanceof Array ? arguments[0] : arguments;

            for (var i = 0, j = expressionArgs.length; i < j; i++) {
                var isString = typeof (expressionArgs[i]) === 'string';
                //put all sort parameters into expression tree
                //firstly, build the expression based on parameter
                var exp = (function (index, isString) {
                    //return a function, this function is to get value from an object(kind of mapper)
                    return function (x) {
                        //return the value
                        //note that user can pass a string represent a field what is an observer
                        //so that we must use html.getData to get real value from that
                        if(expressionArgs[index] instanceof Function) return expressionArgs[index](x);
                        return isString
                                ? _html.getData(x[expressionArgs[index]])
                                : _html.getData(x[expressionArgs[index].field]);
                    }
                })(i, isString);
                //push expression into expression tree
                isString || isFunction(expressionArgs[i])
                        ? expTree.push({ expression: exp, isAscendant: true })
                        : expTree.push({ expression: exp, isAscendant: expressionArgs[i].isAsc });
            }
            return this.sort(comparer(expTree));
        };
    }).call(this.array);

    //use native concat method but return array still queryable (fluent API)
    this.array.addRange = function (items) {
        return _html.array(Array.prototype.concat.call(this, items));
    };

    //use native concat method but return array still queryable (fluent API)
    this.array.any = function (predicate) {
        for (var i = 0, j = this.length; i < j; i++) {
            if (predicate(this[i])) return true;
        }
        return false;
    };
    
    //use native concat method but return array still queryable (fluent API)
    this.array.replace = function (target, obj) {
        for (var i = 0, j = this.length; i < j; i++) {
            if (this[i] === target) this.splice(i, 1, obj);
        }
    };

    //Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    //These method are from UnderscoreJs
    var typeCheck = _html.array(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp']);
    typeCheck.each(function(type) {
        _html['is' + type] = function(obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });
    //expando property prefix
    //expando will look like input['__engine__events__change']
    //the value of expando will be an array of bounded events
    //expandoLength is for cache the length of expando
    var expando = '__events__',
        expandoLength = expando.length;

    //expandoList is a list of expando that have expanded to element e.g
    //input.__engine__events__click = someArray
    //select.__engine__events__change = anotherArray
    //means that expandoList = [__engine__events__click, __engine__events__change]
    //this variable is used for looping through element's properties faster(10 times)
    //because we just loop through specified expando properties instead of loop through all properties
    var expandoList = [];
    //var allEvents = {};

    //get data from an observable object
    this.getData = function (data) {
        //check whether it is html.data object or not
        //if it is html.data then excute to get value or inner function aka "computed function"
        //because html.data could take a function as parameter
        var ret = data;
        while (isFunction(ret)) {
            ret = isFunction(ret) ? ret() : ret;
        }
        //return real value
        return ret;
    };

    //we need this variable because we need to create a reference
    //from DOM event to allEvents object
    var uniqueId = 1;

    //bind callback method to element's event
    //element: the element to bind event
    //name: event name
    //callback: event method
    //bubble (optional) (default: false): bubble event
    this.bind = function (element, name, callback, bubble) {
        if (element === undefined || element === null) {
            throw 'Element must be specified';
        }
        if (name === undefined || name === null) {
            throw 'Event name must be specified';
        }
        if (callback === undefined || callback === null) {
            throw 'Callback must be specified';
        }

        if (element.addEventListener) { //attach event for non IE
            element.addEventListener(name, callback, bubble);
        } else { //addEventListener for IE browsers
            element.attachEvent('on' + name, callback);
        }
        if (document.addEventListener) {
            //set value for expando property if it wasn't set
            element[expando] = element[expando] || {};
            //set event name into expando if that name wasn't created
            element[expando][name] = element[expando][name] || {};

            var eventNo = element[expando][name]['eventNo'] || 0;
            element[expando][name][eventNo] = callback;
            element[expando][name]['eventNo'] = eventNo + 1;
        } else {
            //get the reference of element
            var uId = element.uniqueId || uniqueId++;
            element.uniqueId = uId;
            //get all events of that element
            //create if it wasn't created
            allEvents[name] = allEvents[name] || {};
            allEvents[name][uId] = allEvents[name][uId] || {};
            //get number of events of that element
            //note that get by name
            var eventNo = allEvents[name][uId]['eventNo'] || 0;
            allEvents[name][uId][eventNo] = callback;
            allEvents[name][uId]['eventNo'] = eventNo + 1;
        }
    };

    //use this method to trigger event bounded to element via html.bind
    //ele: element that user want to trigger event
    //name: event name
    this.trigger = function (eventName, el) {
        el = el || element;
        if (!el) {
            throw 'Element must be specified';
        }
        if (!eventName) {
            throw 'Event name must be specified';
        }

        var event;
        if (document.createEvent) {
            //create HTMLEvents, init that event - for IE >= 9
            event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, true);
        } else if (document.createEventObject) {
            // For IE < 9
            event = document.createEventObject();
            event.eventType = eventName;
        }
        try {
            //call that event natively e.g input.click()
            //we need to put in try catch block because older browsers causes exception
            el[eventName]();
            return;
        } catch (e) { }
        event.eventName = eventName;
        if (el.dispatchEvent) {
            //dispatch the event if possible - for IE >= 9
            el.dispatchEvent(event);
        } else if (el.fireEvent) {
            //fire event - for IE < 9
            el.fireEvent('on' + event.eventType, event);// can trigger only real event (e.g. 'click')
        } else if (el['on' + eventName]) {
            el['on' + eventName]();
        }
    }

    //remove every events bounded to element via html.bind
    //dispose the element from document
    //however because of javascript specification allow to keep a DOM node reference inside closure
    //so that the element would be never dispose if any user's closure code keep reference to that DOM node
    //NOTE: never keep DOM node reference inside closure if not necessary, use a query to get DOM node instead
    this.dispose = function (ele) {
        this.unbindAll(ele);
        //remove the node from its parent (if its parent is not null
        if (ele && ele.parentElement) {
            ele.parentElement.removeChild(ele);
            //if the node has node parent
            //set the node reference to null so that the node memory can be collected
        } else {
            ele = null;
        }
    };

    //this function is to avoid memory leak
    //remove all methods bounded to element via html.bind
    this.unbindAll = function (ele) {
        ele = ele || this.$$();
        if (ele === null || ele === undefined) {
            throw 'Element to unbind all events must be specified';
        }
        if (document.addEventListener) {
            var eleEvent = ele[expando];
            for (var name in eleEvent) {
                var events = eleEvent[name];
                for (var e in events) {
                    isFunction(events[e]) && _html.unbind(name, events[e], false, ele);
                }
                eleEvent[name] = null;
            }
            ele[expando] = null;
        } else {
            var uId = ele.uniqueId;
            if (uId) {
                for (var name in allEvents) {
                    var ref = allEvents[name][uId];
                    if (!ref) break;
                    for (var e in ref) {
                        isFunction(ref[e]) && _html.unbind(name, ref[e], false, ele);
                    }
                    allEvents[name][uId] = null;
                }
            }
        }

        //loop through element's children to unbind all events
        //this loop will run recursively
        if (ele !== null && ele.children && ele.children.length) {
            for (var child = 0; child < ele.children.length; child++) {
                this.unbindAll(ele.children[child]);
            }
        }
    };

    //unbind element's event
    //element: element to unbind
    //name: event name
    //callback: listener function to unbind
    //bubble (optional, false): bubble event
    this.unbind = function (name, callback, bubble, elem) {
        var elem = elem || this.$$();
        if (!element) {
            throw 'Element to unbind event must be specified';
        }
        if (!name) {
            throw 'Event name must be specified';
        }

        //detach event for non IE
        if (elem.removeEventListener) {
            elem.removeEventListener(name, callback, bubble);
            //remove event listener, used for IE
        } else {
            elem.detachEvent('on' + name, callback);
        }
    };

    //subscribe function to observable object
    //only subscribe to html.data object
    //throws no exception whenever object nor function is null
    this.subscribe = function (observer, updateFn) {
        if (observer && observer.subscribe) {
            observer.subscribe(updateFn);
        }
    };

    //unsubscribe function from observable object
    //only unsubscribe from html.data object
    //throws no exception whenever object nor function is null
    this.unsubscribe = function (observer, updateFn) {
        if (observer && observer.subscribe) {
            observer.unsubscribe(updateFn);
        }
    };

    //dispose DOM element that's no longer used
    this.disposable = function (ele, observer, update) {
        if (ele === null || ele.parentElement === null) {
            if (!observer || !update) {
                throw 'Observer and listener must be specified';
            }
            //unsubscribe target for observer
            _html.unsubscribe(observer, update);
            //check if the element is not null but is parent is null
            //then dispose the element(unbindAll events and remove that element)
            if (ele !== null) {
                _html.dispose(ele);
            }
        }
    };

    //Create an element then append to current element
    //Change the current element pointer to the created one
    //With this action, user can bind data, attribute, etc, ... with fluent API
    //e.g: say current Element is a div then user want to create an input, then code and DOM will look like
    //html.render(divTag).input()
    //<div id="divTag"><input></input></div>
    //after create input current Element pointer will change to the input not the div any more.
    //return the current element
    //name (string): tag name to create
    //type (string optional): indicate type of input
    this.createElement = function (name, type) {
        var ele = document.createElement(name);
        if (type) {
            ele.type = type;
        }
        element.appendChild(ele);
        element = ele;
        return element;
    };

    //create element without parent
    this.createElementNoParent = function (name) {
        element = document.createElement(name);
        return this;
    };
    
    //This method is used internally to remove some number of child
    //Use this method when user call remove (e.g list.remove(item))
    //
    //parent (Element): node to remove from
    //index (number): index of item in the list
    //numOfElement (number): number of element that one item can render
    //
    //We need numOfElement because we have no idea how many elements that renderer function will render,
    //by calculating start index and stop index in the list, we can remove correctly
    //the variable numOfElement will cause a redundant renderer function to be called
    //but append to a "tmp" Node, the "tmpNode" will be disposed after all
    //but it could lead to memory leak, the first need to handle memory leaking
    var removeChildList = function (parent, index, numOfElement) {
        //calculating start index
        index = index * numOfElement;
        //this list to save all nodes has been removed
        //we'll this list to unbind all events of removed nodes
        var ele2Unbind = [];
        //from start index, remove numOfElement times, done
        for (var i = 0; i < numOfElement; i++) {
            ele2Unbind.push(parent.children[index]);
            parent.removeChild(parent.children[index]);
        }
        setTimeout(function () {
            for (var i = 0; i < numOfElement; i++) {
                //unbind all event when remove elements
                //need to unbind after removing because there are still some events need to run
                _html.unbindAll(ele2Unbind[i]);
            }
            //release memory
            ele2Unbind = null;
        });
    }

    //this method will append all created nodes into correct position inside container
    //only use this when user want to add to any position but not the last
    //
    //parent (Element): container to insert
    //tmpNode (Element): just tmpNode containing created elements from renderer
    //  the tmpNode will be remove after all
    //index (number): index of the item user want to insert
    var appendChildList = function (parent, tmpNode, index) {
        //previous node mean the node right before previous item rendered
        //it could be br tag or whatever
        var previousNode = null;

        //check if renderer renders nothing
        if (tmpNode.children.length === 0) {
            throw Exception('You must add at least one element');
        }

        //calculate index of previous node
        //e.g user want to add at 1, renderer renders 4 inputs
        //then index would be 4
        index = index * tmpNode.children.length;
        previousNode = parent.children[index];

        //if previousNode not found, then append all tmpNode children to the parent (aka container)
        if (!previousNode) {
            while (tmpNode.children.length) {
                parent.appendChild(tmpNode.children[0]);
            }
        }
        //if previousNode found, then insert all children of tmpNode before that node
        while (tmpNode.children.length) {
            parent.insertBefore(tmpNode.children[0], previousNode);
        }
    };

    //The method to render a list of model
    //Update the DOM whenever list of model change
    //(via add, remove, push and set aka "render" action)
    //
    //e.g list = html.data([])
    //list([1,2,3]).push(4) will trigger 2 actions: render and push
    //list.remove(4) will trigger remove action
    //list.add(5) will trigger push action (not add because add to the last position of the list)
    //list.add(5, 0) will trigger add action because user want to add at the top
    //
    //NOTE: add an item into the list in any else position but last position is the slowest action
    //
    //model (html.data | []): list of data, it could be observable or not
    //renderer (Function): function use to render DOM
    //  this function will take 2 args:
    //  1st arg: Node that it renders from
    //  2nd arg: item in the list
    this.each = function (model, renderer) {
        //return immediately if model not pass, do nothing
        if (!model)
            throw 'Invalid argument exception. You must pass an array or observerd array.';

        //save the container pointer to parent
        var parent = element;

        //empty all element inside parent node before render
        _html.get(parent).empty();

        //initialize numOfElement
        var numOfElement = 0;
        //this method is used to get numOfElement
        //it calls renderer once, count child elements inside tmpNode
        //dispose tmpNode and return counter
        var getNumOfEle = function () {
            var tmpNode = document.createElement('tmp');
            //set the parent context for renderer
            element = tmpNode;
            renderer.call(tmpNode, model()[0], 0);
            var ret = tmpNode.children.length;
            _html.dispose(tmpNode);
            return ret;
        };
        //the main idea to render is this loop
        //just use renderer callback, let user do whatever they want
        for (var i = 0, MODEL = _html.getData(model), j = MODEL.length; i < j; i++) {
            element = parent;
            //pass parent node to render from, the item in the list and its index
            renderer.call(parent, MODEL[i], i);
        }
        //this method is used to update UI if user call any action modify the list
        //there are currently 4 actions: push, add, remove, render
        //in the future we may add 2 more actions: sort and swap
        var update = function (items, item, index, action) {
            switch (action) {
                case 'push':
                    //render immediately the item, call renderer to do thing
                    element = parent;
                    renderer.call(parent, item, items.length);
                    break;
                case 'add':
                    //set parent context for renderer
                    element = parent;
                    //if user want to insert at the last
                    //render immediately the item, call renderer to do thing
                    if (index === items.length - 1) {
                        renderer.call(parent, item, index);
                        return;
                    }
                    //if user wants to insert at any position
                    //create tmpNode, append all element to that node
                    //then append to the parent node again
                    //this action cost time most
                    var tmpNode = document.createElement('tmp');
                    renderer.call(tmpNode, item, index);
                    appendChildList(parent, tmpNode, index);
                    //finally dispose tmpNode avoid memory leaking
                    _html.dispose(tmpNode);
                    break;
                case 'remove':
                    //remove all elements that renderer created
                    //get numOfElement only once, if numOfElement greater than 0, mean that this action has been called
                    numOfElement = numOfElement || getNumOfEle();
                    removeChildList(parent, index, numOfElement);
                    break;
                case 'render':
                    //empty all element inside parent node before render
                    _html.get(parent).empty();
                    //render it, call renderer to do thing
                    for (var i = 0, j = items.length; i < j; i++) {
                        element = parent;
                        renderer.call(parent, items[i], i);
                    }
                    break;
            }
        }
        //subscribe update function to observer
        this.subscribe(model, update);
        return this;
    };

    //create br tag
    //NOTE: not to use .$() after use this method, because br is an auto closing tag
    this.br = function () {
        var br = this.createElement('br');
        return this.$();
    };

    //use this method to indicate that you have nothing more to do with current element
    //the pointer will set to its parent
    this.$ = function () {
        element = element.parentElement;
        return this;
    };

    //this method is used to get current element
    //sometimes user wants to create their own "each" method and want to intercept renderer
    //NOTE: only use this method to ensure encapsulation
    //in the future, we may hide element, declare it as private not publish anymore
    this.element = this.$$ = function () {
        return element;
    };

    //create a div element
    this.div = function () {
        var ele = this.createElement('div');
        return this;
    };

    //create i element
    this.i = function () {
        var ele = this.createElement('i');
        return this;
    };

    //create span element
    //set innerHTML to span
    //Firefox doesn't have innerHTML, so we only use innerHTML
    //subscribe span to the observer
    this.span = function (observer) {
        var value = _html.getData(observer);           //get value of observer
        var span = this.createElement('span');         //create span element
        span.appendChild(document.createTextNode(value));
        var updateFn = function (val) {                //update function, only run when observer is from html.data
            while (span.firstChild !== null)
                span.removeChild(span.firstChild);     //remove all existing content
            span.appendChild(document.createTextNode(val));
        }
        this.subscribe(observer, updateFn);            //subscribe update function
        return this;
    }

    //add space for html, it only works for browser support innerHTML (IE > 7 ?)
    this.space = function (numOfSapce) {
        var text = '';
        //loop for numOfSpace
        //generate white space 
        for (var i = 0; i < numOfSapce; i++) {
            text += '&nbsp;';
        }
        //set innerHTML of current element
        var span = this.span().$$();
        span.innerHTML = text;
        this.$();
        return this;
    }

    //create input element
    this.input = function (observer, errorHandler) {
        //create the input
        var input = element.nodeName.toLowerCase() === 'input' ? element : this.createElement('input');
        input.value = this.getData(observer);     //get value of observer
        if (isFunction(observer)) {               //check if observer is from html.data
            //if observer is html.data then register change event
            //so that any change can be notified
            var change = function (e) {
                var _newVal = this.value;
                //observer.silentSet(_newVal);
                //check if observer is computed
                //if not then set observer's value
                if (observer.isComputed && !observer.isComputed()) {
                    //in case it is is not a computed object
                    //set the value with the error handler callback method
                    observer(_newVal, function(validationResults) { //this method is only run when all validation methods have finished running
                        //get the error span, it's next to the input
                        var error = input.nextSibling;
                        //if there is no error span, set the error value to be null
                        error = error && error.nodeName.toLowerCase() === 'span' && error.className === 'html-error' && error || null;
                        //get the first validation result that is invalid
                        var firstError = validationResults.firstOrDefault(function(i){return i.isValid === false});
                        if(validationResults.length && firstError !== null) {
                            //check if there is any validation message
                            //create error span if not exists; otherwise set the innerHTML for that span
                            error? error.innerHTML = firstError.message
                                : _html.createElementNoParent('span').text(firstError.message).clss('html-error');
                            //set the pointer of error in case we created it, no need to set in case it exists
                            error = error || element;
                            if(isFunction(errorHandler)) {
                                //if user want to handle error message, just make it not display
                                error.style.display = 'none';
                            }
                            //insert after the input anyway regardless of it exists or not
                            error && _html(error).insertAfter(input);
                        } else if(error) {
                            //remove the error span if there are no errors but the error span exists
                            error.parentElement.removeChild(error);
                        }
                        //delegate to user handle error
                        //pass all invalid error message to user
                        errorHandler && errorHandler({validationResults: validationResults.where(function(i){return i.isValid === false}), observer: observer, input: input});
                    });
                } else {
                    //if observer is a computed object, simply refresh it
                    observer.refresh();
                }
            };
            if (!isOldIE && !this.config.lazyInput) {
                //register event for change the observer value
                //these event also notifies for subscribed objects
                this.change(change).inputing(change).compositionstart(change).compositionend(change);
                //register event for setting focusing input
                //setting this variable will help detect which input shouldn't be changed its value
                this.focus(function (e) { focusingInput = input; });
            } else if (isOldIE) {
                this.keyup(change);
            } else {
                this.change(change);
            }
            //subscribe to observer how to update UI
            this.subscribe(observer, function (value) {
                //just update the value of element
                value = _html.getData(value);
                input.value = value;
                //dispose the element if it has no parent
                _html.disposable(input, observer, this);
            });
        }
        //return html to facilitate fluent API
        return this;
    };

    this.text = function (observer) {
        //remove all child node inside the element
        while (element.firstChild !== null)
            //remove firstChild is the fastest way
            element.removeChild(element.firstChild);
        //get the real value of observer
        var realValue = _html.getData(observer);
        //create text node with the value from observer
        var textNode = document.createTextNode(realValue);
        //append the text node to the element
        element.appendChild(textNode);
        var update = function (val) {
            //set the node value when observer update its value
            textNode.nodeValue = val;
        };
        //subscribe update function to observer
        html.subscribe(observer, update);
        return this;
    }

    //set inner HTML for a tag
    //this method is handle for unit test because it contains only one line of code
    //and no way to fail, so it is more trusted than html.render
    this.innerHTML = function (text) {
        element.innerHTML = text;
    };

    //bind change event to current element
    //this is shorthand for html.bind(element, 'keyup', callback)
    //this method is also used in fluent API, we can call html.bind but a lot of code
    //
    //this method is also really quirk because it needs to deal with IE < 9
    //with IE < 9, they don't fire event in expected order
    //
    //callback (Function): event to bind to element
    //srcElement (optional Element): element fires the event
    var events = html.array([
        'change', 'keyup', 'keydown', 'keypress',
        'compositionend', 'compositionstart', 'inputing', 'copy', 'paste',
        'click', 'dblclick', 'mousedown', 'mouseup', 'focus', 'blur',
        'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'
    ]);
    events.each(function (event) {
        _html[event] = function (callback, model) {
            var eventName = event === 'inputing' ? 'input' : event;
            var srcElement = this.$$();
            this.bind(srcElement, eventName, function (e) {
                e = e || window.event;
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                if (!callback) return;
                notifier = srcElement || e.srcElement || e.target;
                callback.call(notifier, e, model);
            }, false);
            //return html to facilitate fluent API
            return this;
        }
    });

    //create radio button element
    //name (string, optional, ''): name attribute for radio
    //observer (html.data, optional, ''): observer, notifier
    this.radio = function (name, observer) {
        name = name || '';
        observer = observer || '';
        var radio = document.createElement('input', 'radio');
        radio.name = name;

        //get real value from html.data or whatever
        var value = this.getData(observer);
        //then set value of checked, and also attribute checked
        if (value === 'true' || value === true) {
            radio.setAttribute('checked', 'checked');
            radio.checked = true;
        } else {
            radio.removeAttribute('checked');
            radio.checked = false;
        }

        //check if observer is html.data
        if (isFunction(observer)) {
            this.change(function (e) {                 //bind event change to the radio button
                if (observer.isComputed()) {           //check if observer is computed property
                    radio.removeAttribute('checked');  //if yes, remove the attribute checked
                } else {                               //if no, just notify changes
                    observer.refresh();
                }
            }, radio);
            //subscribe observer update function so that radio button can listen to any change from the observer
            //any changes even though from itself will trigger this function
            //gotta do it because user can change value by code
            this.subscribe(observer, function (value) {
                value = _html.getData(value);
                if (value === 'true' || value === true) {
                    radio.setAttribute('checked', 'checked');
                    radio.checked = true;
                } else {
                    radio.removeAttribute('checked');
                    radio.checked = false;
                }
            });
        }
        return this;
    }

    //checkbox control
    //observer(optional html.data): observe any change
    this.checkbox = function (observer) {
        //create checkbox element
        var chkBox = element.nodeName.toLowerCase() === 'input' && element.type === 'checkbox'
                        ? element
                        : this.createElement('input', 'checkbox')
        //get value for the checkbox from observer
        var value = _html.getData(observer);
        //set attribute and also set property checked
        if (value === 'true' || value === true) {
            chkBox.setAttribute('checked', 'checked');
            chkBox.checked = true;
        } else {
            chkBox.removeAttribute('checked');
            chkBox.checked = false;
        }

        //check if observer is html.data
        if (isFunction(observer)) {
            //bind change event so that any changes will be notified
            this.click(function (ele, e) {
                if (observer.isComputed()) {
                    observer.refresh();
                } else {                                //because the library has no idea about what user want if change computed
                    observer(this.checked === true);    //if no, just notify change to other listeners
                }
            }, chkBox);
            //subscribe a listener to observer, so that another element can notifies if any changes
            //this listener may be fired because of the change from itself
            this.subscribe(observer, function (value) {
                //set attribute and property for the checkbox
                if (value === 'true' || value === true) {
                    chkBox.setAttribute('checked', 'checked');
                    chkBox.checked = true;
                } else {
                    chkBox.removeAttribute('checked');
                    chkBox.checked = false;
                }
            });
        }
        //return html to facilitate fluent API
        return this;
    };

    //create button
    this.button = function (text) {
        var button = this.createElement('button');
        button.innerHTML = text;
        return this;
    };

    //set class attribute for current element
    //the class may change due to observer's value
    this.clss = function (observer) {
        var className = _html.getData(observer);
        element.setAttribute('class', className);

        this.subscribe(observer, function (value) {
            element.setAttribute('class', value);
        });
        return this;
    };

    //create common element that requires text parameter
    var commonEles = _html.array(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th']);
    commonEles.each(function (ele) {
        _html[ele] = function (text) {
            var element = _html.createElement(ele);
            element.innerHTML = text;
            return _html;
        }
    });

    //set id for element, this method should be used at least by html js user
    //because html js user don't need id to get element
    this.id = function (id) {
        element.id = id;
        return this;
    };

    //set attribute for element
    //loop through parameter object's properties
    //set them to the element
    this.attr = function (attr) {
        for (var i in attr) {
            element.setAttribute(i, attr[i]);
        }
        return this;
    };

    //create table elements, they should have no parameter
    var tableEle = _html.array(['table', 'thead', 'tbody', 'tr', 'td']);
    tableEle.each(function (ele) {
        _html[ele] = function (text) {
            _html.createElement(ele);
            if (text) {
                element.appendChild(document.createTextNode(text));
            }
            return _html;
        };
    });

    //create simple a tag
    this.a = function (text, href) {
        var a = document.createElement('a');
        a.innerHTML = text || '';
        a.href = href || '';
        element.appendChild(a);
        element = a;
        return this;
    };

    //dropdown for simple select list, no optionGroup
    //list: list of data will display
    //current: current data selected
    //displayField (string): field to display text for option
    //valueField (string): field to get value for option
    this.dropdown = function (list, current, displayField, valueField) {
        var currentValue = _html.getData(current);
        var select = element.nodeName.toLowerCase() === 'select' ? element : this.createElement('select');
        //render options for the select tag
        //An option could be selected if its value equal to currentModel
        this.each(list, function (model) {
            var value = isString(valueField)? model[valueField] : model;
            var display = isString(displayField)? model[displayField] : model;
            _html.render(this).option(display, value, model === currentValue).$();
        });

        //add change event to select tag
        this.change(function (event) {
            //get current value of select in the list parameter
            var selectedObj = list[this.selectedIndex];

            //loop through the list to remove all selected attribute
            //if any option that is selected then set attribute selected again
            //and notify change (current is notifier)
            for (var i = 0, j = _html.getData(list).length; i < j; i++) {
                if (i === this.selectedIndex) {
                    if (isFunction(current)) {
                        current(selectedObj);
                    }
                }
            }
        });
        //return html object to facilitate fluent API
        return this;
    };

    //notify change immediately in fluent API
    //f5 for shorthand method
    //this method takes any arguments that contains computed properties or any computed properties
    this.refresh = this.f5 = function () {
        if (arguments.length) {
            var viewModels = arguments,
                nodeName = element && element.nodeName.toLowerCase(),
                eventName = '';
            //inspect node name to choose correct event type
            //if element is clickable then bind click event otherwise bind change event
            switch (nodeName) {
                case 'button':
                case 'a':
                    eventName = 'click';
                    break;
                case 'input':
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        eventName = 'click';
                    } else {
                        eventName = 'change';
                    }
                    break;
                default:
                    eventName = 'change';
                    break;
            }
            //bind change or click event
            _html.bind(element, eventName, function () {
                //loop through arguments
                for (var i = 0, j = viewModels.length; i < j; i++) {
                    _html.data.refresh(viewModels[i]);
                }
            });
        }
        return this;
    };

    //create select element, this method is used in basic dropdown version
    this.select = function () {
        var select = this.createElement('select');
        return this;
    };

    //create option for select tag
    //text (string | html.data): text to display
    this.option = function (text, value, selected) {
        var option = this.createElement('option'), selectedAttr = 'selected';
        option.value = _html.getData(value);
        option.text = _html.getData(text);
        if (_html.getData(selected) === true) {
            option.setAttribute(selectedAttr, selectedAttr);
            option.selected = true;
        }

        var update = function (val) {
            if (val === true) {
                option.setAttribute(selectedAttr, selectedAttr);
                option.selected = true;
            } else {
                option.removeAttribute(selectedAttr);
                option.selected = false;
            }
        }
        _html.subscribe(selected, update);
        return this;
    };

    this.ul = function () {
        var ul = this.createElement('ul');
        return this;
    };
    this.li = function (text) {
        var li = this.createElement('li');
        return this.text(text);
    };

    //use this method to empty a DOM element
    //usually, user wants to empty a div or a span or a table before rendering
    //this method will also remove all bounded event to its child
    this.empty = function (ele) {
        ele = ele || element;
        while (ele && ele.firstChild) {
            _html.unbindAll(ele.firstChild);
            ele.removeChild(ele.firstChild);
        }
        return this;
    };

    //this method is to set class for a tag
    //the element's class can be change automatically due to observer's value changed
    //observer (string | html.data): observer, notifier
    this.css = function (observer) {
        var ele = element;
        var value = _html.getData(observer);
        if (value) {
            //only accept valid css attribute
            //e.g marginRight height, etc
            //otherwise element's style won't work
            _html.extend(element.style, value);
        }

        //subscribe a listener, listen to any change form observer
        _html.subscribe(observer, function (val) {
            if (val) {
                _html.extend(element.style, val);
            }
        });
        return this;
    };

    //Visible binding
    //if observer's value is truthy, then display element otherwise hide it
    this.visible = function (observer) {
        var ele = element;
        var value = _html.getData(observer);

        var update = function (val) {
            if (val) {                     //accept any truthy value e.g true, 1, 'some text'
                ele.style.display = '';  //display it
            } else {                     //if not truthy then hide element
                ele.style.display = 'none';
            }
        }
        update(value);
        this.subscribe(observer, update);
        return this;
    };

    //hidden binding
    //if observer's value is truthy, then hide element otherwise display it
    //this is the opposite of visible
    //this method is needed because the visible binding only accept an function e.g model.isVisible
    //but can't accept "negative" function like !model.isVisible
    this.hidden = function (observer) {
        var ele = element;
        var value = _html.getData(observer);

        var update = function (val) {
            if (val) {                       //accept any truthy value e.g true, 1, 'some text'
                ele.style.display = 'none';  //hide it
            } else {                         //if not truthy then display element
                ele.style.display = '';
            }
        }
        update(value);
        this.subscribe(observer, update);
        return this;
    };
    
    //append a DOM tree/node after a selected node
    this.insertAfter = function(node) {
        node.parentNode.insertBefore(element, node.nextSibling);
    };
    
    //append a DOM tree/node before a selected node
    this.insertBefore = function(node) {
        node.parentNode.insertBefore(element, node);
    };

    //the method for observe value that needs to be tracked
    //this method is some kind of main method for the whole framework
    //it can observe a value, an array, notify any changes to listeners
    this.data = function (data) {
        //declare private value
        var _oldData            =  isArray(data) ? _html.array(data) : data,
            targets             =  _html.array([]),
            dependencies        =  _html.array([]),
            validators          =  _html.array([]),
            validationResults   =  _html.array([]),
            validationCallback  =  null,
            _newData            =  null;

        //used to notify changes to listeners
        //user will use it manually to refresh computed properties
        //because every non computed would be immediately updated to UI without user's notice
        var refresh = function () {
            //refresh dependencies immediately
            dependencies.length && dependencies.each(function (de) { de.refresh(); });
            setTimeout(function () {
                if (targets.length > 0) {
                    //fire bounded targets immediately
                    for (var i = 0; i < targets.length; i++) {
                        targets[i].call(targets[i], _html.getData(_oldData), _newData || null, null, 'render');
                    }
                }
            });
        };

        //use to get/set value
        //
        //if user want to get, then just call it
        //e.g name = html.data('Someone')
        //name() is getting 'Someone'
        //
        //if user want to set, then pass any value different from old value
        //name('Another one')
        //name() is getting 'Another one'
        //normally, set action will trigger all listeners
        //if _oldData is an array, then this action will trigger "render" action
        var init = function (obj, callback) {
            if (obj !== null && obj !== undefined) {
                //check if user want to set or want to get
                if (_oldData !== obj) {
                    //save the new value for later use
                    _newData = obj;
                    //validate the data
                    //throw exception so that caller can catch and process (display message/tooltip)
                    if(validators.length) {
                        validationCallback = callback;
                        //remove all validation error message before validating
                        while(validationResults.length) validationResults.pop();
                        validators.each(function (validator) { validator.call(init, _newData, _oldData); });
                    }
                    //check if new value is different from old value, if no, do nothing
                    //set _oldData, if it is an array then apply html.query
                    if (isArray(_oldData)) {
                        //if the current value is an array, then trigger "render" action
                        for (var i = 0, j = targets.length; i < j; i++) {
                            //trigger "render" action
                            //"render" will empty the node first, unbind all events bounded via html.bind
                            //then run renderer to render HTML
                            targets[i].call(targets[i], _html.getData(obj), _html.getData(_oldData), null, 'render');
                        }
                    } else {
                        //if value is not an array, then just notify changes
                        refresh(_oldData, obj);
                    }
                    _oldData = isArray(obj) ? _html.array(obj) : obj;
                }
            } else {
                //return real value immediately regardless of whether value is computed or just simple data type
                return _html.getData(_oldData);
            }
        };
        
        init['setValidationResult'] = function(isValid, message) {
            validationResults.push({ isValid: isValid, message: message });
            if(validators.length === validationResults.length) {
                validationCallback && validationCallback(validationResults);
                while(validationResults.length) validationResults.pop();
            }
        };
        
        init['getValidationResults'] = function(){
            return validationResults;
        };
        
        //use this method to declare strong dependencies
        //weak dependency can be done through html.refresh method
        init['changeAfter'] = function () {
            for (var i = 0, j = arguments.length; i < j; i++) {
                arguments[i].isComputed && arguments[i].setDependency(this);
            }
            return this;
        };

        init['setDependency'] = function (dependency) {
            dependencies.push(dependency);
        };
        
        init['validate'] = function(validator) {
            validators.push(validator);
        };

        //check if value is computed
        //return true if it's computed
        //return true if it's simple data type or an array (aka non-computed)
        init['isComputed'] = function () {
            return isFunction(_oldData);
        };

        //subscribe listeners to observer
        init['subscribe'] = function (updateFn) {
            targets.push(updateFn);
        };

        //unsubscribe listeners from observer
        init['unsubscribe'] = function (updateFn) {
            var index = targets.indexOf(updateFn);
            targets.splice(index, 1);
        };

        //get all targets of the observer, this may be used to manually trigger target by code outside
        init['targets'] = function (element) {
            return targets;
        };

        //refresh change
        init['refresh'] = init['f5'] = refresh;

        //silent set, this method is helpful for update value but not want UI to do anything
        init['silentSet'] = function (val) {
            _oldData = val;
        };
        
        //allow to inherit html.data from _html.data.extensions
        _html.extend(init, _html.data.validation);
        _html.extend(init, _html.data.extensions);
        
        /* ARRAY METHODS */
        //return init object immediately in case initial data is not array
        if(!isArray(data)) return init;
        
        //this method is to add item into an array
        //and notify 'add' or 'push' action to listeners depend on the index that user wants to insert at
        //if user wants to insert at the last index, then perform 'push'
        //otherwise perform 'add'
        //obj (object): item to be added
        //index (optional number): index indicates where to add item
        init['add'] = function (obj, index) {
            //by default, index would be the last index
            index = index === undefined ? _oldData.length : index;
            _oldData.splice(index, 0, obj);
            if (targets.length > 0) { //check if observer has targets
                //if yes, fire bounded element
                for (var i = 0, j = targets.length, oldData = _html.getData(_oldData) ; i < j; i++) {
                    targets[i].call(targets[i], oldData, obj, index, 'add');
                }
            }
            return this;
        };

        //Remove item from array
        //trigger "remove" action to update UI
        init['remove'] = function (item) {
            //search the index of item
            var index = _oldData.indexOf(item);
            //remove element at that index
            this.removeAt(index);
            return this;
        };

        //remove item from list by its index
        init['removeAt'] = function (index) {
            //firstly, ensure that the object is array
            //otherwise user may want to test bug of the framework
            //or they really misuse this method, then it's worth throw an exception
            var deleted = _oldData[index];
            _oldData.splice(index, 1);
            if (targets.length > 0) {
                //fire bounded element immediately
                for (var i = 0, j = targets.length, oldData = _html.getData(_oldData) ; i < j; i++) {
                    targets[i].call(targets[i], oldData, deleted, index, 'remove');
                }
            }

            //dispose the object and all reference including computed, observer, targets to avoid memory leak
            //below is very simple version of that task, improve in the future
            //we must loop recursively inside deleted object to remove all targets
            deleted = null;
            return this;
        };

        //remove the first item of list
        init['pop'] = function () {
            this.removeAt(_oldData.length - 1);
            return this;
        };

        //push an item into the list
        init['push'] = function (item) {
            _oldData.push(item);    //push item into array
            //notify to listeners that observer has changed value
            for (var i = 0, j = targets.length, oldData = _html.getData(_oldData) ; i < j; i++) {
                targets[i].call(targets[i], oldData, item, null, 'push');
            }
        };
        
        //arguments are similar to orderBy in html.array.orderBy method
        init['orderBy'] = function () {
            var args = arguments;
            _oldData.orderBy.apply(_oldData, args);
            return this;
        };
        
        /* END ARRAY METHODS */

        return init;
    };
    
    //prepare namespace for extending html.data
    this.data.extensions = {};
    //prepare namespace for validate html.data
    //html.data.validation namespace is use for validate the data
    this.data.validation = {};
    
    /* VALIDATION */
    //required validation
    this.data.validation.required = function(message) {
        this.validate(function(newValue, oldValue) {
            if (newValue === undefined || newValue === null || newValue === '') {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true, message);
            }
        });
        return this;
    };
    
    this.data.validation.maxLength = function(length, message) {
        this.validate(function(newValue, oldValue) {
            if (isString(newValue) && newValue.length > length) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true, message);
            }
        });
        return this;
    };
    
    this.data.validation.minLength = function(length, message) {
        this.validate(function(newValue, oldValue) {
            if (isString(newValue) && newValue.length < length) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true, message);
            }
        });
        return this;
    };
    
    this.data.validation.stringLength = function(min, max, message) {
        this.validate(function(newValue, oldValue) {
            if (isString(newValue) && (newValue.length < min || newValue > max)) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true, message);
            }
        });
        return this;
    };
    
    this.data.validation.range = function(min, max, message) {
        this.validate(function(newValue, oldValue) {
            if(/\D/.test(newValue)) {
                this.setValidationResult(false, 'The value must be a number.');
            } else if (parseFloat(newValue) < min) {
                this.setValidationResult(false, message || 'The value can\'t be less than ' + min + '.');
            } else if (parseFloat(newValue) > max) {
                this.setValidationResult(false, message || 'The value can\'t be greater than ' + max + '.');
            } else {
                this.setValidationResult(true, message);
            }
        });
        return this;
    };
    
    this.data.validation.greaterThan = function(obj, message) {
        this.validate(function(newValue, oldValue) {
            if(newValue <= _html.getData(obj)) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true);
            }
            
        });
        return this;
    };
    
    this.data.validation.lessThan = function(obj, message) {
        this.validate(function(newValue, oldValue) {
            if(newValue >= _html.getData(obj)) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true);
            }
            
        });
        return this;
    };
    
    this.data.validation.greaterThanOrEqual = function(obj, message) {
        this.validate(function(newValue, oldValue) {
            if(newValue < _html.getData(obj)) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true);
            }
            
        });
        return this;
    };
    
    this.data.validation.lessThanOrEqual = function(obj, message) {
        this.validate(function(newValue, oldValue) {
            if(newValue < _html.getData(obj)) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true);
            }
            
        });
        return this;
    };
    
    this.data.validation.equal = function(obj, message) {
        this.validate(function(newValue, oldValue) {
            if(newValue !== _html.getData(obj)) {
                this.setValidationResult(false, message);
            } else {
                this.setValidationResult(true);
            }
            
        });
        return this;
    };

    /* END OF VALIDATION */

    //this method is to refresh change by user's code
    //need to loop through the argument list then loop through each properties
    //check the property is computed, because we only want to notify computed object
    this.data.refresh = function (viewModel) {
        if (viewModel.isComputed && viewModel.isComputed()) {
            viewModel.refresh();
            return;
        }
        for (var i in viewModel) {
            if (viewModel[i].isComputed && viewModel[i].isComputed()) {
                viewModel[i].refresh();
            }
        }
    };

    //serialize on object that contains html.data
    //rootObj (object): any object that contains html.data
    this.serialize = function (rootObj) {
        //firstly, unwrap rootObj
        rootObj = rootObj.isComputed ? rootObj() : rootObj;
        //is root object an array
        var isArray = isArray(rootObj);
        //initialize result based on root obj type
        var result = isArray ? [] : {};
        //check that root object should be loop through properties
        //we don't use propertyIsEnumerable because it's really risky
        //we will go through all object that is basic type like Date, String, null, undefined, Number, etc
        var isPropertiesEnumerable = typeof rootObj === "object" && isNotNull(rootObj) && !_html.isDate(rootObj);
        if (!isPropertiesEnumerable) return rootObj;

        //loop through properties
        for (var i in rootObj) {
            if (rootObj[i].isComputed && !rootObj[i]().add) {
                //if it is an observer but not an array
                //then get then object value then assign to result
                result[i] = rootObj[i]();
            } else {
                result[i] = _html.serialize(rootObj[i]);
            }
        }

        //if root object is an array
        //loop through element
        //assign to result and then apply serialize recursively
        if (isArray) {
            for (var i = 0, j = rootObj.length; i < j; i++) {
                result[i] = _html.serialize(rootObj[i]);
            }
        }

        return result;
    }
}).call(html);

/* Document ready implementation 
 * https://github.com/addyosmani/jquery.parts/blob/master/jquery.documentReady.js
 */
(function () {
    // Define a local copy of $
    this.ready = function (callback) {
        registerOrRunCallback(callback);
        bindReady();
    };
    var readyBound = false,
    isReady = false,
    callbackQueue = [],
    registerOrRunCallback = function (callback) {
        if (isFunction(callback)) {
            callbackQueue.push(callback);
        }
    },
    DOMReadyCallback = function () {
        while (callbackQueue.length) {
            (callbackQueue.shift())();
        }
        registerOrRunCallback = function (callback) {
            callback();
        };
    },

    // The ready event handler
    DOMContentLoaded = function () {
        if (document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
        } else {
            // we're here because readyState !== "loading" in oldIE
            // which is good enough for us to call the DOM ready!
            document.detachEvent("onreadystatechange", DOMContentLoaded);
        }
        DOMReady();
    },

    // Handle when the DOM is ready
    DOMReady = function () {
        // Make sure that the DOM is not already loaded
        if (!isReady) {
            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if (!document.body) {
                return setTimeout(DOMReady, 1);
            }
            // Remember that the DOM is ready
            isReady = true;
            // If there are functions bound, to execute
            DOMReadyCallback();
            // Execute all of them
        }
    }, // /ready()

    bindReady = function () {
        var toplevel = false;

        if (readyBound) {
            return;
        }
        readyBound = true;

        // Catch cases where $ is called after the
        // browser event has already occurred.
        if (document.readyState !== "loading") {
            DOMReady();
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if (document.addEventListener) {
            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            // A fallback to window.onload, that will always work
            window.addEventListener("load", DOMContentLoaded, false);
            // If IE event model is used
        } else if (document.attachEvent) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            document.attachEvent("onreadystatechange", DOMContentLoaded);
            // A fallback to window.onload, that will always work
            window.attachEvent("onload", DOMContentLoaded);
            // If IE and not a frame
            // continually check to see if the document is ready
            try {
                toplevel = window.frameElement == null;
            } catch (e) { }
            if (document.documentElement.doScroll && toplevel) {
                doScrollCheck();
            }
        }
    },

    // The DOM ready check for Internet Explorer
    doScrollCheck = function () {
        if (isReady) {
            return;
        }
        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
        } catch (error) {
            setTimeout(doScrollCheck, 1);
            return;
        }
        // and execute any waiting functions
        DOMReady();
    };

}).call(html);
/* End Document ready implementation */

//Method Not documented
//http://codegolf.stackexchange.com/questions/2211/smallest-javascript-css-selector-engine
(function () {
    var _html = this,
        curCSS,
        rnotDigit = /\D+/g,
        attr = 'outline-color',
        attrOn = 'rgb(00,00,07)',
        rcamelCase = /-([a-z])/g;
    var fcamelCase = function (a, letter) {
        return letter.toUpperCase();
    };
    //From http://j.mp/FhELC
    var getElementById = function (id) {
        var elem = document.getElementById(id);
        if (elem) {
            //verify it is a valid match!
            if (elem.attributes['id'] && elem.attributes['id'].value == id) {
                //valid match!
                return elem;
            } else {
                //not a valid match!
                //the non-standard, document.all array has keys for all name'd, and id'd elements
                //start at one, because we know the first match, is wrong!
                for (var i = 1; i < document.all[id].length; i++) {
                    if (document.all[id][i].attributes['id'] && document.all[id][i].attributes['id'].value == id) {
                        return document.all[id][i];
                    }
                }
            }
        }
        return null;
    };
    var style = document.createElement('style'),
    script = document.getElementsByTagName('script')[0];
    script.parentNode.insertBefore(style, script);

    if (document.defaultView && document.defaultView.getComputedStyle) {
        curCSS = function (elem, name) {
            return elem.ownerDocument.defaultView.getComputedStyle(elem, null).getPropertyValue(name);
        };

    } else if (document.documentElement.currentStyle) {
        curCSS = function (elem, name) {
            return elem.currentStyle && elem.currentStyle[name.replace(rcamelCase, fcamelCase)];
        };
    }
    this.query = this.querySelectorAll = function (selector, context, extend) {
        context = context || document;
        extend = extend || [];

        var id, p = extend.length || 0;

        try { style.innerHTML = selector + "{" + attr + ":" + attrOn + "}"; }
        //IE fix
        catch (id) { style.styleSheet.cssText = selector + "{" + attr + ":" + attrOn + "}"; }

        if (document.defaultView && document.querySelectorAll) {
            id = "";
            var _id = context.id,
                _context = context;
            if (context != document) {
                id = "__slim__";
                context.id = id;
                id = "#" + id + " ";
            }
            context = document.querySelectorAll(id + selector);
            if (_id) _context.id = _id;
            //Setting selector=1 skips checking elem
            selector = 1;
        }
        else if (!context[0] && (id = /(.*)#([\w-]+)([^\s>~]*)[\s>~]*(.*)/.exec(selector)) && id[2]) {
            //no selectors after id
            context = getElementById(id[2]);
            //If there isn't a tagName after the id we know the el just needs to be checked
            if (!id[4]) {
                context = [context];
                //Optimize for #id
                if (!id[1] && !id[3]) {
                    selector = 1;
                }
            }
        }
        //If context contains an array or nodeList of els check them otherwise retrieve new els by tagName using selector last tagName
        context = (selector == 1 || context[0] && context[0].nodeType == 1) ?
            context :
            context.getElementsByTagName(selector.replace(/\[[^\]]+\]|\.[\w-]+|\s*$/g, '').replace(/^.*[^\w]/, '') || '*');

        for (var i = 0, l = context.length; i < l; i++) {
            //IE returns comments when using *
            if (context[i].nodeType == 1 && (selector == 1 || curCSS(context[i], attr).replace(rnotDigit, '') == 7)) {
                extend[p++] = context[i];
            }
        }
        extend.length = p;
        return _html.array(extend);
    };

    this.querySelector = function (selector, context, extend) {
        return this.querySelectorAll(selector, context, extend)[0];
    }
}).call(html);


/*html loader 
NOTE: this method only support load on client
usage of this function
html.scripts({
    jQuery: '/script/jquery-2.1.0.js?v=123123',
        jQueryUI: [
    '/script/jquery-dataTables.js?v=123123',
    '/script/jquery-datapicker.js?v=123123',
    '/script/jquery-tooltip.js?v=123123',
    ]
});
html.styles({
    jQuery: '/script/jquery-2.1.0.css?v=123123',
        jQueryUI: [
    '/styles/jquery-dataTables.css?v=123123',
    '/styles/jquery-datapicker.css?v=123123',
    '/styles/jquery-tooltip.css?v=123123',
    ],
    bootstrap: '/styles/bootstrap.css'
});
html.scripts.render('jQuery').then('jQueryUI');
html.styles.render('jQueryUI').then('bootstrap');*/

(function () {
    var _html = this;
    var scripts = {}, styles = {}
        , urlList = html.array([])
        , dependencies = html.array([])
        , bundleQueue = html.array([]);

    var head = document.head || html.querySelector('head') || html(document).createElement('head').$$();

    var dependenciesLoadedCallback = function (bundle) {
        var isAllLoaded = false;
        if (isString(dependencies)) {
            urlList.each(function (node) {
                if (node.url === dependencies && node.isLoaded) {
                    isAllLoaded = true;
                }
            });
        } else if (isArray(dependencies)) {
            isAllLoaded = true;
            dependencies.each(function (url) {
                var isLoaded = urlList.firstOrDefault(function (x) { return x.url === url && x.isLoaded; });
                if (!isLoaded) {
                    isAllLoaded = false;
                }
            });
        }
        if (isAllLoaded) {
            //after all script of previous bundle have been loaded
            //get the next bundle
            var nextBundle = bundleQueue.firstOrDefault();
            if (isFunction(nextBundle)) {
                //if the next bundle is a function
                //execute it, it is from done method
                nextBundle();
                //remove that callback function from the bundle queue
                bundleQueue.remove(nextBundle);
                //get the next bundle so that we can continue with another one
                nextBundle = bundleQueue.firstOrDefault();
            }
            //remove the bundle in processing
            bundleQueue.remove(nextBundle);
            //load that bundle
            return _html.scripts.render(nextBundle);
        }
    };

    _html.config.allowDuplicate = false;

    //create scripts node, append them to head section of document
    //browser will know how to treat that node says load it and execute
    var createScriptNode = function (url, callback) {
        //check if the script has been loaded?
        var isLoaded = urlList.firstOrDefault(function (x) { return x.url === url });
        //if the script has been loaded and duplication is not allowed, do nothing
        if (isLoaded && !_html.config.allowDuplicate) return;

        //if the script hasn't been loaded, create script node
        var node = document.createElement('script');
        //set type of that node to text/javascript
        //this is traditional type
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        //set the url for the script node
        node.async = true;

        var scriptLoaded = function () {
            //remove the node after finish loading
            node.parentElement.removeChild(node);
            //set a flag for url loading tracking state
            urlList.push({ url: url, isLoaded: true });
            //call the callback, so can execute "then" function
            callback.call(node, url);
        }
        if (node.onreadystatechange !== undefined) {
            node.onload = node.onreadystatechange = function () {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoaded();
                }
            };
        } else {
            _html.bind(node, 'load', scriptLoaded);
        }
        node.src = url;
        //append the script node to header, if not, browser doesn't load and execute
        head.appendChild(node);
        return node;
    };

    //create style node, append them to head section of document
    //browser will know how to treat that node says load it and apply the css
    var createStyleNode = function (url) {
        var isLoaded = urlList.firstOrDefault(function (x) { return x.url === url });
        if (isLoaded && !_html.config.allowDuplicate) return;

        var node = document.createElement('link');
        node.type = 'text/css';
        node.rel = 'stylesheet';
        node.href = url;
        node.async = true;
        head.appendChild(node);
        urlList.push({ url: url, isLoaded: true });
        return node;
    };

    this.scripts = function (bundles) {
        _html.extend(scripts, bundles);
    };
    this.styles = function (bundles) {
        _html.extend(styles, bundles);
    };

    this.scripts.render = function (bundle) {
        var scriptList = scripts[bundle];
        if (!scriptList) return;
        if (isString(scriptList)) {
            dependencies = scriptList;
            createScriptNode(scriptList, dependenciesLoadedCallback);
        } else if (isArray(scriptList)) {
            dependencies = html.array(scriptList);
            for (var i = 0, j = scriptList.length; i < j; i++) {
                createScriptNode(scriptList[i], dependenciesLoadedCallback);
            }
        }
        return this;
    };

    this.styles.render = function (bundle) {
        var styleList = styles[bundle];
        if (!styleList) return;
        if (isString(styleList)) {
            createStyleNode(styleList);
        } else if (isArray(styleList)) {
            for (var i = 0, j = scriptList.length; i < j; i++) {
                createStyleNode(styleList[i]);
            }
        }
        return this;
    };

    //append more scripts into the queue to load
    this.scripts.then = function (bundle) {
        //just append the bundle queue
        bundleQueue.push(bundle);
        return this;
    };

    this.styles.then = function (bundle) {
        return _html.styles.render(bundle);
    };

    //callback function - run when all scripts has been loaded
    this.scripts.done = function (callback) {
        bundleQueue.push(callback);
        return this;
    };
}).call(html);

return html;
}));
