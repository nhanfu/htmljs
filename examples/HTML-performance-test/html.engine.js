//notify change to computed
//dependency tracking
//public API to add new controls
//consider use string instead of function binding

//TODO: 
//1. finish basic binding: radio button, if binding, href, table, tr td, ..., serialize data to json
//2. unit test, inspect memory leaking, ajax loading for JS, CSS
//3. integrate with jQuery UI, jQuery mobile, unit test
//4. integrate with Backbone, knockout, Angular
//5. re-write jQuery controls with the framework(low priority)
//6. Add more features: routing, dependency injection(fluent api)

//modify Array prototype, fix for bastard IE
Array.prototype.indexOf = Array.prototype.indexOf || function(value){
    for ( var i = 0; i < this.length; i++ ) {
        if ( this[i] === value ) {
            return i;
        }
    }
    return -1;
};
var hEngine = HTML = {};
HTML.getData = function(fn){
	while(fn instanceof Function){
		fn = fn instanceof Function? fn(): fn;
	}
    return fn;
};
(function(){
    var cache = {};
    var removeAll = function(node){
        if(node.children.length > 0){
            while(node.children.length){
                removeAll(node.firstChild);
            }
        } else {
            if(node.parentElement !== null){
                node.parentElement.removeChild(node);
            } else {
                node = null;
            }
        }
    };
    HTML.bind = function(element, name, fn, bubble){
        if(element.attachEvent){
            element.attachEvent('on' + name, fn);
        } else {
            element.addEventListener(name, fn, bubble);
        }
        
        var key = cache[element];
        if(!key || !key[name]){
            cache[element] = {};
            cache[element][name] = HTML.data.query([]);
            cache[element][name].push(fn);
        }
    };
    HTML.dispose = function(ele){
        this.unbindAll(ele);
        if(ele.parentElement !== null){
            ele.parentElement.removeChild(ele);
        } else {
            ele = null;
        }
    };
    
    HTML.unbindAll = function(ele){
        var key = cache[ele];
        if(key){
            for(var eventName in key){
                while(key[eventName].length){
                    HTML.unbind(ele, eventName, key[eventName][0], false);
                    key[eventName].removeAt(0);
                }
                delete key[eventName];
            }
        }
        
        if(ele !== null && ele.children.length){
            for(var child = 0; child < ele.children.length; child++){
                this.unbindAll(ele.children[child]);
            }
        }
    };
})();
HTML.unbind = function(element, name, fn, bubble){
    if(element.detachEvent){
        element.detachEvent('on' + name, fn);
    } else {
        element.removeEventListener(name, fn, bubble);
    }
};
HTML.subscribe = function(observer, updateFn){
    if(observer && observer.subscribe){
        observer.subscribe(updateFn);
    }
};
HTML.unsubscribe = function(observer, updateFn){
    if(observer && observer.subscribe){
        observer.unsubscribe(updateFn);
    }
};
HTML.disposable = function(ele, observer, update){
    if(ele === null || ele.parentElement === null){
        HTML.unsubscribe(observer, update);
        if(ele !== null){
            HTML.dispose(ele);
        }
    }
};

