// HTML engine JavaScript library
// (c) Nguyen Ta An Nhan - https://github.com/nhanaswigs/HTMLjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

//TODO: 
//1. serialize data to json, cache events in private object, not in expando, html.query can be querySelectorAll
//2. unit test, inspect memory leaking, ajax loading for JS, CSS, ajax method for user - not to depend on jQuery
//3. integrate with jQuery UI, jQuery mobile, unit test
//4. integrate with Backbone, knockout, Angular
//5. re-write jQuery controls with the framework(low priority)
//6. Add more features: routing, dependency injection(fluent api, low priority)

//declare namespace
var html = {};

(function () {
    var _html = this;

    //use this method for querying data from array, usage is similar to Linq
    //this method is also used for query DOM, using CSS query
    //arg (Array | string)
    //  if it is an array, then apply query fluent API for array
    //  if it is a string, then apply css query selector aka querySelectorAll
    this.query = function (arg) {
        if (arg instanceof Array) {
            _html.extend(arg, _html.query);
            return arg;
        }
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
            var result = [];
            for (var i = 0; i < this.length; i++)
                result.push(mapping(this[i]));
            return _html.query(result);
        }

        //where is similar to filter in modern browser
        this.where = function (predicate) {
            var ret = [];
            for (var i = 0; i < this.length; i++)
                if (predicate(this[i])) {
                    ret.push(this[i]);
                }
            return _html.query(ret);
        }

        //reduce is a famous method in any functional programming language - also can use this with fluent API
        this.reduce = function (iterator, init, context) {
            var result = typeof (init) != 'undefined' && init != null ? init : [];
            for (var i = 0, j = this.length; i < j; i++) {
                result = iterator.call(context, result, this[i]);
            }
            return result;
        }

        //similar to reduce
        this.reduceRight = function (iterator, init, context) {
            var result = typeof (init) != 'undefined' && init != null ? init : [];
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
            for (var i = 0, j = this.length; i < j; i++)
                if (predicate.call(predicateOwner, this[i]))
                    return this[i];
            throw 'Can\'t find any element matches';
        }

        //find the first one that matches condition, if not found return null
        this.firstOrDefault = function (predicate, predicateOwner) {
            for (var i = 0, j = this.length; i < j; i++)
                if (predicate.call(predicateOwner, this[i]))
                    return this[i];
            return null;
        }

        //find index of the item in a list, this method is used for old browser
        //if indexOf method is native code, then just call it
        this.indexOf = function (item) {
            if (typeof Array.prototype.indexOf == "function")
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
    }).call(this.query);

    //use native concat method but return array still queryable (fluent API)
    this.query.addRange = function (items) {
        return _html.query(Array.prototype.concat.call(this, items));
    };

    //expando property prefix
    //expando will look like input['__engine__events__change']
    //the value of expando will be an array of bounded events
    //expandoLength is for cache the length of expando
    var expando = '__engine__events__',
        expandoLength = expando.length;

    //expandoList is a list of expando that have expanded to element e.g
    //input.__engine__events__click = someArray
    //select.__engine__events__change = anotherArray
    //means that expandoList = [__engine__events__click, __engine__events__change]
    //this variable is used for looping through element's properties faster(10 times)
    //because we just loop through specified expando properties instead of loop through all properties
    var expandoList = [];

    //get data from an observable object
    this.getData = function (data) {
        //check whether it is html.data object or not
        //if it is html.data then excute to get value or inner function aka "computed function"
        //because html.data could take a function as parameter
        var ret = data;
        while (ret instanceof Function) {
            ret = ret instanceof Function ? ret() : ret;
        }
        //return real value
        return ret;
    };

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

        //get real expando property based on exppando prefix and the event name
        //e.g __engine__events__change
        var expandoEvent = expando + name;
        //check to see whether this expandoEvent has been created in global expandoList variable
        //if not yet, then in push it in the list, then push event to element's expando
        if (_html.query.indexOf.call(expandoList, expandoEvent) < 0) {
            expandoList.push(expandoEvent);
            element[expandoEvent] = [];
            element[expandoEvent].push(callback);
            //if expando has been added in global expandoList
        } else {
            //check element's expando has been initialized
            //if no initialize that element's expando
            if (!(element[expandoEvent] instanceof Array)) {
                element[expandoEvent] = [];
            }
            //push event in the array to trace later
            element[expandoEvent].push(callback);
        }
    };

    //use this method to trigger event bounded to element via html.bind
    //ele: element that user want to trigger event
    //name: event name
    this.trigger = function (ele, name) {
        if (!ele) {
            throw 'Element must be specified';
        }
        if (!name) {
            throw 'Event name must be specified';
        }
        var expandoEvent = expando + name;
        //check if element's expando properties has value
        //if yes fire event, pass element
        if (ele[expandoEvent] instanceof Array && ele[expandoEvent].length > 0) {
            for (var i = 0, j = ele[expandoEvent].length; i < j; i++) {
                ele[expandoEvent][i].call(ele);
            }
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
        if (ele.parentElement !== null) {
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
        if (ele === null || ele === undefined) {
            throw 'Element to unbind all events must be specified';
        }
        var eventName;
        //loop through the expando list, because this list is limited
        //due to html.bind only add an item when html.bind is called
        //so performance is good now
        for (var e = 0, ej = expandoList.length; e < ej; e++) {
            eventName = expandoList[e]; //get expando
            //check element's expando property has value
            //if yes, loop through methods assigned and unbind them all
            if (ele[eventName] instanceof Array && ele[eventName].length > 0) {
                for (var i = 0, j = ele[eventName].length; i < j; i++) {
                    _html.unbind(ele, eventName.slice(expandoLength), ele[eventName][i], false);
                }
                //clear element's expando property so that GC can collect memory
                ele[eventName] = null;
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
    this.unbind = function (element, name, callback, bubble) {
        if (!element) {
            throw 'Element to unbind event must be specified';
        }
        if (!name) {
            throw 'Event name must be specified';
        }
        //get element's expando property
        var expandoEvent = expando + name,
        //get index of the callback function in element's expando property
            index = _html.query.indexOf.call(element[expandoEvent], callback);
        //if methods has been assigned to expando then remove the method from that
        if (element[expandoEvent] instanceof Array && index >= 0) {
            element[expandoEvent].splice(index, 1);
        }

        if (!callback) return;
        //detach event for non IE
        if (element.removeEventListener) {
            element.removeEventListener(name, callback, bubble);
            //remove event listener, used for IE
        } else {
            element.detachEvent('on' + name, callback);
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

    //this method will take a DOM, which user render HTML from
    //container (Element): container
    this.render = function (container) {
        this.element = container;
        return this;
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
        this.element.appendChild(ele);
        this.element = ele;
        return this.element;
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
            //from start index, remove numOfElement times, done
            for (var i = 0; i < numOfElement; i++) {
                //before remove we should unbind all events
                _html.unbindAll(parent.children[index]);
                parent.removeChild(parent.children[index]);
            }
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

        //return immediately if model not pass, do nothing
        if (!model || !model.length || !this.element) return;
        //save the container pointer to parent
        var parent = this.element;
        //initialize numOfElement
        var numOfElement = 0;
        //this method is used to get numOfElement
        //it calls renderer once, count child elements inside tmpNode
        //dispose tmpNode and return counter
        var getNumOfEle = function () {
            var tmpNode = document.createElement('tmp');
            renderer.call(tmpNode, model()[0], 0);
            var ret = tmpNode.children.length;
            _html.dispose(tmpNode);
            return ret;
        };
        //the main idea to render is this loop
        //just use renderer callback, let user do whatever they want
        for (var i = 0, MODEL = _html.getData(model), j = MODEL.length; i < j; i++) {
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
                    renderer.call(parent, item, items.length);
                    break;
                case 'add':
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
                    //unbind all events first
                    //then remove all children
                    _html.unbindAll(parent);
                    while (parent.firstChild) {
                        parent.removeChild(parent.firstChild);
                    }
                    //render it, call renderer to do thing
                    for (var i = 0, j = items.length; i < j; i++) {
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
        this.element = this.element.parentElement;
        return this;
    };

    //this method is used to get current element
    //sometimes user wants to create their own "each" method and want to intercept renderer
    //NOTE: only use this method to ensure encapsulation
    //in the future, we may hide this.element, declare it as private not publish anymore
    this.$$ = function () {
        return this.element;
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
        var updateFn = function (val) {                  //update function, only run when observer is from html.data
            while (span.firstChild !== null)
                span.removeChild(span.firstChild);     //remove all existing content
            span.appendChild(document.createTextNode(val));
        }
        this.subscribe(observer, updateFn);            //subscribe update function
        return this;
    }

    //create input element
    this.input = function (observer) {
        //var _oldVal;
        var input = this.createElement('input');      //create the input
        input.value = this.getData(observer);         //get value of observer
        if (observer instanceof Function) {            //check if observer is from html.data
            //if observer is html.data then register change event
            //so that any change can be notified
            this.change(function (e) {
                var _newVal = this.value;
                //observer.silentSet(_newVal);
                //check if observer is computed
                //if not then set observer's value
                if (observer.isComputed && !observer.isComputed()) {
                    observer(_newVal);
                    //if yes otherwise just notify change
                } else {
                    observer.refresh();
                }
            }, input);
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

    //this method is used to set value for an input
    //observer: html.data
    //this method seem not work now
    //we must check for input type, how to update value and how to notify change
    this.val = function (observer) {
        var realValue = _html.getData(observer);
        var input = this.element;
        //throw exception when current element is not an input
        if (!input || !input.type) {
            throw 'The element is not an input, please check current element';
        }
        var valueField;
        switch (input.type) {
            //list of input type below has value
            case 'text':
            case 'hidden':
            case 'email':
            case 'number':
            case 'range':
            case 'color':
            case 'date':
            case 'datatime':
                valueField = 'value';
                input[valueField] = realValue;
                break;
                //checkbox and radio button have checked attribute
                //we need to handle these types of input differently
                //firstly set value checked to be true or false
                //secondly set attribute checked equals to 'checked' or ''
            case 'checkbox':
            case 'radio':
                valueField = 'checked';
                if (realValue === 'true' || realValue === true) {
                    input.setAttribute('checked', 'checked');
                    input.checked = true;
                } else {
                    input.removeAttribute('checked');
                    input.checked = false;
                }
                break;
            default:
                throw 'Unsupport input type value, please use another binding';
                break;
        }

        //check if observer is html.data
        if (observer instanceof Function) {
            //if observer is html.data
            //then bind change event so that it can notify if any changes happen
            var change = function (e) {
                var _newVal = this.value; //this here is element that fire the event
                //if observer is not computed property
                if (observer.isComputed && !observer.isComputed()) {
                    observer(_newVal);
                } else {
                    observer.refresh();
                }
            };
            //subscribe change, listen to any notifiers event itself
            //we must listen to itself because we have no idea how user change the value by code
            var updateFn = function (value) {
                //check if input type has valid value attribute to set
                //only check valueField because that variable has been change before along with input type
                //if yes set the attribute
                if (valueField === 'value') {
                    input.value = value;
                    //set attribute if this checkbox/radio should be checked
                } else if (value === 'true' || value === true) {
                    input.setAttribute('checked', 'checked');
                    input.checked = true;
                    //set attribute if this checkbox/radio shouldn't be checked
                } else {
                    input.removeAttribute('checked');
                    input.checked = false;
                }
                //dispose element if it is no longer in the document
                _html.disposable(input, observer, this);
            };
            this.subscribe(observer, updateFn);
            this.bind(input, 'change', change, false);
        }
        //return html to facilitate fluent API
        return this;
    };

    //set inner HTML for a tag
    //this method is handle for unit test because it contains only one line of code
    //and no way to fail, so it is more trusted than html.render
    this.innerHTML = function (text) {
        this.element.innerHTML = text;
    };

    //bind change event to current element
    //this is shorthand for html.bind(element, 'change', callback)
    //this method is also used in fluent API, we can call html.bind but a lot of code
    //
    //this method is also really quirk because it needs to deal with IE < 9
    //with IE < 9, they don't fire event in expected order
    //
    //callback (Function): event to bind to element
    //srcElement (optional Element): element fires the event
    this.change = function (callback, srcElement) {
        var nodeName = this.element.nodeName.toLowerCase();
        if (nodeName === 'checkbox' || nodeName === 'radio') {
            throw 'You must bind click event for checkbox and radio';
        }
        this.bind(this.element, 'change', function (e) {
            e = e || window.event;
            if (!callback) return;
            callback.call(srcElement || this === window ? e.srcElement || e.target : this, e);
        }, false);
        //return html to facilitate fluent API
        return this;
    };

    //bind click event to current element
    //this is shorthand for html.bind(element, 'click', callback)
    //this method is also used in fluent API, we can call html.bind but a lot of code
    //callback (Function): event to bind to element
    //model (object): value parameter
    //  need to invoke this parameter because the framework has no idea about additional parameter
    //  this additional parameter usually is used to delete an item in list
    //srcElement (optional Element): element fires the event
    this.click = function (callback, model, srcElement) {
        this.bind(this.element, 'click', function (e) {
            e && e.preventDefault ? e.preventDefault() : e.returnValue = false;
            callback.call(srcElement || this === window ? e.srcElement || e.target : this, model, e);
        }, false);
        //return html to facilitate fluent API
        return this;
    };

    //this.clickComputed = function (callback, model, srcElement) {
    //	this.bind(this.element, 'click', function (e) {
    //		e && e.preventDefault? e.preventDefault(): e.returnValue = false;
    //        //var waitFor
    //		callback.call(srcElement || this === window? e.srcElement || e.target: this, model, e);
    //	}, false);
    //    //return html to facilitate fluent API
    //	return this;
    //};

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
        if (observer instanceof Function) {
            this.change(function (e) {                   //bind event change to the radio button
                if (observer.isComputed()) {             //check if observer is computed property
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
        var chkBox = this.createElement('input', 'checkbox');
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
        if (observer instanceof Function) {
            //bind change event so that any changes will be notified
            this.click(function (ele, e) {
                if (observer.isComputed()) {              //if observer contains computed property
                    chkBox.removeAttribute('checked');  //then just remove attribute, let user handle event
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
        var element = this.element;
        var className = _html.getData(observer);
        this.element.setAttribute('class', className);

        this.subscribe(observer, function (value) {
            element.setAttribute('class', value);
        });
        return this;
    };

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

    //create common element that requires text parameter
    var commonEles = _html.query(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th']);
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
        this.element.id = id;
        return this;
    };

    //set attribute for element
    //loop through parameter object's properties
    //set them to the element
    this.attr = function (attr) {
        for (var i in attr) {
            this.element.setAttribute(i, attr[i]);
        }
        return this;
    };

    //create table elements, they should have no parameter
    var tableEle = _html.query(['table', 'thead', 'tbody', 'tr', 'td']);
    tableEle.each(function (ele) {
        _html[ele] = function () {
            _html.createElement(ele);
            return _html;
        };
    });

    //create simple a tag
    this.a = function (text, href) {
        var a = document.createElement('a');
        a.innerHTML = text || '';
        a.href = href || '';
        this.element.appendChild(a);
        this.element = a;
        return this;
    };

    //dropdown for simple select list, no optionGroup
    //list: list of data will display
    //current: current data selected
    //displayField (string): field to display text for option
    //valueField (string): field to get value for option
    this.dropdown = function (list, current, displayField, valueField) {
        var currentValue = _html.getData(current);
        var select = this.createElement('select');
        //render options for the select tag
        //An option could be selected if its value equal to currentModel
        this.each(list, function (model) {
            var value = typeof (valueField) === 'string' ? model[valueField] : model;
            _html.render(this).option(model[displayField], value, model === currentValue).$();
        });

        //add change event to select tag
        this.change(function (event) {
            //get current value of select in the list parameter
            var selectedObj = list[this.selectedIndex];

            //loop through the list to remove all selected attribute
            //if any option that is selected then set attribute selected again
            //and notify change (current is notifier)
            for (var i = 0, j = _html.getData(list).length; i < j; i++) {
                this.children[i].removeAttribute('selected');
                if (i === this.selectedIndex) {
                    this.children[i].setAttribute('selected', 'selected');
                    if (current instanceof Function) {
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
                nodeName = this.element && this.element.nodeName.toLowerCase(),
                eventName = '';
            //inspect node name to choose correct event type
            //if element is clickable then bind click event otherwise bind change event
            switch (nodeName) {
                case 'button':
                case 'a':
                    eventName = 'click';
                    break;
                case 'input':
                    if (this.element.type === 'checkbox' || this.element.type === 'radio') {
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
            _html.bind(this.element, eventName, function () {
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
    this.option = function (text, observer, selected) {
        //create option element
        var option = this.createElement('option');
        //get real value from observer
        var value = _html.getData(observer);
        //check if value is complex object
        //if yes, then save that value for later use
        if (typeof (value) == 'object') {
            option.__engineValue__ = value;
            //if no, set option value
        } else {
            option.value = value;
        }
        //set text of the option
        option.text = _html.getData(text);
        //set option selected
        if (_html.getData(selected) === true) {
            option.setAttribute('selected', 'selected');
            option.selected = true;
        }

        //subscribe listener to selected object, so that user can choose which option to be selected
        //e.g selected(false)
        _html.subscribe(selected, function (val) {
            if (val === true) {                                  //check if notifier send true value, if yes
                option.setAttribute('selected', 'selected');   //add attribute selected to the option
                option.selected = true;                        //set property selected to true
            } else {                                           //if no
                option.removeAttribute('selected');            //remove attribute selected from the option
                option.selected = false;                       //set property selected to false
            }
        });
        //return html to facilitate fluent API
        return this;
    };
    this.ul = function () {
        var ul = this.createElement('ul');
        return this;
    };
    this.li = function () {
        var li = this.createElement('li');
        return this;
    };

    //use this method to empty a DOM element
    //usually, user wants to empty a div or a span or a table before rendering
    //this method will also remove all bounded event to its child
    this.empty = function (ele) {
        ele = ele || this.element;
        //while the ele still has children
        while (ele && ele.lastChild) {
            //dispose lastChild
            _html.dispose(ele.lastChild);
        }
        //return html to facilitate fluent API
        return this;
    };

    //this method is to set class for a tag
    //the element's class can be change automatically due to observer's value changed
    //observer (string | html.data): observer, notifier
    this.css = function (observer) {
        var ele = this.element;
        var value = _html.getData(observer);
        if (value) {
            //only accept valid css attribute
            //e.g marginRight height, etc
            //otherwise element's style won't work
            _html.extend(this.element.style, value);
        }

        //subscribe a listener, listen to any change form observer
        _html.subscribe(observer, function (val) {
            if (val) {
                _html.extend(this.element.style, val);
            }
        });
        return this;
    };

    //Visible binding
    //if observer's value is truthy, then display element otherwise hide it
    this.visible = function (observer) {
        var ele = this.element;
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
        var ele = this.element;
        var value = _html.getData(observer);

        var update = function (val) {
            if (val) {                         //accept any truthy value e.g true, 1, 'some text'
                ele.style.display = 'none';  //hide it
            } else {                         //if not truthy then display element
                ele.style.display = '';
            }
        }
        update(value);
        this.subscribe(observer, update);
        return this;
    };

    //the method for observe value that needs to be tracked
    //this method is some kind of main method for the whole framework
    //it can observe a value, an array, notify any changes to listeners
    this.data = function (data) {
        //declare private value
        var _oldData = data instanceof Array ? _html.query(data) : data, targets = _html.query([]);

        //used to notify changes to listeners
        //user will use it manually to refresh computed properties
        //because every non computed would be immediately updated to UI without user's notice
        var refresh = function () {
            //if(targets.length > 0){
            //	//fire bounded targets immediately
            //	for(var i = 0, j = targets.length; i < j; i++){
            //		targets[i].call(targets[i], _html.getData(_oldData));
            //	}
            //}
            //(function(){
            var waitForEveryChangeFinish = setTimeout(function () {
                if (targets.length > 0) {
                    //fire bounded targets immediately
                    for (var i = 0, j = targets.length; i < j; i++) {
                        targets[i].call(targets[i], _html.getData(_oldData));
                    }
                }
                clearTimeout(waitForEveryChangeFinish);
            }, 1);
            //})()
        }

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
        var init = function (obj) {
            if (obj !== null && obj !== undefined) {                          //check if user want to set or want to get, there're parameters means user wants to get
                if (_oldData !== obj) {                                        //check if new value is different from old value, if no, do nothing
                    _oldData = obj instanceof Array ? _html.query(obj) : obj;   //set _oldData, if it is an array then apply html.query
                    if (_oldData instanceof Array) {                            //if the current value is an array, then trigger "render" action
                        for (var i = 0, j = targets.length; i < j; i++) {
                            //trigger "render" action
                            //"render" will empty the node first, unbind all events bounded via html.bind
                            //then run renderer to render HTML
                            targets[i].call(targets[i], _html.getData(_oldData), null, null, 'render');
                        }
                    } else {
                        //if value is not an array, then just notify changes
                        refresh();
                    }
                }
            } else {
                //return real value immediately regardless of whether value is computed or just simple data type
                return _html.getData(_oldData);
            }
        };

        //ensure that object is an array
        //use this method to ensure that every array operation will be notified correctly
        var ensureArray = function (obj) {
            if (!(obj instanceof Array)) {
                throw 'Observerd object is not an array, can\'t use this function';
            }
        };

        //check if value is computed
        //return true if it's computed
        //return true if it's simple data type or an array (aka non-computed)
        init['isComputed'] = function () {
            return _oldData instanceof Function;
        }

        //this method is to add item into an array
        //and notify 'add' or 'push' action to listeners depend on the index that user wants to insert at
        //if user wants to insert at the last index, then perform 'push'
        //otherwise perform 'add'
        //obj (object): item to be added
        //index (optional number): index indicates where to add item
        init['add'] = function (obj, index) {
            ensureArray(_oldData);
            //by default, index would be the last index
            index = index === undefined ? _oldData.length : index;
            _oldData.splice(index, 0, obj);
            if (targets.length > 0) { //check if observer has targets
                //if yes, fire bounded element
                for (var i = 0, j = targets.length; i < j; i++) {
                    targets[i].call(targets[i], _html.getData(_oldData), obj, index, 'add');
                }
            }
        };

        //Remove item from array
        //trigger "remove" action to update UI
        init['remove'] = function (item) {
            ensureArray(_oldData);
            //search the index of item
            var index = _oldData.indexOf(item);
            //remove element at that index
            this.removeAt(index);
        };

        //remove item from list by its index
        init['removeAt'] = function (index) {
            //firstly, ensure that the object is array
            //otherwise user may want to test bug of the framework
            //or they really misuse this method, then it's worth throw an exception
            ensureArray(_oldData);
            var deleted = _oldData[index];
            _oldData.splice(index, 1);
            if (targets.length > 0) {
                //fire bounded element immediately
                for (var i = 0, j = targets.length; i < j; i++) {
                    targets[i].call(targets[i], _html.getData(_oldData), deleted, index, 'remove');
                }
            }

            //dispose the object and all reference including computed, observer, targets to avoid memory leak
            //below is very simple version of that task, improve in the future
            //we must loop recursively inside deleted object to remove all targets
            deleted = null;
        };

        //remove the first item of list
        init['pop'] = function () {
            ensureArray(_oldData);
            this.removeAt(_oldData.length - 1);
        };

        //push an item into the list
        init['push'] = function (item) {
            ensureArray(_oldData);  //ensure that object is an array
            _oldData.push(item);    //push item into array
            //notify to listeners that observer has changed value
            for (var i = 0, j = targets.length; i < j; i++) {
                targets[i].call(targets[i], _html.getData(_oldData), item, null, 'push');
            }
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

        //slient set, this method is helpful for update value but not want UI to do anything
        init['silentSet'] = function (val) {
            _oldData = val;
        };
        return init;
    };

    //this method is to refresh change by user's code
    //need to loop through the argument list then loop through each properties
    //check the property is computed, because we only want to notify computed object
    this.data.refresh = function (viewModel) {
        for (var i in viewModel) {
            if (viewModel[i].isComputed && viewModel[i].isComputed()) {
                viewModel[i].refresh();
            }
        }
    };
}).call(html);


//Method Not documented
//http://codegolf.stackexchange.com/questions/2211/smallest-javascript-css-selector-engine
(function () {
    var curCSS,
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
    style = document.createElement('style'),
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
    this.querySelectorAll = function (selector, context, extend) {
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
        return extend;
    };

    this.querySelector = function (selector, context, extend) {
        return this.querySelectorAll(selector, context, extend)[0];
    }
}).call(html);