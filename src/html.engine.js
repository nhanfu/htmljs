// HTML engine JavaScript library
// (c) Nguyen Ta An Nhan - http://nhanfu.github.io/htmljs/api/index.html
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

/* jshint node: true */
;(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && typeof module.exports === 'object') {
    /* CommonJS/NodeJs */
    module.exports = factory(root);
  } else if (typeof root.define === 'function') {
    /* AMD module */
    root.define(factory(root));
  } else {
    /* Browser global */
    root.html = factory(root);
  }
} (this, function (window) {
  'use strict';

  var ctx = null,
    focusingEle = null,
    document = window.document,
    isString = function (x) { return typeof x === 'string'; },
    trimNative = String.prototype.trim,
    trim = function (str) {
      return trimNative && trimNative.call(str) || str.replace(/^\s+|\s+$/, '');
    };

  /**
   * @namespace html
   */
  var html = window.html = function html(context, rootNode) {
    if (typeof context === 'string') {
      rootNode = rootNode || document;
      context = rootNode.querySelector(context);
    } else if (typeof context === 'function') {
      html.ready(context);
    }
    ctx = context;
    return html;
  };

  /**
   * Find a child element of the current context using a selector
   * @memberof html
   * @param {String} selector - String selector or an element
   */
  html.find = function (selector) {
    if (typeof selector === 'string') {
      ctx = ctx.querySelector(selector);
    }
    return html;
  };

  html.config = {
    allowDuplicateScripts: false
  };

  Object.defineProperty(html, 'context', {
    /**
     * HtmlJs context
     * @example
     * html('#someContainer');
     * html.context; // => <div id="someContainer"></div>
     * @property {HTMLElement} context - Current selected element of HtmlJs
     * @memberof html
     * @name context
     */
    get: function () {
      return ctx;
    }
  });

  /**
   * Extend an object by another object's properties
   * @memberof html
   * @param {Object} destination - Destination object
   * @param {Object} source - Source object
   */
  html.extend = function (destination, source) {
    for (var i in source) {
      if (source.hasOwnProperty(i)) {
        destination[i] = source[i];
      }
    }
  };

  /**
   * Unwrap data from observable object
   * (duplicate from html.observable for standalone usage here)
   * @param  {html.observable} observableObj - Observable object to unwrap
   * @return {Object} Underlying data
   */
  html.unwrapData = function unwrapData(obj) {
    var res = obj;
    if (res != null && res.subscribe) {
      res = res.data;
    }
    return res;
  };

  /**
   * Clear all DOM nodes within context element
   * @example
   * html(document.body).empty();
   * @memberof html
   */
  html.empty = function () {
    if (ctx == null) {
      throw 'Expect a context to execute this function. Please query an element first.';
    }
    ctx.innerHTML = '';
    return this;
  };

  var tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'object', 'ol', 'ptgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video'];

  /**
   * Define all HTML5 tags
   * @param {String} tag Tag name
   */
  function defineTag(tag) {
    Object.defineProperty(html, tag, {
      /**
       * Render DOM element.
       * Append to the html context if available, otherwise create an in-memory element without parent <br /><br />
       * - All available tag names <br />
       * 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'object', 'ol', 'ptgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video'
       * @see http://www.w3schools.com/tags/
       * @memberof html
       * @property {Function} html - For fluent API
       * @name HTML tags
       */
      get: function () {
        // Create an element with tag name
        var ele = document.createElement(tag);

        // If the context is null,
        if (ctx == null) {
          // Set the context to be the created element
          ctx = ele;
        } else {
          // Append the created element as a child of context
          ctx.appendChild(ele);
          // set the context to be the created element
          ctx = ele;
        }

        // Return html for fluent Api
        return html;
      }
    });
  }

  // Loop through all tags and create basic components from each
  for (var i = 0, j = tags.length; i < j; i++) {
    defineTag(tags[i]);
  }

  /**
   * End tag symbol <br />
   * This method doesn't create any element but set the context HtmlJs to its parent element.
   * You can imagine this method like ending tag in HTML
   * @example
   * html(document.body).div.attr({id: 'container'}) // render a DIV tag with id "container"
   *   .h1.text('h1 element').$  // render h1, append to #container, set the context to parent of h1 - #container
   *   .h2.text('h2 element').$  // render h2, append to #container, also set the context to parent of h2 - #container
   * @example <caption>Alternative code</caption>
   * html(document.body).div.attr({id: '#container'});
   * html('#container').h1.text('h1 element');
   * html('#container').h2.text('h2 element');
   * @memberof html
   * @property {Function} html - For fluent API
   * @name Ending symbol
   */
  Object.defineProperty(html, '$', {
    get: function () {
      if (ctx != null && ctx.parentElement != null) {
        ctx = ctx.parentElement;
      }
      return html;
    }
  });

  // Define auto closing tag 'br' and 'hr'
  ['hr', 'br'].forEach(function (tag) {
    Object.defineProperty(html, tag, {
      /**
       * Auto ending elements. Create BR/HR element and append to the current context of HtmlJs
       * @example
       * html(document.body)
       *     .button.text('Add new record')
       *     .br
       *     .button('Delete selected record');
       * @memberof html
       * @property {Function} html - For fluent API
       * @name hr/br
       */
      get: function () {
        ctx.appendChild(document.createElement(tag));
        return html;
      }
    });
  });

  // All event of HTML5 specification
  var events = ['click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover',
    'mouseout', 'mouseup', 'keydown', 'keypress', 'keyup', 'abort', 'beforeunload', 'error', 'hashchange', 'load', 'resize',
    'scroll', 'unload', 'blur', 'change', 'input', 'focus', 'focusin', 'focusout', 'inputting', 'invalid', 'reset', 'search',
    'select', 'submit', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop', 'copy', 'cut', 'paste',
    'afterprint', 'beforeprint', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 'loadeddata',
    'loadedmetadata', 'loadstart', 'pause', 'play', 'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled',
    'suspend', 'timeupdate', 'volumechange', 'waiting', 'animationend', 'animationiteration', 'animationstart', 'transitionend',
    'message', 'online', 'offline', 'popstate', 'show', 'storage', 'toggle', 'wheel', 'compositionend', 'compositionstart', 'DOMContentLoaded'];

  // Loop through all event names of HTML5 specs
  // Create event binding function after html namespace
  // For example html.onClick
  events.forEach(function (eventName) {
    /**
     * Binding event to the context element.
     * HtmlJs gives you all possible events in HTML DOM events, you can bind events with ease.
     * The framework will handle for you cross browser binding issues.
     * However because some events are new in HTML5, so be careful when working with them, they can't run in some older browsers.
     * List of all available events.
     * - **Mouse events**
     * click, contextmenu, dblclick, mousedown, mouseenter, mouseleave, mousemove, mouseover, mouseout, mouseup
     * - **Key events**
     * keydown, keypress, keyup
     * - **Frame/object events**
     * abort, beforeunload, error, hashchange, load, resize, scroll, unload
     * - **Form events**
     * blur, change, focus, focusin, focusout, inputting, invalid, reset, search, select, submit
     * - **Drag events**
     * drag, dragend, dragenter, dragleave, dragover, dragstart, drop
     * - **Clipboard events**
     * copy, cut, paste
     * - **Print events**
     * afterprint, beforeprint
     * - **Media events events**
     * canplay, canplaythrough, durationchange, emptied, ended, error, loadeddata, loadedmetadata, loadstart, pause, play, playing, progress, ratechange, seeked, seeking, stalled, suspend, timeupdate, volumechange, waiting
     * - **Animation events**
     * animationend, animationiteration, animationstart
     * - **Transition events**
     * transitionend
     * - **Misc events**
     * message, online, offline, popstate, show, storage, toggle, wheel
     * - **Others events**
     * copy, cut, paste
     * @example
     * var clickCallback = function(e, model) {
     *     console.log(model);
     * };
     * html(document.body).button.text('Test click event with model')
     *    .onClick(clickCallback, {username: 'sa', password: '123456'});
     * @memberof html
     * @name Events
     * @param {Function} [eventListener] - Event listener
     * @param {Function} [model] - Model to pass into event listener
     * @param {Boolean} [useCapture = false] - Event capture phase, default is bubble phase
     * @return {Function} html
     */
    html['on' + eventName[0].toUpperCase() + eventName.slice(1)] = function (eventListener, model, useCapture) {
      if (ctx == null) {
        throw 'Expect a context to bind event. Please query an element first.';
      }

      // If eventListener is null
      if (eventListener == null) {
        // Trigger the event
        html.trigger(eventName);
      } else {
        // Binding eventHanlder
        ctx.addEventListener(eventName, function (e) {
          // Let src be the element that triggers event
          var src = e.srcElement || e.target;

          // Set focusingEle be the element that trigger event,
          // to avoid itself from subscriber
          focusingEle = src;

          // Calling eventHandler
          eventListener.call(src, e, model);
        }, useCapture);
      }
      return html;
    };
  });

  /**
   * Trigger an event of a DOM element
   * @example
   * var clickCallback = function(e, model) {
   *     console.log(model);
   * };
   * html(document.body).button.text('Test click event with model')
   *     .attr({id: 'testTrigger')}.onClick(clickCallback, {username: 'sa', password: '123456'});
   * html('#testTrigger').trigger('click');
   * @memberof html
   * @param {String} eventName - event of a DOM to trigger
   * @return {Function} html - For fluent API
   */
  html.trigger = function (eventName) {
    if (!eventName) {
      throw 'Event name must be specified';
    }

    var event;
    if (document.createEvent) {
      // create HTMLEvents, init that event - for IE >= 9
      event = document.createEvent('HTMLEvents');
      event.initEvent(eventName, true, true);
    } else if (document.createEventObject) {
      // For IE < 9
      event = document.createEventObject();
      event.eventType = eventName;
    }
    try {
      // call that event natively e.g input.click()
      // we need to put in try catch block because older browsers causes exception
      ctx[eventName]();
      return;
    } catch (e) { }
    try {
      // need to try catch in case IE fire change of removed input control
      event.eventName = eventName;
      if (ctx.dispatchEvent) {
        // dispatch the event if possible - for IE >= 9
        ctx.dispatchEvent(event);
      } else if (ctx.fireEvent) {
        // fire event - for IE < 9
        ctx.fireEvent('on' + event.eventType, event);// can trigger only real event (e.g. 'click')
      } else if (ctx['on' + eventName]) {
        ctx['on' + eventName]();
      }
    } catch (e) { }
  };

  /**
   * Text binding
   * @memberof html
   * @param {String|html.observable<String>} observable Observable object contain a string
   * @return {Function} html - For fluent API
   */
  html.text = function (observable) {
    // Create text node with observable
    var textNode = document.createTextNode(html.unwrapData(observable));

    // Append text node to the context
    ctx.appendChild(textNode);

    // If observable is actual html.observable
    if (observable!= null && observable.subscribe) {
      // Subscribe change to observable to update text content
      observable.subscribe(function (newText) {
        textNode.textContent = newText;
      });
    }

    // Return html
    return html;
  };

  /**
   * Binding HTML for an element <br />
   * NOTE: this method is not safe to use, it could be the cause for XSS attack
   * @memberof html
   * @param {String|html.observable} observableStr - HTML string or observable string
   * @return {Function} html - Return html for fluent API
   */
  html.html = function (observableStr) {
    // If observableStr is null, return
    if (observableStr == null) {
      return;
    }

    // Let text be the underlying data of observableStr
    var text = html.unwrapData(observableStr),
        ele  = html.context;

    // Set innerHTML/innerText to the element
    try {
      ele.innerHTML = text;
    } catch (e) {
      ele.innerText = text;
    }

    // If the observableStr is html.observable
    if (observableStr.subscribe) {
      // Subscribe change from observableStr to update inner HTML of the element
      observableStr.subscribe(function (text) {
        // Set inner HTML of the element
        try {
          ele.innerHTML = text;
        } catch (e) {
          ele.innerText = text;
        }
      });
    }

    return html;
  };

  /**
   * Value binding for HTMLElement that has value property, for example input/textarea
   * @memberof html
   * @param {Object|html.observable} observable - Observable or primitive data type
   * @return {Function} html - for fluent API
   */
  html.value = function (observable) {
    // Let input be the context of html
    var input = ctx;

    // Let value be the underlaying data of observable
    var value = html.unwrapData(observable);

    // Set value to the input/textarea
    input.value = value == null ? '' : value;

    // If observable is.subscribe,
    if (observable.subscribe) {
      // Subscribe change to observable
      observable.subscribe(function (newValue) {
        // Check for current input, avoid update itself
        if (focusingEle === input) {
          return;
        }
        // Update input value after data changed
        input.value = newValue == null ? '' : newValue;
      });

      // Listen to input change event
      html(input).onInput(function () {
        // Update observable underlying data
        observable.data = this.value;
      });

      // Add the context to bindingNodes,
      // this is to trace back DOM nodes in validation functions
      // to display validation message
      observable.bindingNodes.push(ctx);
    }
    return html;
  };

  /**
   * Set attribute for the context element
   * @example
   * html(document.body)
   *     .a.text('Author')
   *     .attr({href: 'mailto:author@gmail.com'});
   * @memberof html
   * @param {Object} attrObj - Attribute object
   * @param {String|Number|Bool} val - Value of attribute
   * @return {Function} html - for fluent API
   */
  html.attr = function (attrObj, attrValue) {
    // If attrObj is string, then
    // set the attribute of the context
    if (typeof attrObj === 'string') {
      if (attrValue === undefined) {
        return ctx.getAttribute(attrObj);
      } else if (attrValue !== null) {
        ctx.setAttribute(attrObj, html.unwrapData(attrValue));
      }
    } else {
      for (var i in attrObj) {
        if (attrObj.hasOwnProperty(i)) {
          ctx.setAttribute(i, html.unwrapData(attrObj[i]));
        }
      }
    }

    return this;
  };

  function getStyle(el, styleProp) {
    var value, defaultView = (el.ownerDocument || document).defaultView;
    // W3C standard way:
    if (defaultView && defaultView.getComputedStyle) {
      // sanitize property name to css notation
      // (hyphen separated words eg. font-Size)
      styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
      return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el.currentStyle) { // IE
      // sanitize property name to camelCase
      styleProp = styleProp.replace(/\-(\w)/g, function (str, letter) {
        return letter.toUpperCase();
      });
      value = el.currentStyle[styleProp];
      // convert other units to pixels on IE
      if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
        return (function (value) {
          var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
          el.runtimeStyle.left = el.currentStyle.left;
          el.style.left = value || 0;
          value = el.style.pixelLeft + "px";
          el.style.left = oldLeft;
          el.runtimeStyle.left = oldRsLeft;
          return value;
        })(value);
      }
      return value;
    }
  }

  var rcamelCase = /-([a-z])/g,
    fcamelCase = function (a, letter) { return letter.toUpperCase(); },
    getFCamalCase = function (val) { return val ? val.replace(rcamelCase, fcamelCase) : ''; };

  /**
   * Get/Set style to the context, override existing styles
   * @example
   * html(document.body).button.text('Click me')
   *     .attr({id: 'myButton'})
   *     .css({backgroundColor: '#3071a9'});
   * html('#myButton').css('backgroundColor'); // => #3071a9
   * @memberof html
   * @param {Object|String} cssObj - Style object or style name.
   * @param {String} [cssValue] - Style value
   * @return {Object} html
   */
  html.css = function (cssObj, cssValue) {
    // If cssObj is string, then
    // set the attribute of the context
    if (typeof cssObj === 'string') {
      cssObj = getFCamalCase(cssObj);
      if (cssValue == null) {
        // when we want to get css by a key
        // get it by defaultView or in IE8
        if (!document.defaultView) {
          return ctx.currentStyle && ctx.currentStyle[cssObj];
        }
        return getStyle(ctx, cssObj);
      }
      ctx.style[cssObj] = cssValue;

      // return html
      return this;
    }
    for (var i in cssObj) {
      if (cssObj.hasOwnProperty(i)) {
        ctx.style[getFCamalCase(i)] = cssObj[i];
      }
    }

    // return html for fluent Api
    return this;
  };

  function updateClassName(el, newClass, oldClass) {
    // Trim newClass and oldClass string
    newClass = trim(newClass);
    oldClass = trim(oldClass);

    if (oldClass !== '') {
      var elClass = el.className;
      while (elClass.indexOf(oldClass) !== -1) {
        elClass = elClass.replace(oldClass, '');
        elClass = trim(elClass);
      }
      el.className = elClass;
    }

    if (newClass !== '') {
      // Add the class
      el.className += el.className === '' ? newClass : ' ' + newClass;
    }
  }

  /**
   * Set className to the context
   * @example
   * html(document.body).button.text('Click me')
   *     .attr('myButton')
   *     .className('btn btn-primary);
   * console.log(document.getElementById('myButton').className); // => btn btn-primary
   * @memberof html
   * @param {String|html.observable} className - Class name to add
   * @return {Object} html - For fluent API
   */
  html.className = function (observable) {
    if (observable == null) {
      return html;
    }

    // Unwrap className string
    var className = html.unwrapData(observable),
        element   = html.context;

    updateClassName(element, className, className);

    if (observable.subscribe) {
      observable.subscribe(function (newValue, oldValue) {
        updateClassName(element, newValue, oldValue);
      });
    }
    return html;
  };

  /**
   * This method is used internally to remove some children from an element
   * @param {Element} parent - Root node to remove children
   * @param {Number} index - Begin index to remove
   * @param {Number} numberOfElement - Number of element that one item in list rendered
   */
  function removeChildList(parent, index, numOfElement) {
    // Calculating start index
    index = index * numOfElement;
    // From start index, remove numOfElement times
    for (var i = 0; i < numOfElement && parent.children.length; i++) {
      parent.removeChild(parent.children[index]);
    }
  }

  /**
   * This method will append all created nodes into correct position inside container
   * only use this when user want to add to any position but not the last
   * @param {Element} parent - Root element to add children
   * @param {Element} tmpNode - Temporary element that contains all children needed
   * @param {Number} index - Index of the item in the list
   */
  function appendChildList(parent, tmpNode, index) {
    // previous node mean the node right before previous item rendered
    // it could be br tag or whatever
    var previousNode = null;

    // check if renderer renders nothing
    if (tmpNode.children.length === 0) {
      throw 'You must add at least one element';
    }

    // calculate index of previous node
    // e.g user want to add at 1, renderer renders 4 inputs
    // then index would be 4
    index = index * tmpNode.children.length;
    previousNode = parent.children[index];

    // Append all child before previousNode
    while (tmpNode.children.length) {
      parent.insertBefore(tmpNode.children[0], previousNode);
    }
  }

  /**
   * Render to a list of DOM from an Array or html.observableArray <br />
   * **NOTE**: You have to render number of DOM elements equally for each data item,
   * other wise the engine won't be able to add or remove item correctly
   * @example
   * var smartPhoneList = ['iPhone', 'Samsung galaxy', 'Google Pixel', 'Google Nexus'];
   * html(document.body).ul.each(smartPhoneList, function(phone, index) {
   *     html.li.text(phone);  
   * });
   * @see [Working with List](../api/tutorial.list.html#step2) tutorial
   * @memberof html
   * @param {Array|html.observableArray} model List data to render
   * @param {Function} renderer Renderer.
   * @return {Object} html object for fluent API
   */
  html.each = function (model, renderer) {
    // If model is null, return
    if (model == null) {
      return;
    }

    // Save the container pointer to parent
    var parent = ctx;

    // Empty all element inside parent node before render
    html(parent).empty();

    // The main idea to render is this loop
    // Just use renderer callback, let user do whatever they want
    var unwrappedModel = html.unwrapData(model),
        length = unwrappedModel.length || unwrappedModel, i = -1;

    while (++i < length) {
      ctx = parent;
      renderer.call(parent, unwrappedModel[i] == null ? i : unwrappedModel[i], i);
    }

    // This method is used to update UI if user call any action modify the list
    // There are currently 4 actions: push, add, remove, render
    // in the future we may add 2 more actions: sort and swap
    function update(items, item, index, action) {
      var numOfElement = 0;
      ctx = parent;
      switch (action) {
        case 'push':
          // render immediately the item, call renderer to do thing
          renderer.call(parent, item, index);
          break;
        case 'add':
          // if user want to insert at the last
          // render immediately the item, call renderer to do thing
          if (index === items.length - 1) {
            renderer.call(parent, item, index);
            return;
          }
          // if we wants to insert at any position
          // create tmpNode, append all element to that node
          // then append to the parent node again
          // this action cost time most
          var tmpNode = document.createElement('div');
          ctx = tmpNode;
          renderer.call(tmpNode, item, index);
          appendChildList(parent, tmpNode, index);
          tmpNode = null;
          break;
        case 'remove':
          numOfElement = parent.children.length / (items.length + 1);
          // remove all elements that renderer created
          removeChildList(parent, index, numOfElement);
          break;
        case 'move':
          numOfElement = parent.children.length / items.length;
          // move item to a new position
          var newIndex = index,
            oldIndex = items.indexOf(item);
          // avoid do nonsense thing - move to the old position
          if (newIndex === oldIndex) return;
          // get the first element in the DOM node list
          var firstOldElementIndex = oldIndex * numOfElement;
          // get the first node to move upon
          var nodeToInsert = oldIndex < newIndex ? parent.children[(newIndex + 1) * numOfElement] : parent.children[newIndex * numOfElement];
          for (var j = 0; j < numOfElement; j++) {
            parent.insertBefore(parent.children[firstOldElementIndex], nodeToInsert);
            if (oldIndex > newIndex) firstOldElementIndex++;
          }
          break;
        case 'render':
          // empty all element inside parent node before render
          html.empty();
          // render it, call renderer to do thing
          var length = items.length || items, i = -1;
          while (++i < length) {
            ctx = parent;
            renderer.call(parent, items[i] == null ? i : items[i], i);
          }
          break;
      }
    }
    // set the context again before exiting the function
    ctx = parent;

    // subscribe update function to observer
    if (model.subscribe) {
      model.subscribe(update);
    }
    return this;
  };

  /**
   * Append a new node to the context
   * @memberof html
   * @param {HTMLElement} node - HTML element to append
   */
  html.append = function (node) {
    if (ctx != null) {
      ctx.appendChild(node);
    }
    return html;
  };

  /**
   * Prepend a new node to the context
   * @memberof html
   * @param {HTMLElement} node - HTML element to prepend
   */
  html.prepend = function (node) {
    if (ctx != null) {
      var parent = ctx.parentElement;
      parent.insertBefore(node, parent.firstChild);
    }
    return html;
  };

  /**
   * Insert a new node after the context
   * @memberof html
   * @param {HTMLElement} node - HTML element to prepend
   */
  html.after = function (node) {
    if (ctx != null) {
      var parent = ctx.parentElement;
      parent.insertBefore(node, ctx.nextElementSibling);
    }
    return html;
  };

  /**
   * Insert a new node before the context
   * @memberof html
   * @param {HTMLElement} node - HTML element to prepend
   */
  html.before = function (node) {
    if (ctx != null) {
      var parent = ctx.parentElement;
      parent.insertBefore(node, ctx);
    }
    return html;
  };

  function setVisible(ele, val, displayText) {
    if (!val) {
      ele.style.display = 'none';
    } else {
      ele.style.display = displayText !== 'none' ? displayText : '';
    }
  }

  /**
   * Show/hide the element based on data
   * @example
   * var state = html.observable(true);
   * html(document.body).button.text('Click me').visible(state);
   * state.data = false; // hide the button
   * state.data = true;  // show the button
   * @memberof html
   * @param {Boolean|html.observable} visible - Indicate that the element should be visible
   * @return {Function} html
   */
  html.visible = function (visible) {
    var val = html.unwrapData(visible),
      ele = html.context,
      displayText = html.css('display');

    setVisible(ele, val, displayText);

    if (visible.subscribe) {
      visible.subscribe(function (val) {
        setVisible(ele, val, displayText);
      });
    }
    return html;
  };

  /**
   * Hidden binding
   * The opposite of visible binding.
   * @example
   * var state = html.observable(true);
   * html(document.body).button.text('Click me').hidden(state);
   * state.data = false; // show the button
   * state.data = true;  // hide the button
   * @memberof html
   * @param {Boolean|html.observable} hidden - Indicate that the element should be hidden
   * @return {Function} html - For fluent API
   */
  html.hidden = function (hidden) {
    var val = hidden.data,
      ele = html.context,
      displayText = html.css('display');

    setVisible(ele, !val, displayText);

    if (hidden.subscribe) {
      hidden.subscribe(function (val) {
        setVisible(ele, !val, displayText);
      });
    }
    return html;
  };

  function getSelectedIndex(list, item, valueField) {
    if (html.unwrapData(item) == null) return -1;
    var realList = html.unwrapData(list),
      realItem = html.unwrapData(item),
      index = realList.indexOf(realItem);
    if (valueField !== '') {
      var selectedItem = realList.find(function (item) {
        return item[valueField] === realItem[valueField];
      });
      index = realList.indexOf(selectedItem);
    }
    return index;
  }

  /**
   * Render SELECT element
   * @example
   * var products = [  
   *     { name: 'iPhone', price: 900 },
   *     { name: 'Samsung galaxy', price: 850 },
   *     { name: 'Google Pixel', price: 800 },
   *     { name: 'Google nexus', price: 750 }
   * ],
   * selectedItem = html.observable(this.products[0]);
   * html(document.body).dropdown(products, selectedItem, 'name', 'name');
   * @see [Working with List](../api/tutorial.list.html#step1) tutorial
   * @memberof html
   * @param {Array|html.observableArray} list - List items
   * @param {Object} selectedItem - Selected item
   * @param {String} [displayField] - Display field
   * @param {String} [valueField] - Value field
   */
  html.dropdown = function (list, selectedItem, displayField, valueField) {
    // If current element is not a "select" element
    if (ctx.nodeName.toLowerCase() !== 'select') {
      // Render select element
      html.select;
    }

    // Save a reference to select element for later use
    var select = ctx;

    // Render options for the select tag
    html.each(list, function (model) {
      var value = isString(valueField) ? model[valueField] : model;
      var text = isString(displayField) ? model[displayField] : model;
      html.option.text(text).value(value).$;
    });

    // Set selected index
    select.selectedIndex = getSelectedIndex(list, selectedItem, valueField);
    if (list.subscribe) {
      list.subscribe(function (realList) {
        select.selectedIndex = getSelectedIndex(realList, selectedItem, valueField);
      });
    }

    // If selectedItem is instance of html.observable
    if (selectedItem != null && selectedItem.subscribe) {
      // Add the select to bindingNodes
      // for validation or anything that needs to access DOM from observable object
      selectedItem.bindingNodes.push(select);

      // Add change event to select tag
      html(select).onChange(function () {
        // Get selectedItem
        var selectedObj = html.unwrapData(list)[this.selectedIndex];

        // Set selectedItem data, notifying change
        selectedItem.data = selectedObj;
      });

      // Subscribe change from selectedItem, to update selected index
      selectedItem.subscribe(function (val) {
        select.selectedIndex = getSelectedIndex(list, val, valueField);
      });
    }
    // Return html
    return html;
  };

  /**
   * Update checkbox state, just check or uncheck it
   * @param {HTMLElement} chkBox - Checkbox element
   * @param {Boolean|String} state - Indicate that the checkbox should be checked
   */
  function updateCheckbox(chkBox, state) {
    // Set attribute and also set property checked
    if (state === 'true' || state === true) {
      chkBox.setAttribute('checked', 'checked');
      chkBox.checked = true;
    } else {
      chkBox.removeAttribute('checked');
      chkBox.checked = false;
    }
  }

  /**
   * Create input tag with type is "checkbox" and append to the current context of HtmlJs. <br />
   * If the current context is already input tag then HtmlJs won't generate again, only set its checked property
   * @example
   * html(document.body).checkbox(true); // ==> checked
   * var checked = html.observable(false);
   * html(document.body).checkbox(checked); // ==> not checked
   * @memberof html
   * @param {Boolean|html.observable} [observable = false] - Observable object represents checked state of checkbox
   * @return {Function} html - For fluent API
   */
  html.checkbox = function (observable) {
    // If the isn't checkbox
    if (html.context.type !== 'checkbox') {
      // Render checkbox
      html.input.attr({ 'type': 'checkbox' });
    }

    // Save a reference to checkbox element
    var chkBox = html.context;

    updateCheckbox(chkBox, html.unwrapData(observable));

    function change(e) {
      var src = e.srcElement || e.target;
      if (observable._computedFn != null) {
        observable.notify();
      } else {
        observable.data = src.checked === true;
      }
    }

    // Check if observable is html.observable
    if (observable != null && observable.subscribe) {
      // Bind event handler to the checkbox
      this.onChange(change).onClick(change);

      // Subscribe a listener to observable, to listen data change
      // then update checkbox state
      observable.subscribe(function (value) {
        // Avoid to update itself, or update on computed value
        // NOTE: DO NOT check for focusing element in DOM
        // because focusing element will not work in automation test
        if (focusingEle === chkBox) {
          return;
        }
        updateCheckbox(chkBox, value);
      });
    } else {
      // Release the reference immediately if observable is not a function
      chkBox = null;
    }
    // Return html
    return html;
  };

  return html;
}));