HTML.render = function (container){
	var self = this;
	self.element = container;
	//HTML.fn.extend(self, HTML.fn);
			
	var removeChildList = function(parent, index, numOfElement){
		index = index*numOfElement;
		for(var i = 0; i < numOfElement; i++){
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
	
	var createElement = self.createElement = function(name){
		var ele = document.createElement(name);
		self.element.appendChild(ele);
		self.element = ele;
		return self.element; 
	};
	
	self.div = function () {
		var ele = createElement('div');
		return self;
	};

	self.span = function (observer) {
		var value = HTML.getData(observer);
		var span = createElement('span');
		span.innerText = value;
		var updateFn = function(){
			span.innerText = HTML.getData(observer);
		}
		HTML.subscribe(observer, updateFn);
		return self;
	}

	self.input = function (observer) {
		var _oldVal;
		var input = createElement('input');
		input.value = HTML.getData(observer);
		var change = function(e){
			if(!(observer instanceof Function)) return;
			var _newVal = (e.srcElement || e.target).value;
			if(observer.isComputed && !observer.isComputed() && input.type === 'text'){
				observer(_newVal);
			} else {
				observer.refresh();
			}
		};
		var updateFn = function(value){
			value = HTML.getData(value);
			input.value = value;
			HTML.disposable(input, observer, this);
		};
		HTML.subscribe(observer, updateFn);
		HTML.bind(input, 'change', change, false);
		return self;
	};

	self.change = function (callback) {
		HTML.bind(self.element, 'change', function (e) {
            if(!callback) return;
			callback.call(self, e.srcElement || e.target, e);
		}, false);
		return self;
	};
	self.click = function (callback, model) {
		HTML.bind(self.element, 'click', function (e) {
			e.preventDefault? e.preventDefault(): e.returnValue = false;
			var ele = e.srcElement || e.target;
			callback.call(ele, model, e);
		}, false);
		return self;
	};

	self.each = function (model, callback) {
		if(!model || !model.length || !this.element) return;
		var parent = self.element;
		var numOfElement = 0;
		var getNumOfEle = function(){
			var tmpNode = document.createElement('tmp');
			callback.call(tmpNode, model()[0], 0);
			var ret = tmpNode.children.length;
            self.dispose(tmpNode);
			return ret;
		};
		for (var i = 0, j = HTML.getData(model).length, MODEL = HTML.getData(model); i < j; i++) {
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
					self.dispose(tmpNode);
					break;
				case 'remove':
					numOfElement = numOfElement || getNumOfEle();
					removeChildList(parent, index, numOfElement);
					break;
				case 'render':
                    HTML.unbindAll(parent);
                    while(parent.firstChild){
                        parent.removeChild(parent.firstChild);
                    }
					for(var i = 0, j = items.length; i < j; i++){
						callback.call(parent, items[i], i);
					}
					break;
			}
		}
		HTML.subscribe(model, update);
		//tmpNode = null;
		return self;
	};

	self.br = function () {
		var br = createElement('br');
		return self.$();
	};
	self.$ = function () {
		self.element = self.element.parentElement;
		return self;
	};

	return self;
};

HTML.fn = {};
HTML.radio = function(name, observer){
	name = name || '';
	observer = observer || '';
    var radio = this.createElement('input');
    radio.name = name;
    radio.type = 'radio';
	
	var value = HTML.getData(observer);
    if(value === 'true' || value === true){
        radio.setAttribute('checked', 'checked');
        radio.checked = true;
    } else {
        radio.removeAttribute('checked');
        radio.checked = false;
    }
	
	var update = function(value){
		value = HTML.getData(value);
		if(value === 'true' || value === true){
			radio.setAttribute('checked', 'checked');
			radio.checked = true;
		} else {
			radio.removeAttribute('checked');
			radio.checked = false;
		}
	}
	HTML.subscribe(observer, update);
    return this;
}

HTML.$$ = function(){
	this.element = null;
};
HTML.checkbox = function(valueFn){
	var self = this,
		chkBox = document.createElement('input'),
		observer = valueFn;
    chkBox.type = 'checkbox';
    self.element.appendChild(chkBox);
    self.element = chkBox;
    var value = HTML.getData(observer);
    if(value === 'true' || value === true){
        chkBox.setAttribute('checked', 'checked');
        chkBox.checked = true;
    } else {
        chkBox.removeAttribute('checked');
        chkBox.checked = false;
    }
	self.change(function(ele, e){
		if(!(observer instanceof Function)) return;
		if(observer.isComputed && !observer.isComputed()){
			observer(ele.checked === true);
		} else {
            chkBox.removeAttribute('checked');
        }
	}, false);
	var update = function(value){
		value = HTML.getData(value);
		if(value === 'true' || value === true){
			chkBox.setAttribute('checked', 'checked');
			chkBox.checked = true;
		} else {
			chkBox.removeAttribute('checked');
			chkBox.checked = false;
		}
	}
	HTML.subscribe(observer, update);
    return this;
};

HTML.button = function(text){
	var button = this.createElement('button');
	button.innerText = text;
	return this;
};
HTML.classes = function(observer){
	var element = this.element;
	var className = HTML.getData(observer);
	this.element.setAttribute('class', className);
	
	var update = function(value){
		element.setAttribute('class', value);
	}
	HTML.subscribe(observer, update);
	return this;
};

HTML.fn.extend = function(des, src){
    for(var fn in src){
        if(src.hasOwnProperty(fn)){
            des[fn] = src[fn];
        }
    }
    return des;
};
HTML.h2 = function(text){
    var h2 = this.createElement('h2');
	h2.innerText = text;
    return this;
};
HTML.form = function(){
    this.createElement('form');
    return this;
};
HTML.id = function(id){
    this.element.id = id;
    return this;
};
HTML.attr = function(attr){
    for(var i in attr){
		this.element.setAttribute(i, attr[i]);
	}
	return this;
};
HTML.table = function(){
    this.createElement('table');
    return this;
};
HTML.thead = function(){
    this.createElement('thead');
    return this;
};
HTML.th = function(text){
    var th = this.createElement('th');
	th.innerText = text;
    return this;
};
HTML.tbody = function(){
    this.createElement('tbody');
    return this;
};
HTML.tr = function(){
    this.createElement('tr');
    return this;
};
HTML.td = function(){
    this.createElement('td');
    return this;
};
HTML.a = function(text, href){
    var a = this.createElement('a');
    a.innerText = text || '';
    a.href = href || '';
    return this;
};
HTML.dropdown = function(list, current, displayField, value){
	var currentValue = HTML.getData(current);
    var select = this.createElement('select');
	this.each(list, function(model){
		value = typeof(value) === 'string'? model[value]: model;
		if(model === currentValue){
			HTML.render(this).option(model[displayField], value).attr({selected: 'selected'}).$();
		} else {
			HTML.render(this).option(model[displayField], value).$();
		}
	});
	
	this.change(function(ele, event){
		var selectedObj = list[ele.selectedIndex];
		for(var i = 0, j = HTML.getData(list).length; i < j; i++){
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
HTML.refreshChange = function(){
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
		HTML.bind(this.element, eventName, function(){
			for(var i = 0, j = viewModels.length; i < j; i++){
				HTML.data.refresh(viewModels[i]);
			}
		});
	}
	return this;
};
HTML.select = function(observer){
    var select = this.createElement('select');
    return this;
};
HTML.option = function(text, value){
    var option = this.createElement('option');
    value = HTML.getData(value);
	if(typeof(value) == 'object'){
		option.__engineValue__ = value;
	} else {
		option.value = value;
	}
    option.innerText = HTML.getData(text);
    return this;
};

HTML.empty = function(ele){
    ele = ele || this.element;
    HTML.unbindAll(ele);
    while(ele && ele.children.length){
        ele.removeChild(ele.lastChild);
    }
    return this;
};
HTML.css = function(observer){
    var ele = this.element;
    var value = HTML.getData(observer);
    if(value){
        HTML.fn.extend(this.element.style, value);
    }
    var update = function(val){
        if(val){
            HTML.fn.extend(this.element.style, val);
        }
    }
    HTML.subscribe(observer, update);
};
HTML.visible = function(observer){
    var ele = this.element;
    var value = HTML.getData(observer);
    
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

HTML.data = function (data) {
    var _oldData = data, targets = [];
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
				_oldData = obj;
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
		targets[0].call(targets[0], _oldData, item, null, 'push');
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
    return init;
};
HTML.getData = function(fn){
	while(fn instanceof Function){
		fn = fn();
	}
	return fn;
};
HTML.data.refresh = function(viewModel){
	for(var i in viewModel){
		if(viewModel[i].isComputed && viewModel[i].isComputed()){
			viewModel[i].refresh();
		}
	}
};

HTML.data.query = function () {
    var tmp_array = {};
    tmp_array = (Array.apply(tmp_array, arguments[0] || []) || tmp_array);
    //Now extend tmp_array
	HTML.fn.extend(tmp_array, HTML.data.query.fn);
    return tmp_array;
};

HTML.data.query.fn = HTML.data.query.prototype = {
    each: function (action) {
        for (var i = 0, j = this.length; i < j; i++)
            action(this[i], i);
    },

    add: Array.prototype.push,

    select: function (mapping) {
        var result = [];
        for (var i = 0; i < this.length; i++)
            result.push(mapping(this[i]));
        return HTML.data.query(result);
    },

    where: function (predicate) {
        var ret = [];
        for (var i = 0; i < this.length; i++)
            if (predicate(this[i])) {
                //debugger;
                ret.push(this[i]);
            }
        return HTML.data.query(ret);
    },

    reduce: function (iterator, init, context) {
        var result = typeof (init) != 'undefined' && init != null ? init : [];
        for (var i = 0, j = this.length; i < j; i++) {
            result = iterator.call(context, result, this[i]);
        }
        return result;
    },

    reduceRight: function (iterator, init, context) {
        var result = typeof (init) != 'undefined' && init != null ? init : [];
        for (var i = this.length - 1; i >= 0; i--) {
            result = iterator.call(context, result, this[i]);
        }
        return result;
    },
    find: function (bestFun, mapper) {
        var arr = mapper ? this.select(mapper) : this;
        return arr.reduce(function (best, current) {
            return best === bestFun(best, current) ? best : current;
        }, arr[0]);
    },
    first: function (predicate, predicateOwner) {
        for (var i = 0, j = this.length; i < j; i++)
            if (predicate.call(predicateOwner, this[i]))
                return this[i];
        throw 'Can\'t find any element matches';
    },

    firstOrDefault: function (predicate, predicateOwner) {
        for (var i = 0, j = this.length; i < j; i++)
            if (predicate.call(predicateOwner, this[i]))
                return this[i];
        return null;
    },

    indexOf: function (item) {
        if (typeof Array.prototype.indexOf == "function")
            return Array.prototype.indexOf.call(this, item);
        for (var i = 0, j = this.length; i < j; i++)
            if (this[i] === item)
                return i;
        return -1;
    },

    remove: function (itemToRemove) {
        var index = this.indexOf(itemToRemove);
        if (index >= 0 && index < this.length)
            this.splice(index, 1);
    },

    removeAt: function (index) {
        if (index >= 0 && index < this.length)
            this.splice(index, 1);
    },

    swap: function (fromIndex, toIndex) {
        if (fromIndex >= 0 && fromIndex < this.length && toIndex >= 0 && toIndex < this.length && fromIndex != toIndex) {
            var tmp = this[fromIndex];
            this[fromIndex] = this[toIndex];
            this[toIndex] = tmp;
        }
    }
};

HTML.data.query.fn.addRange = function(items){
	return HTML.data.query(Array.prototype.concat.call(this, items));
};