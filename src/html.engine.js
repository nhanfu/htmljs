// HTML engine JavaScript library
// (c) Nguyen Ta An Nhan - https://github.com/nhanaswigs/HTMLjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

//TODO: 
//1. serialize data to json
//2. unit test, inspect memory leaking, ajax loading for JS, CSS, ajax method for user - not to depend on jQuery
//3. integrate with jQuery UI, jQuery mobile, unit test
//4. integrate with Backbone, knockout, Angular
//5. re-write jQuery controls with the framework(low priority)
//6. Add more features: routing, dependency injection(fluent api, low priority)

//declare namespace
var html = {};

(function(){
    var _html = this;
    
    //only use this method for querying data from array, usage is similar to Linq
    this.query = function () {
		var tmp_array = {};
		tmp_array = (Array.apply(tmp_array, arguments[0] || []) || tmp_array);
		//Now extend tmp_array
		_html.extend(tmp_array, _html.query);
		return tmp_array;
	};
	
    //This function takes html.query object and create methods for html.query namespace
    //html.query methods will be used in any array passed through html.query
    //because that array will inherits from methods inside html.query
    //NOTE: every html.query object method can be used with fluent API
    //for example: html.query([1,2,3,4].select(function(x){return x*x}).where(function(x){return x > 4});
	(function(){
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
	this.query.addRange = function(items){
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
	this.getData = function(data){
        //check whether it is html.data object or not
        //if it is html.data then excute to get value or inner function aka "computed function"
        //because html.data could take a function as parameter
		while(data instanceof Function){
			data = data instanceof Function? data(): data;
		}
        //return real value
		return data;
	};
	
    //bind callback method to element's event
    //element: the element to bind event
    //name: event name
    //callback: event method
    //bubble (optional) (default: false): bubble event
	this.bind = function(element, name, callback, bubble){
        if(element === undefined || element === null){
            throw 'Element must be specified';
        }
        if(name === undefined || name === null){
            throw 'Event name must be specified';
        }
        if(callback === undefined || callback === null){
            throw 'Callback must be specified';
        }
        
		if(element.attachEvent){ //attach event for IE
			element.attachEvent('on' + name, callback);
		} else { //addEventListener for other browsers
			element.addEventListener(name, callback, bubble);
		}
        
        //get real expando property based on exppando prefix and the event name
        //e.g __engine__events__change
        var expandoEvent = expando + name;
        //check to see whether this expandoEvent has been created in global expandoList variable
        //if not yet, then in push it in the list, then push event to element's expando
        if(_html.query.indexOf.call(expandoList, expandoEvent) < 0){
            expandoList.push(expandoEvent);
            element[expandoEvent] = [];
            element[expandoEvent].push(callback);
        //if expando has been added in global expandoList
        } else {
            //check element's expando has been initialized
            //if no initialize that element's expando
            if(!(element[expandoEvent] instanceof Array)){
                element[expandoEvent] = [];
            }
            //push event in the array to trace later
            element[expandoEvent].push(callback);
        }
	};
    
    //use this method to trigger event bounded to element via html.bind
    //ele: element that user want to trigger event
    //name: event name
    this.trigger = function(ele, name){
        if(!ele){
            throw 'Element must be specified';
        }
        if(!name){
            throw 'Event name must be specified';
        }
        var expandoEvent = expando + name;
        //check if element's expando properties has value
        //if yes fire event, pass element
        if(ele[expandoEvent] instanceof Array && ele[expandoEvent].length > 0){
            for(var i = 0, j = ele[expandoEvent].length; i < j; i++){
                ele[expandoEvent][i].call(ele);
            }
        }
    }
    
    //remove every events bounded to element via html.bind
    //dispose the element from document
    //however because of javascript specification allow to keep a DOM node reference inside closure
    //so that the element would be never dispose if any user's closure code keep reference to that DOM node
    //NOTE: never keep DOM node reference inside closure if not necessary, use a query to get DOM node instead
	this.dispose = function(ele){
		this.unbindAll(ele);
        //remove the node from its parent (if its parent is not null
		if(ele.parentElement !== null){
			ele.parentElement.removeChild(ele);
        //if the node has node parent
        //set the node reference to null so that the node memory can be collected
		} else {
			ele = null;
		}
	};
	
	//this function is to avoid memory leak
    //remove all methods bounded to element via html.bind
	this.unbindAll = function(ele){
        if(ele === null || ele === undefined){
            throw 'Element to unbind all events must be specified';
        }
        var eventName;
        //loop through the expando list, because this list is limited
        //due to html.bind only add an item when html.bind is called
        //so performance is good now
        for(var e = 0, ej = expandoList.length; e < ej; e++){
            eventName = expandoList[e]; //get expando
            //check element's expando property has value
            //if yes, loop through methods assigned and unbind them all
            if(ele[eventName] instanceof Array && ele[eventName].length > 0){
                for(var i = 0, j = ele[eventName].length; i < j; i++){
                    _html.unbind(ele, eventName.slice(expandoLength), ele[eventName][i], false);
                }
                //clear element's expando property so that GC can collect memory
                ele[eventName] = null;
            }
        }
		
        //loop through element's children to unbind all events
        //this loop will run recursively
		if(ele !== null && ele.children.length){
			for(var child = 0; child < ele.children.length; child++){
				this.unbindAll(ele.children[child]);
			}
		}
	};
		
    //unbind element's event
    //element: element to unbind
    //name: event name
    //callback: listener function to unbind
    //bubble (optional, false): bubble event
	this.unbind = function(element, name, callback, bubble){
        if(!element){
            throw 'Element to unbind event must be specified';
        }
        if(!name){
            throw 'Event name must be specified';
        }
        //get element's expando property
        var expandoEvent = expando + name,
        //get index of the callback function in element's expando property
            index = _html.query.indexOf.call(element[expandoEvent], callback);
        //if methods has been assigned to expando then remove the method from that
        if(element[expandoEvent] instanceof Array && index >= 0){
            element[expandoEvent].splice(index, 1);
        }
        
        //detach event for IE
		if(element.detachEvent){
			element.detachEvent('on' + name, callback);
        //remove event listener, used for Chrome, Opera, Firefox, ...
		} else {
			element.removeEventListener(name, callback, bubble);
		}
	};
    
    //subscribe function to observable object
    //only subscribe to html.data object
    //throws no exception whenever object nor function is null
	this.subscribe = function(observer, updateFn){
		if(observer && observer.subscribe){
			observer.subscribe(updateFn);
		}
	};
    
    //unsubscribe function from observable object
    //only unsubscribe from html.data object
    //throws no exception whenever object nor function is null
	this.unsubscribe = function(observer, updateFn){
		if(observer && observer.subscribe){
			observer.unsubscribe(updateFn);
		}
	};
    
    //dispose DOM element that's no longer used
	this.disposable = function(ele, observer, update){
		if(ele === null || ele.parentElement === null){
            if(!observer || !update){
                throw 'Observer and listener must be specified';
            }
            //unsubscribe target for observer
			_html.unsubscribe(observer, update);
            //check if the element is not null but is parent is null
            //then dispose the element(unbindAll events and remove that element)
			if(ele !== null){
				_html.dispose(ele);
			}
		}
	};

    //this method will take a DOM, which user render HTML from
    //container (Element): container
	this.render = function (container){
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
	this.createElement = function(name){
		var ele = document.createElement(name);
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
        //parent (Element): node to remove from
        //index (number): index of item in the list
        //numOfElement (number): number of element that one item can render
        //We need numOfElement because we have no idea how many elements that renderer function will render,
        //by calculating start index and stop index in the list, we can remove correctly
        //the variable numOfElement will cause a redundant renderer function to be called
        //but append to a "tmp" Node, the "tmpNode" will be disposed after all
        //but it could lead to memory leak, the first need to handle memory leaking
		var removeChildList = function(parent, index, numOfElement){
            //calculating start index
			index = index*numOfElement;
            //from start index, remove numOfElement times, done
			for(var i = 0; i < numOfElement; i++){
                //before remove we should unbind all events
				_html.unbindAll(parent.children[index]);
				parent.removeChild(parent.children[index]);
			}
		}
        
        //this method will append all created nodes into correct position inside container
        //only use this when user want to add to any position but not the last
        //parent (Element): container to insert
        //tmpNode (Element): just tmpNode containing created elements from renderer
        //  the tmpNode will be remove after all
        //index (number): index of the item user want to insert
		var appendChildList = function(parent, tmpNode, index){
            //previous node mean the node right before previous item rendered
            //it could be br tag or whatever
			var previousNode = null;
            
            //check if renderer renders nothing
			if(tmpNode.children.length === 0){
				throw Exception('You must add at least one element');
			}
            
            //calculate index of previous node
            //e.g user want to add at 1, renderer renders 4 inputs
            //then index would be 4
			index = index*tmpNode.children.length;
			previousNode = parent.children[index];
            
            //if previousNode not found, then append all tmpNode children to the parent (aka container)
			if(!previousNode){
				while(tmpNode.children.length){
					parent.appendChild(tmpNode.children[0]);
				}
			}
            //if previousNode found, then insert all children of tmpNode before that node
			while(tmpNode.children.length){
				parent.insertBefore(tmpNode.children[0], previousNode);
			}
		};
		
        //return immediately if model not pass, do nothing
		if(!model || !model.length || !this.element) return;
        //save the container pointer to parent
		var parent = this.element;
        //initialize numOfElement
		var numOfElement = 0;
        //this method is used to get numOfElement
        //it calls renderer once, count child elements inside tmpNode
        //dispose tmpNode and return counter
		var getNumOfEle = function(){
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
		var update = function(items, item, index, action){
			switch(action){
				case 'push':
                    //render immediately the item, call renderer to do thing
					renderer.call(parent, item, items.length);
					break;
				case 'add':
                    //if user want to insert at the last
                    //render immediately the item, call renderer to do thing
					if(index === items.length - 1){
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
					while(parent.firstChild){
						parent.removeChild(parent.firstChild);
					}
                    //render it, call renderer to do thing
					for(var i = 0, j = items.length; i < j; i++){
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
    //set innerText to span
    //Firefox doesn't have innerText, so we only use innerHTM)
    //subscribe span to the observer
	this.span = function (observer) {
		var value = _html.getData(observer);           //get value of observer
		var span = this.createElement('span');         //create span element
		span.innerText = value;                        //set span text
		var updateFn = function(){                     //update function, only run when observer is from html.data
			span.innerText = _html.getData(observer);
		}
		this.subscribe(observer, updateFn);            //subscribe update function
		return this;
	}

    //create input element
	this.input = function (observer) {
		//var _oldVal;
		var input = this.createElement('input');      //create the input
		input.value = this.getData(observer);         //get value of observer
		if(observer instanceof Function) {            //check if observer is from html.data
			var change = function(e){
				var _newVal = this.value;
				if(observer.isComputed && !observer.isComputed() && input.type === 'text'){
					observer(_newVal);
				} else {
					observer.refresh();
				}
			};
			var updateFn = function(value){
				value = _html.getData(value);
				input.value = value;
				_html.disposable(input, observer, this);
			};
			this.subscribe(observer, updateFn);
			this.bind(input, 'change', change, false);
		}
		return this;
	};
    
    //this method is used to set value for an input
    //observer: type of html.data
    this.val = function(observer){
        var input = this.element;
        if(!input || !input.type){
            throw 'The element is not an input, please check current element';
        }
        var valueField;
        switch(input.type){
            case 'text':
            case 'hidden':
            case 'email':
            case 'number':
            case 'range':
            case 'color':
            case 'date':
            case 'datatime':
                valueField = 'value';
                break;
            case 'checkbox':
            case 'radio':
                valueField = 'checked';
                break;
            default:
                throw 'Unsupport input type value, please use another binding';
        }
		input[valueField] = this.getData(observer);
        if(observer instanceof Function) {
			var change = function(e){
				var _newVal = this.value; //this here is element that fire the event
				if(observer.isComputed && !observer.isComputed()){
					observer(_newVal);
				} else if(input.type === 'text') {
					observer.refresh();
				}
			};
			var updateFn = function(value){
				value = _html.getData(value);
                if(input.type === 'text'){
                    input.value = value;
                } else if(value === 'true' || value === true){
					chkBox.setAttribute('checked', 'checked');
					chkBox.checked = true;
				} else {
					chkBox.removeAttribute('checked');
					chkBox.checked = false;
				}
				_html.disposable(input, observer, this);
			};
			this.subscribe(observer, updateFn);
			this.bind(input, 'change', change, false);
		}
		return this;
    };
    
	this.innerHTML = function(text){
		this.element.innerHTML = text;
	};
	this.change = function (callback) {
		this.bind(this.element, 'change', function (e) {
			if(!callback) return;
			callback.call(this, e);
		}, false);
		return this;
	};
	this.click = function (callback, model) {
		this.bind(this.element, 'click', function (e) {
			e && e.preventDefault? e.preventDefault(): e.returnValue = false;
			callback.call(this, model, e);
		}, false);
		return this;
	};
	this.radio = function(name, observer){
		name = name || '';
		observer = observer || '';
		var radio = this.createElement('input');
		radio.name = name;
		radio.type = 'radio';
		
		var value = this.getData(observer);
		if(value === 'true' || value === true){
			radio.setAttribute('checked', 'checked');
			radio.checked = true;
		} else {
			radio.removeAttribute('checked');
			radio.checked = false;
		}
		
		if(observer instanceof Function){
			var update = function(value){
				value = _html.getData(value);
				if(value === 'true' || value === true){
					radio.setAttribute('checked', 'checked');
					radio.checked = true;
				} else {
					radio.removeAttribute('checked');
					radio.checked = false;
				}
			}
			this.subscribe(observer, update);
		}
		return this;
	}

	this.checkbox = function(observer){
		var chkBox = document.createElement('input');
		chkBox.type = 'checkbox';
		this.element.appendChild(chkBox);
		this.element = chkBox;
		var value = _html.getData(observer);
		if(value === 'true' || value === true){
			chkBox.setAttribute('checked', 'checked');
			chkBox.checked = true;
		} else {
			chkBox.removeAttribute('checked');
			chkBox.checked = false;
		}
		if(observer instanceof Function){
			this.change(function(ele, e){
				if(!(observer instanceof Function)) return;
				if(observer.isComputed && !observer.isComputed()){
					observer(this.checked === true);
				} else {
					chkBox.removeAttribute('checked');
				}
			}, false);
			var update = function(value){
				value = _html.getData(value);
				if(value === 'true' || value === true){
					chkBox.setAttribute('checked', 'checked');
					chkBox.checked = true;
				} else {
					chkBox.removeAttribute('checked');
					chkBox.checked = false;
				}
			}
			this.subscribe(observer, update);
		}
		return this;
	};

	this.button = function(text){
		var button = this.createElement('button');
		button.innerText = text;
		return this;
	};
	this.clss = function(observer){
		var element = this.element;
		var className = _html.getData(observer);
		this.element.setAttribute('class', className);
		
		this.subscribe(observer, function(value){
			element.setAttribute('class', value);
		});
		return this;
	};

	this.extend = function(des, src){
		for(var fn in src){
			if(src.hasOwnProperty(fn)){
				des[fn] = src[fn];
			}
		}
		return des;
	};
	this.h2 = function(text){
		var h2 = this.createElement('h2');
		h2.innerText = text;
		return this;
	};
	this.form = function(){
		this.createElement('form');
		return this;
	};
	this.id = function(id){
		this.element.id = id;
		return this;
	};
	this.attr = function(attr){
		for(var i in attr){
			this.element.setAttribute(i, attr[i]);
		}
		return this;
	};
	this.table = function(){
		this.createElement('table');
		return this;
	};
	this.thead = function(){
		this.createElement('thead');
		return this;
	};
	this.th = function(text){
		var th = this.createElement('th');
		th.innerText = text;
		return this;
	};
	this.tbody = function(){
		this.createElement('tbody');
		return this;
	};
	this.tr = function(){
		this.createElement('tr');
		return this;
	};
	this.td = function(){
		this.createElement('td');
		return this;
	};
	this.a = function(text, href){
		var a = this.createElement('a');
		a.innerText = text || '';
		a.href = href || '';
		return this;
	};
    
    //dropdown for simple select list, no optionGroup
    //list: list of data will display
    //current: current data selected
    //displayField (string): field to display text for option
    //valueField (string): field to get value for option
	this.dropdown = function(list, current, displayField, valueField){
		var currentValue = _html.getData(current);
		var select = this.createElement('select');
        //render options for the select tag
        //An option could be selected if its value equal to currentModel
		this.each(list, function(model){
			var value = typeof(valueField) === 'string'? model[valueField]: model;
            _html.render(this).option(model[displayField], value, model === currentValue).$();
		});
		
        //add change event to select tag
		this.change(function(event){
            //get current value of select in the list parameter
			var selectedObj = list[this.selectedIndex];
            
            //loop through the list to remove all selected attribute
            //if any option that is selected then set attribute selected again
            //and notify change (current is notifier)
			for(var i = 0, j = _html.getData(list).length; i < j; i++){
				this.children[i].removeAttribute('selected');
				if(i === this.selectedIndex){
					this.children[i].setAttribute('selected', 'selected');
					if(current instanceof Function){
						current(selectedObj);
					}
				}
			}
		});
        //return html object to facilitate fluent API
		return this;
	};
    
	this.refresh = this.f5 = function(){
		if(arguments.length){
			var viewModels = arguments,
				nodeName = this.element && this.element.nodeName,
				eventName = '';
			switch(nodeName){
				case 'BUTTON':
				case 'A':
				case 'INPUT':
					if(this.element.type === 'text'){
						eventName = 'change';
					} else {
						eventName = 'click';
					}
					break;
				default:
					eventName = 'change';
					break;
			}
			_html.bind(this.element, eventName, function(){
				for(var i = 0, j = viewModels.length; i < j; i++){
					_html.data.refresh(viewModels[i]);
				}
			});
		}
		return this;
	};
	this.select = function(observer){
		var select = this.createElement('select');
		return this;
	};
	this.option = function(text, value, selected){
		var option = this.createElement('option');
		value = _html.getData(value);
		if(typeof(value) == 'object'){
			option.__engineValue__ = value;
		} else {
			option.value = value;
		}
		option.innerText = _html.getData(text);
		if(_html.getData(selected)===true){
			option.setAttribute('selected', 'selected');
			option.selected = true;
		}
		
		var update = function(val){
			if(val === true){
				option.setAttribute('selected', 'selected');
				option.selected = true;
			} else {
				option.removeAttribute('selected');
				option.selected = false;
			}
		}
		_html.subscribe(selected, update);
		return this;
	};
	this.ul = function(){
		var ul = this.createElement('ul');
		return this;
	};
	this.li = function(){
		var li = this.createElement('li');
		return this;
	};
	this.empty = function(ele){
		ele = ele || this.element;
		//_html.unbindAll(ele);
		while(ele && ele.children.length){
			ele.removeChild(ele.lastChild);
		}
		return this;
	};
	this.css = function(observer){
		var ele = this.element;
		var value = _html.getData(observer);
		if(value){
			_html.extend(this.element.style, value);
		}
		var update = function(val){
			if(val){
				_html.extend(this.element.style, val);
			}
		}
		_html.subscribe(observer, update);
		return this;
	};
	this.visible = function(observer){
		var ele = this.element;
		var value = _html.getData(observer);
		
		var update = function(val){
			if(val){
				ele.style.display = '';
			} else {
				ele.style.display = 'none';
			}
		}
		update(value);
		this.subscribe(observer, update);
		return this;
	};

	this.data = function (data) {
		var _oldData = data instanceof Array? _html.query(data): data, targets = _html.query([]);
		var refresh = function(){
			if(targets.length > 0){
				//fire bounded element immediately
				for(var i = 0, j = targets.length; i < j; i++){
					targets[i].call(targets[i], _oldData);
				}
			}
		}
		var init = function (obj) {
			if (obj !== null && obj !== undefined) {
				if (_oldData !== obj){
					_oldData = null;
					_oldData = obj instanceof Array? _html.query(obj): obj;
					if(_oldData instanceof Array){
						for(var i = 0, j = targets.length; i < j; i++){
							targets[i].call(targets[i], _oldData, null, null, 'render');
						}
					} else {
						refresh();
					}
				}
			} else {
				return _oldData instanceof Function? _oldData(): _oldData;
			}
		};
		var ensureArray = function(obj){
			if(!(obj instanceof Array)){
				throw 'Observerd object is not an array, can\'t use this function';
			}
		};
		init['isComputed'] = function(){
			return _oldData instanceof Function;
		}
		init['add'] = function (obj, index) {
			ensureArray(_oldData);
			index = index === undefined? _oldData.length: index;
			_oldData.splice(index, 0, obj);
			if(targets.length > 0){
				//fire bounded element immediately
				for(var i = 0, j = targets.length; i < j; i++){
					targets[i].call(targets[i], _oldData, obj, index, 'add');
				}
			}
		};
		init['remove'] = function(item){
			ensureArray(_oldData);
			var index = _oldData.indexOf(item);
			this.removeAt(index);
		};
		init['removeAt'] = function (index) {
			ensureArray(_oldData);
			var deleted = _oldData[index];
			_oldData.splice(index, 1);
			if(targets.length > 0){
				//fire bounded element immediately
				for(var i = 0, j = targets.length; i < j; i++){
					targets[i].call(targets[i], _oldData, deleted, index, 'remove');
				}
			}
			
			//dispose the object and all reference including computed, observer, targets to avoid memory leak
			deleted = null;
		};
		init['pop'] = function () {
			ensureArray(_oldData);
			this.removeAt(_oldData.length - 1);
		};
		init['push'] = function (item) {
			ensureArray(_oldData);
			_oldData.push(item);
			for(var i = 0, j = targets.length; i < j; i++){
				targets[i].call(targets[i], _oldData, item, null, 'push');
			}
		};
		init['subscribe'] = function(updateFn) {
			targets.push(updateFn);
		};
		init['unsubscribe'] = function(updateFn) {
			var index = targets.indexOf(updateFn);
			targets.splice(index, 1);
		};
		init['targets'] = function(element) {
			return targets;
		};
		init['refresh'] = init['f5'] = refresh;
		init['silentSet'] = function(val){
			_oldData = val;
		};
		return init;
	};
    
	this.data.refresh = function(viewModel){
		for(var i in viewModel){
			if(viewModel[i].isComputed && viewModel[i].isComputed()){
				viewModel[i].refresh();
			}
		}
	};
}).call(html);