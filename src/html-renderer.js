(function (root, factory) {
    'use strict';
    /* CommonJS/NodeJs */
    if (typeof module === 'object' && typeof module.exports === 'object') module.exports = factory(root);
        /* AMD module */
    else if (typeof define === 'function' && define.amd) define(factory(root));
        /* Browser global */
    else root.html = factory(root);
}
(this || (0, eval)('this'), function (window) {
    
    function isIE () {
        var myNav = window.navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? window.parseInt(myNav.split('msie')[1]) : false;
    }
	var html = isIE() === 8 ? window.document : function (context) {
        element = context;
    },
	element = window.document.body,
	createElement = function (tag) {
		Object.defineProperty(html, tag, {
	        get: function () {
	        	var ele = document.createElement(tag);
	            element.appendChild(ele);
	            element = ele;
	            return html;
	        }
	    });
	    Object.defineProperty(html, '$' + tag, {
	        get: function () {
	            try {
	                if (element.nodeName.toLowerCase() === tag) {
	                    element = element.parentElement;
	                    return html;
	                }
	                while (element.nodeName.toLowerCase() !== tag) {
	                    // go to parent until an element matching current tag
	                    element = element.parentElement;
	                }
	                element = element.parentElement;
	            } catch (e) {
	                throw 'The parent element ' + tag + ' does not exist';
	            }
	            return html;
	        }
	    });
	};

	html.tags = ['div', 'a', 'i', 'table', 'tbody', 'thead', 'th', 'tr', 'td', 'tfoot', 'form', 'button', 'select', 'option',
	        'fieldset', 'label', 'legend', 'span', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'input'];

	for (var i = 0, j = html.tags.length; i < j; i++) {
		createElement(html.tags[i]);
	}

	Object.defineProperty(html, '$', {
	    get: function () {
	        element = element.parentElement;
	        return html;
	    }
	});

	Object.defineProperty(html, 'br', {
	    get: function () {
	        element.appendChild(document.createElement('br'));
	        return html;
	    }
	});

	Object.defineProperty(html, 'hr', {
	    get: function () {
	        element.appendChild(document.createElement('hr'));
	        return html;
	    }
	});

	html.on = html.bind = function (name, callback, bubble) {
		if (element.addEventListener) { //attach event for non IE
            element.addEventListener(name, callback, bubble);
        } else { //addEventListener for IE browsers
            element.attachEvent('on' + name, callback);
        }
		return html;
	};

	html.attr = function (name, value) {
		if (value) {
			element.setAttribute(name, value);
		} else {
			for (var i in name) {
				element.setAttribute(i, name[i]);
			}
		}
		return html;
	};

	html.addClass = function (className) {
		className = className.replace(/(^\s+)|(\s+$)/, '');
        if (className === '') return html;
        element.className += element.className === '' ? className : ' ' + className;
		return html;
	};

	html.each = function (arr, renderer) {
		var ele = element, length;
		if (Object.prototype.toString.call(arr) === '[object Array]') {
			length = arr.length;
		} else if (Object.prototype.toString.call(arr) === '[object Number]') {
			length = arr;
		}
		for (var i = 0; i < length; i++) {
			eleemnt = ele;
			renderer(arr[i], i);
		};
		return html;
	};
	
	html.text = function (text) {
		if (element.innerText !== undefined) {
			element.innerText = text;
		} else {
			element.innerHTML = text;
		}
		return html;
	};

	html.value = function (value) {
		element.value = value;
		return html;
	};

	html.context = function (ele) {
		element = ele;
		return html;
	};

	return html;
}));