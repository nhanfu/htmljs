// HTML engine JavaScript library
// (c) Nguyen Ta An Nhan - https://github.com/nhanaswigs/HTMLjs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

//TODO: 
//1. serialize data to json
//2. unit test, inspect memory leaking, ajax loading for JS, CSS
//3. integrate with jQuery UI, jQuery mobile, unit test
//4. integrate with Backbone, knockout, Angular
//5. re-write jQuery controls with the framework(low priority)
//6. Add more features: routing, dependency injection(fluent api, low priority)

var html = {};
(function(){
    var _html = this;
    this.query = function () {
		var tmp_array = {};
		tmp_array = (Array.apply(tmp_array, arguments[0] || []) || tmp_array);
		//Now extend tmp_array
		_html.extend(tmp_array, _html.query);
		return tmp_array;
	};
	
	(function(){
		this.each = function (action) {
			for (var i = 0, j = this.length; i < j; i++)
				action(this[i], i);
		}

		this.add = Array.prototype.push;

		this.select = function (mapping) {
			var result = [];
			for (var i = 0; i < this.length; i++)
				result.push(mapping(this[i]));
			return _html.query(result);
		}

		this.where = function (predicate) {
			var ret = [];
			for (var i = 0; i < this.length; i++)
				if (predicate(this[i])) {
					//debugger;
					ret.push(this[i]);
				}
			return _html.query(ret);
		}

		this.reduce = function (iterator, init, context) {
			var result = typeof (init) != 'undefined' && init != null ? init : [];
			for (var i = 0, j = this.length; i < j; i++) {
				result = iterator.call(context, result, this[i]);
			}
			return result;
		}

		this.reduceRight = function (iterator, init, context) {
			var result = typeof (init) != 'undefined' && init != null ? init : [];
			for (var i = this.length - 1; i >= 0; i--) {
				result = iterator.call(context, result, this[i]);
			}
			return result;
		}
		
		this.find = function (bestFun, mapper) {
			var arr = mapper ? this.select(mapper) : this;
			return arr.reduce(function (best, current) {
				return best === bestFun(best, current) ? best : current;
			}, arr[0]);
		}
		
		this.first = function (predicate, predicateOwner) {
			for (var i = 0, j = this.length; i < j; i++)
				if (predicate.call(predicateOwner, this[i]))
					return this[i];
			throw 'Can\'t find any element matches';
		}

		this.firstOrDefault = function (predicate, predicateOwner) {
			for (var i = 0, j = this.length; i < j; i++)
				if (predicate.call(predicateOwner, this[i]))
					return this[i];
			return null;
		}

		this.indexOf = function (item) {
			if (typeof Array.prototype.indexOf == "function")
				return Array.prototype.indexOf.call(this, item);
			for (var i = 0, j = this.length; i < j; i++)
				if (this[i] === item)
					return i;
			return -1;
		}

		this.remove = function (itemToRemove) {
			var index = this.indexOf(itemToRemove);
			if (index >= 0 && index < this.length)
				this.splice(index, 1);
		}

		this.removeAt = function (index) {
			if (index >= 0 && index < this.length)
				this.splice(index, 1);
		}

		this.swap = function (fromIndex, toIndex) {
			if (fromIndex >= 0 && fromIndex < this.length && toIndex >= 0 && toIndex < this.length && fromIndex != toIndex) {
				var tmp = this[fromIndex];
				this[fromIndex] = this[toIndex];
				this[toIndex] = tmp;
			}
		}
	}).call(this.query);

	this.query.addRange = function(items){
		return _html.query(Array.prototype.concat.call(this, items));
	};
    
    var expando = '__engine__events__',
        expandoLength = expando.length,
        expandoList = [];
    
	this.getData = function(data){
		while(data instanceof Function){
			data = data instanceof Function? data(): data;
		}
		return data;
	};
	
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
		if(element.attachEvent){
			element.attachEvent('on' + name, callback);
		} else {
			element.addEventListener(name, callback, bubble);
		}
        
        var expandoEvent = expando + name;
        if(expandoList.indexOf(expandoEvent) < 0){
            expandoList.push(expandoEvent);
            element[expandoEvent] = [];
            element[expandoEvent].push(callback);
        } else {
            if(element[expandoEvent] instanceof Array){
                element[expandoEvent].push(callback);
            } else {
                element[expandoEvent] = [];
                element[expandoEvent].push(callback);
            }
        }
	};
    
    this.trigger = function(ele, name){
        var expandoEvent = expando + name;
        if(ele[expandoEvent] instanceof Array){
            for(var i = 0, j = ele[expandoEvent].length; i < j; i++){
                ele[expandoEvent][i].call(ele);
            }
        }
    }
    
	this.dispose = function(ele){
		this.unbindAll(ele);
		if(ele.parentElement !== null){
			ele.parentElement.removeChild(ele);
		} else {
			ele = null;
		}
	};
	
	//this function is to avoid memory leak
	this.unbindAll = function(ele){
        if(ele === null || ele === undefined){
            throw 'Element to unbind all events must be specified';
        }
        var eventName;
        for(var e = 0, ej = expandoList.length; e < ej; e++){
            eventName = expandoList[e];
            if(ele[eventName] instanceof Array){
                for(var i = 0, j = ele[eventName].length; i < j; i++){
                    _html.unbind(ele, eventName.slice(expandoLength), ele[eventName][i], false);
                }
                ele[eventName] = null;
            }
        }
		
		if(ele !== null && ele.children.length){
			for(var child = 0; child < ele.children.length; child++){
				this.unbindAll(ele.children[child]);
			}
		}
	};
		
	this.unbind = function(element, name, callback, bubble){
		if(element.detachEvent){
			element.detachEvent('on' + name, callback);
		} else {
			element.removeEventListener(name, callback, bubble);
		}
	};
	this.subscribe = function(observer, updateFn){
		if(observer && observer.subscribe){
			observer.subscribe(updateFn);
		}
	};
	this.unsubscribe = function(observer, updateFn){
		if(observer && observer.subscribe){
			observer.unsubscribe(updateFn);
		}
	};
	this.disposable = function(ele, observer, update){
		if(ele === null || ele.parentElement === null){
			_html.unsubscribe(observer, update);
			if(ele !== null){
				_html.dispose(ele);
			}
		}
	};

	this.render = function (container){
		this.element = container;		
		return this;
	};
	this.createElement = function(name){
		var ele = document.createElement(name);
		this.element.appendChild(ele);
		this.element = ele;
		return this.element; 
	};
	this.each = function (model, callback) {
		var removeChildList = function(parent, index, numOfElement){
			index = index*numOfElement;
			for(var i = 0; i < numOfElement; i++){
				_html.unbindAll(parent.children[index]);
				parent.removeChild(parent.children[index]);
			}
		}
		var appendChildList = function(parent, tmpNode, index){
			var previousNode = null;
			if(tmpNode.children.length === 0){
				throw Exception('You must add at least one item');
			}
			var moveNode = function(){
				while(tmpNode.children.length){
					parent.appendChild(tmpNode.children[0]);
				}
				return;
			}
			if(index === null || index === undefined || (index === 0 && parent.children.length === 0)){
				moveNode();
			}
			if(index === 0 && parent.children.length){
				previousNode = parent.children[0];
			} else if(parent.children.length === 0){
				throw 'Invalid index to insert';
			}
			index = index*tmpNode.children.length;
			previousNode = parent.children[index];
			if(!previousNode){
				moveNode();
			}
			while(tmpNode.children.length){
				parent.insertBefore(tmpNode.children[0], previousNode);
			}
		};
		
		if(!model || !model.length || !this.element) return;
		var parent = this.element;
		var numOfElement = 0;
		var getNumOfEle = function(){
			var tmpNode = document.createElement('tmp');
			callback.call(tmpNode, model()[0], 0);
			var ret = tmpNode.children.length;
			_html.dispose(tmpNode);
			return ret;
		};
		for (var i = 0, MODEL = _html.getData(model), j = MODEL.length; i < j; i++) {
			callback.call(parent, MODEL[i], i);
		}
		var update = function(items, item, index, action){
			switch(action){
				case 'push':
					callback.call(parent, item, items.length);
					break;
				case 'add':
					if(index === items.length - 1){
						callback.call(parent, item, index);
						return;
					}
					var tmpNode = document.createElement('tmp');
					callback.call(tmpNode, item, index);
					appendChildList(parent, tmpNode, index);
					_html.dispose(tmpNode);
					break;
				case 'remove':
					numOfElement = numOfElement || getNumOfEle();
					removeChildList(parent, index, numOfElement);
					break;
				case 'render':
					_html.unbindAll(parent);
					while(parent.firstChild){
						parent.removeChild(parent.firstChild);
					}
					for(var i = 0, j = items.length; i < j; i++){
						callback.call(parent, items[i], i);
					}
					break;
			}
		}
		this.subscribe(model, update);
		return this;
	};
		
	this.br = function () {
		var br = this.createElement('br');
		return this.$();
	};
	
	this.$ = function () {
		this.element = this.element.parentElement;
		return this;
	};
	
	this.$$ = function () {
		return this.element;
	};
	
	this.div = function () {
		var ele = this.createElement('div');
		return this;
	};
	this.i = function () {
		var ele = this.createElement('i');
		return this;
	};
	this.span = function (observer) {
		var value = _html.getData(observer);
		var span = this.createElement('span');
		span.innerText = value;
		var updateFn = function(){
			span.innerText = _html.getData(observer);
		}
		this.subscribe(observer, updateFn);
		return this;
	}

	this.input = function (observer) {
		var _oldVal;
		var input = this.createElement('input');
		input.value = this.getData(observer);
		if(observer instanceof Function) {
			var change = function(e){
				var _newVal = (e.srcElement || e.target).value;
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
	this.innerHTML = function(text){
		this.element.innerHTML = text;
	};
	this.change = function (callback) {
		this.bind(this.element, 'change', function (e) {
			if(!callback) return;
			callback.call(this.element, e.srcElement || e.target, e);
		}, false);
		return this;
	};
	this.click = function (callback, model) {
		this.bind(this.element, 'click', function (e) {
			e.preventDefault? e.preventDefault(): e.returnValue = false;
			var ele = e.srcElement || e.target;
			callback.call(ele, model, e);
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
					observer(ele.checked === true);
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
	this.dropdown = function(list, current, displayField, value){
		var currentValue = _html.getData(current);
		var select = this.createElement('select');
		this.each(list, function(model){
			value = typeof(value) === 'string'? model[value]: model;
			if(model === currentValue){
				_html.render(this).option(model[displayField], value).attr({selected: 'selected'}).$();
			} else {
				_html.render(this).option(model[displayField], value).$();
			}
		});
		
		this.change(function(ele, event){
			var selectedObj = list[ele.selectedIndex];
			for(var i = 0, j = _html.getData(list).length; i < j; i++){
				ele.removeAttribute('selected');
				if(i === ele.selectedIndex){
					ele.setAttribute('selected', 'selected');
					if(current instanceof Function){
						current(selectedObj);
					}
				}
			}
		});
		return this;
	};
	this.refreshChange = this.f5 = function(){
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
				return _oldData;
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
		init['refresh'] = refresh;
		init['silentSet'] = function(val){
			_oldData = val;
		};
		return init;
	};
	this.getData = function(fn){
		while(fn instanceof Function){
			fn = fn();
		}
		return fn;
	};
	this.data.refresh = function(viewModel){
		for(var i in viewModel){
			if(viewModel[i].isComputed && viewModel[i].isComputed()){
				viewModel[i].refresh();
			}
		}
	};
}).call(html);