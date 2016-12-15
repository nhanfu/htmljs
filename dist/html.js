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
    objPro = Object.prototype,
    clearTimeout = window.clearTimeout,
    setTimeout = window.setTimeout,
    isFunction = function (x) { return objPro.toString.call(x) === '[object Function]'; },
    isString = function (x) { return typeof x === 'string'; },
    isPropertiesEnumerable = function (x) {
      return typeof x === 'object' && x != null && !(x instanceof Date);
    },
    trimNative = String.prototype.trim,
    trim = function (str) {
      return trimNative && trimNative.call(str) || str.replace(/^\s+|\s+$/, '');
    };

  // Export html symbol to window
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
    get: function () {
      return ctx;
    }
  });

  /**
   * Extend an object by another object's properties
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
   * Clear all DOM nodes within context element
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
   * @param  {String} tag Tag name
   * @return {Object} html
   */
  function defineTag(tag) {
    Object.defineProperty(html, tag, {
      /**
       * Render DOM element, append to the html context if available
       */
      get: function () {
        // 1. Create an element with tag name
        var ele = document.createElement(tag);

        // 2. If the context is null,
        if (ctx == null) {
          // Set the context to be the created element
          ctx = ele;
        } else {
          // Append the created element as a child of context
          ctx.appendChild(ele);
          // set the context to be the created element
          ctx = ele;
        }

        // 3. Return html for fluent Api
        return html;
      }
    });
  }

  // Loop through all tags and create basic components from each
  for (var i = 0, j = tags.length; i < j; i++) {
    defineTag(tags[i]);
  }

  // Define end tag symbol
  // We use "$"
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
     * Binding event to context
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
   * @param {String} eventName - event of a DOM to trigger
   * @return {Function} html
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
   * @param  {String|html.observable<String>} observable Observable object contain a string
   * @return {Object} html
   */
  html.text = function (observable) {
    // 1. Create text node with observable
    var textNode = document.createTextNode(html.unwrapData(observable));

    // 2. Append text node to the context
    ctx.appendChild(textNode);

    // 3. If observable is actual html.observable
    if (observable!= null && observable.subscribe) {
      // a. Subscribe change to observable to update text content
      observable.subscribe(function (newText) {
        textNode.textContent = newText;
      });

      // b. Add the context to bindingNodes
      //    this is to trace back DOM nodes in validation functions
      //    to display validation message
      observable.bindingNodes.push(ctx);
    }

    // 4. return html
    return html;
  };

  /**
   * Binding HTML for an element
   * NOTE: this method is not safe to use, it could be used for XSS attack
   * @param {String|html.observable} observableStr - HTML string
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

    // return html
    return html;
  };

  /**
   * Value binding for HTMLElement that has value property
   * @param  {Object|html.observable} observable - Observable or primitive data type 
   * @return {Function} html for fluent API
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
   * @param  {Object} attrObj Attribute object
   * @param  {String|Number|Bool} val Value of attribute
   * @return {[type]}       [description]
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

    // return html for fluent Api
    return this;
  };

  var rcamelCase = /-([a-z])/g,
    fcamelCase = function (a, letter) { return letter.toUpperCase(); },
    getFCamalCase = function (val) { return val ? val.replace(rcamelCase, fcamelCase) : ''; };

  /**
   * Set style to the context
   * @param  {Object|String} cssObj Style object or style name
   * @param  {String} cssValue Style value
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
        return document.defaultView.getComputedStyle(ctx, null).getPropertyValue(cssObj);
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
   * @param  {String} className Class name to add
   * @return {Object} html
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
   * Render a list with fluent API
   * @param {Array|html.observable<Array>} model List data to render
   * @param {Function} renderer Renderer callback
   * @return {Object} html object for fluent API
   */
  html.each = function (model, renderer) {
    // if model not pass, do nothing
    if (!model) {
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
   * @param {HTMLElement} node - HTML element to prepend
   */
  html.before = function (node) {
    if (ctx != null) {
      var parent = ctx.parentElement;
      parent.insertBefore(node, ctx);
    }
    return html;
  };

  /**
   * Serialize observable data to pure JSON
   * @param {html.observable} rootObj Observable object
   * @param [Function] serializer Callback to handle seializing
   * @return {Object|Array} Pure JSON data
   */
  html.serialize = function (rootObj) {
    // 1. Unwrap data
    rootObj = rootObj.subscribe ? rootObj._newData : rootObj;
    if (rootObj == null) {
      return rootObj;
    }

    // 2. Let isList be true if root object is an array
    var isList = rootObj instanceof Array;

    // 3. Initialize result based on root obj type
    var result = isList ? [] : {};

    // 4. Check that root object should be loop through properties
    //    we don't use propertyIsEnumerable because it's not trusted
    //    go through all objects that are primitive type like Date, String, null, undefined, Number, etc
    var hasProps = isPropertiesEnumerable(rootObj) || rootObj != null;

    // 5. If root object doesn't have any properties, return rootObj
    if (!hasProps) {
      return rootObj;
    }

    // 6. Loop through properties of rootObj
    //    NOTE: we iterate all properties of object as well as indices of Array
    for (var i in rootObj) {
      if (rootObj[i] && rootObj[i].subscribe && !rootObj[i].add) {
        // a. If it is an observable but not an observableArray, then
        //    get underlying data value
        var newData = rootObj[i]._newData;

        // b. Assign underlying to result
        result[i] = !isPropertiesEnumerable(newData) ? newData : html.unwrapData(rootObj[i]);
      } else {
        // Recursively serialize child object
        result[i] = html.serialize(rootObj[i]);
      }
    }

    // 7. If rootObj is an array
    if (isList) {
      i = 0;
      // a. loop through element
      for (var j = rootObj.length; i < j; i++) {
        // i. assign to result and then apply serialize recursively
        result[i] = html.serialize(rootObj[i]);
      }
    }

    return result;
  };

  function setVisible(ele, val, displayText) {
    if (!val) {
      ele.style.display = 'none';
    } else {
      ele.style.display = displayText !== 'none' ? displayText : '';
    }
  }

  /**
   * Visible binding
   * @param {html.observable} visible - Indicate that the element should be visible
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
   * @param {html.observable} hidden - Indicate that the element should be hidden
   * @return {Function} html
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
   * Dropdown control
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
   * Checkbox control
   * @param {html.observable} [observable = false] - Observable object represents checked state of checkbox
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

  /**
   * Unwrap data from observable object
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
   * Unwrap data without notify change nor register dependency
   * @param {html.observable} data - Observable object
   * @param {Boolean} [getNewData] - Internal use. Get _newData or computed data
   * @return {Object} underlying data
   */
  html.unwrapNoSideEffect = function unwrapNoSideEffect(obj, getNewData) {
    // Let result be obj
    // to return original object if it wasn't an observable
    var res = obj;
    if (obj.subscribe) {
      res = obj._computedFn instanceof Function ? obj._computedFn : obj._newData;
      if (getNewData) {
        res = obj._newData;
      }
    }
    while (res instanceof Function) {
      res = res();
    }
    return res;
  };

  /**
   * Deserialize pure JSON to html.observable
   * @param {Object} obj Object to deserialize
   * @param [Function] deserializer Callback to handle deseializing
   * @return {html.observable} Deserialized object
   */
  // html.deserialize = function (obj, deserializer) {

  // };

  // Let computedStack be an empty array
  // We'll use this to track the stack of observable data,
  // to register dependencies for computed property
  var computedStack = [],
    exeStack = [];

  /**
   * Observable data, implementation of observer pattern
   * @see https://en.wikipedia.org/wiki/Observer_pattern
   * @param  {Object} data Data to be observed
   * @return {html.observable<Object>} Observable data
   */
  html.observable = function (data) {
    // Make sure to return a new instance of html.observable
    // regardless of using "new" keyword
    if (!(this instanceof html.observable)) {
      return new html.observable(data);
    }

    // Keep a reference to context
    var self = this;

    /** Get and set underlying data silently */
    self._newData = null;

    /** Computed function */
    self._computedFn = null;

    /** old data */
    self._oldData = null;
    self.subscribers = [];
    self.rules = [];
    self.bindingNodes = [];
    self.dependencies = [];

    /**
     * Is valid state
     * Default be null, not validated state
     * Different from valid and invalid state
     */
    self.isValid = null;
    self.delayTime = null;

    if (data instanceof Function) {
      // Set _computedFn be the data function
      self._computedFn = data;

      // Push this to computedStack,
      // to track dependencies
      computedStack.push(self);

      // Set _newData and _oldData
      self._newData = self._oldData = data();

      // After evaluating the computed value,
      // pop the computed value from the stack,
      // not to register dependency for this anymore
      computedStack.pop();

    } else {
      self._newData = self._oldData = data;
    }

    /**
     * Set a dependency
     * @param {html.observable} dependency - Dependency of this data
     */
    self.setDependency = function (dependency) {
      // Get index of dependency,
      // to check duplicate
      var index = self.dependencies.indexOf(dependency);
      // If the dependency is not in the dependency list, then
      if (index < 0 && dependency !== self) {
        // push it to the list
        self.dependencies.push(dependency);
      }
    };

    /**
     * Getter - Get observable data
     */
    self.get = function () {
      var res;
      if (isFunction(self._computedFn)) {
        // evaluate self.dependencies if the data is a computed property
        computedStack.push(self);

        // Execute the observable function,
        // to register dependencies
        res = self._computedFn;
        while (res instanceof Function) {
          res = res();
        }

        // Set old data
        self._oldData = self._newData;

        // Set new data
        self._newData = res;

        // After evaluating the computed value,
        // pop the computed value from the stack,
        // not to register dependency for this anymore
        computedStack.pop();
      } else {
        res = self._newData;
      }

      // If computedStack has item
      if (computedStack.length) {
        // Set computed observable as dependency
        self.setDependency(computedStack[computedStack.length - 1]);
      }

      // Return real value
      return res;
    };

    /**
     * Setter - Set data to observable and notify change
     * {Object} data - Data to set
     */
    self.set = function (data) {
      // If the new data is equal to old data, return
      if (self._newData === data) {
        return;
      }

      // Set _oldData
      self._oldData = self._newData;

      // Set _newData
      self._newData = data;

      // Notify change to subscribers
      self.notify();
    };

    // Shorthand for getter and setter
    Object.defineProperty(self, 'data', {
      get: self.get,
      set: self.set
    });

    /**
     * Subscribe change to observable data.
     * Whenever the underlaying data changes,
     * it trigger all subscribed functions
     * @param  {Function} observer Observer
     */
    self.subscribe = function (subscriber) {
      if (self.subscribers.indexOf(subscriber) < 0) {
        self.subscribers.push(subscriber);
      }
      return self;
    };

    /**
     * Notify change to subsribers and dependencies
     */
    function notify() {
      var isBeingExecuted = exeStack.indexOf(self) >= 0;

      // If this data is being executed, then return
      if (isBeingExecuted) return;

      // Push self to exeStack
      // to track circle notifying
      exeStack.push(self);

      // Get underlying data,
      // without notify to dependencies
      var newData = html.unwrapData(self);

      // Notify change to all subscriber
      self.subscribers.forEach(function notifyChangeToSubscriber(subscriber) {
        subscriber(newData, self._oldData);
      });

      // Notify change to dependencies
      self.dependencies.forEach(function notifyChangeToDependencies(dpc) {
        dpc.notify();
      });

      // Remove self from exeStack
      exeStack.splice(exeStack.indexOf(self), 1);
    }

    var waitForLastChange;
    /**
     * Notify changes to subscribers
     */
    self.notify = function () {
      // If the data is not computed and no delay time, then
      if (self._computedFn == null && self.delayTime == null) {
        // Notify change immediately
        notify();
        return;
      }
      clearTimeout(waitForLastChange);
      waitForLastChange = setTimeout(function () {
        notify();
      }, self.delayTime);
    };

    /**
     * Set delay time of notifying changes
     * @param {Number} time Delay time (miliseconds)
     */
    self.delay = function (time) {
      if (typeof time !== 'number') {
        throw TypeError('Delay time must be a number.');
      }
      self.delayTime = time;
      return self;
    };

    /**
     * Register validation rule for html.observable
     * @param {Function} rule - Validation rule function
     */
    self.validators = function (rule) {
      // Simply push the rule to rule list
      self.rules.push(rule);
    };

    /**
     * Validate data against validators
     */
    self.validate = function () {
      // 1. Reset isValid flag
      self.isValid = null;

      // 2. Run all 'validators'
      self.rules.forEach(function (rule) {
        rule(self);
      });

      // 3. Return result
      //    NOTE that all validator must set isValid flag to be false on error
      //    if the rule is satisfied, then DO NOT touch it
      return self.isValid;
    };

  };

  /**
   * Observable Array class
   * @param {Array} arr Array data to observe
   * @return
   */
  html.observableArray = function (arr) {
    if (arr == null) {
      throw TypeError(' data is null or undefined.');
    }
    if (!(arr instanceof Array)) {
      throw TypeError(' expected an array but got a non-array parameter.');
    }

    var self = this;

    // Make sure to create a new object from self function,
    // regardless of using "new" keyword
    if (!(self instanceof html.observableArray)) {
      return new html.observableArray(arr);
    }

    // calling base class constructor
    html.observable.call(self, arr);

    function notify(listItem, item, index, action) {
      var isBeingExecuted = exeStack.indexOf(self) >= 0;

      // If this data is being executed, then return
      if (isBeingExecuted) return;

      // Push self to exeStack
      // to track circle notifying
      exeStack.push(self);

      // Notify change to all subscriber
      self.subscribers.forEach(function notifyChangeToSubscriber(subscriber) {
        subscriber(listItem, item, index, action);
      });

      // Notify change to dependencies
      self.dependencies.forEach(function notifyChangeToDependencies(dpc) {
        dpc.notify();
      });

      // Remove self from exeStack
      exeStack.splice(exeStack.indexOf(self), 1);
    }

    /**
     * Notify changes to subscribers
     * @param {Array|Object} listItem Newest data underlying observable
     * @param {Object} item Item changed
     * @param {Number} [index=null] Index of item changed
     * @param {String} [action="render"] Action to notify to subscriber
     */
    self.notify = function (listItem, item, index, action) {
      // Default data for listItem is _newData
      listItem = listItem || self._newData;

      // Default action is "render"
      action = action || 'render';

      notify(listItem, item, index, action);
    };

    /**
     * Push an item into an observable array
     * @param {Object} item  Item to add
     */
    self.push = function (item) {
      self.add(item);
    };

    /**
     * Add an item into an observable array
     * @param {Object} item  Item to add
     * @param {Number} index Index to add
     */
    self.add = function (item, index) {
      // 1. Let index by default be _newData length,
      //    to ensure index never null or undefine.
      //    By default, we'll push new item into the last position
      index = index === undefined ? self._newData.length : index;

      // 2. Add the item into the index
      self._newData.splice(index, 0, item);

      // 3. Notify changes
      self.notify(self._newData, item, index, 'add');
    };

    /**
     * Remove an item from the observable array
     * @param {Object} item - Item to be removed
     */
    self.remove = function (item) {
      var index = self._newData.indexOf(item);
      self.removeAt(index);
    };

    /**
     * Remove an item from the list
     * @param  {Number} index Index of removed item
     */
    self.removeAt = function (index) {
      // 1. Let item be the deleted item
      var item = self._newData[index];

      // 2. Remove the item at the given index
      self._newData.splice(index, 1);

      // 3. Notify to all subscribers with "remove" action
      self.notify(self._newData, item, index, 'remove');
    };

    /**
     * Update an item of the list
     * @param  {Object} item New item to update
     * @param  {Number} index Index of the item
     */
    self.update = function (item, index) {
      self._newData[index] = item;
      self.notify(self._newData, item, index, 'udpate');
    };
  };

  // Inherit html.observable prototype
  html.observableArray.prototype = Object.create(html.observable.prototype);

  return html;
}));

/* AJAX MODULE */
;(function(html, window) {
    'use strict';

    var setTimeout = window.setTimeout,
        document   = window.document,
        XMLHttpRequest = window.XMLHttpRequest;
    /**
     * Promise pattern for calling asynchronous code, usually ajax/setTimeout/setInterval
     * @param {Function} task - Task to do asynchronously
     */
    html.Promise = function(task) {
        // 1. Make sure to return a new instance of html.Promise,
        //   regardless of using new keyword
        if (!(this instanceof html.Promise)) {
            return new html.Promise(task);
        }

        // 2. Let self be the context
        var self = this;

        // 3. Done and fail actions
        self.doneActions = [];
        self.failActions = [];

        // 4. Resolve function, use to call all done functions
        self.resolve = function(val) {
            // run all done methods on fulfilled
            self.doneActions.forEach(function(f) {
                if (f != null) {
                    f(val);
                }
            });
        };

        // 5. Reject function, use to call fail function
        self.reject = function(reason) {
            // a. Run all fail methods on rejected
            self.failActions.forEach(function(f) {
                if (f != null) {
                    f(reason);
                }
            });
        };

        // promise done method, use to set done methods, these methods will be call when the resolve method called
        // we can call done and then as many times as we want
        self.done = function(action) {
            if (typeof action === 'function') {
                // only push the callback to the queue if it is a function
                self.doneActions.push(action);
            }
            return self;
        };

        // promise fail method, use to set fail method, the method will be call when the reject method called
        // only call fail method once
        self.fail = function(action) {
            if (typeof action === 'function') {
                // only set the callback if it is a function
                self.failActions.push(action);
            }
            return self;
        };

        // Execute the task
        setTimeout(function() {
            task(self.resolve, self.reject);
        });
    };

    /**
     * Event when script loaded and execute success
     * Clear the jsonpId property of script element
     * Set the script to be null, avoid memory leak
     * @param {Element} newScript - Script element
     */
    function scriptLoaded(newScript) {
        // remove the node after finish loading
        newScript.parentElement.removeChild(newScript);
        // remove reference of jsonp callback
        var jsonpId = newScript.jsonpId;
        html.ajax['jsonpId' + jsonpId] = undefined;
        // set the script node null, for release memory (I think this doesn't help too much)
        newScript = null;
    }

    // Let jsonpId be 0,
    // for generating jsonp preprocessor without conflict
    var jsonpId = 0,

        // Let mockSetup be an empty array,
        // this is for mocking data in testing
        mockSetup = [];

    /**
     * Ajax method
     * @param {String} url - The Url to request resource
     * @param {Object} data - Parameters to submit
     * @param {String} [method = "GET"] - Ajax method
     * @param {Boolean} [async = true] - Indicate that the request is asynchronous
     */
    html.ajax = function(url, data, method, async) {
        // Return a new instance of html.ajax
        // regardless of using new keyword
        if (!(this instanceof html.ajax)) {
            return new html.ajax(url, data, method, async);
        }

        var jsonp,
            header = {}, parser = null, timeout = null,
            username, password;

        // 1. Set default value for method and async
        //    NOTE: synchronous ajax request is depreciated
        method = method || 'GET';
        async = async !== undefined ? async : true;

        // 2. Create a new instance of Promise to deal with async ajax task
        var promise = html.Promise(function(resolve, reject) {
            var mock = mockSetup.find(function(item) {
                return item.url === url;
            });
            if (mock != null) {
                resolve(mock.data);
                return;
            }
            // Process jsonp first if there come a jsonp callback
            if (jsonp) {
                // a. Create script node to load resource from another server
                var src = url + (/\?/.test(url) ? "&" : "?"),
                    head = document.getElementsByTagName('head')[0],
                    newScript = document.createElement('script'),
                    params = [],
                    param_name = "";

                jsonpId++;

                // b. Save the reference of jsonp callback
                html.ajax['jsonpId' + jsonpId] = jsonp;
                data = data || {};

                // c. Append callback to data
                data.callback = "html.ajax.jsonpId" + jsonpId;

                // d. Append all parameters to the url
                for (param_name in data) {
                    if (data.hasOwnProperty(param_name)) {
                        params.push(param_name + "=" + encodeURIComponent(data[param_name]));
                    }
                }
                src += params.join("&");
                newScript.type = "text/javascript";
                newScript.src = src;

                // e. Append the request to header,
                //    to trigger browser loading the resource
                head.appendChild(newScript);

                // f. Save the callback id to element
                //    this action for removing callback function after load script
                newScript.jsonpId = jsonpId;

                // g. Binding load event to the jsonp script node
                if (newScript.onreadystatechange !== undefined) {
                    newScript.onload = newScript.onreadystatechange = function() {
                        if (this.readyState === 'complete' || this.readyState === 'loaded') {
                            scriptLoaded(newScript);
                        }
                    };
                } else {
                    //html(newScript).onLoad(scriptLoaded);
                }
                return;
            } // end of JsonP

            // Init XHR object
            var x = new XMLHttpRequest();

            // Open connection to server, with username, password if available
            x.open(method, url, async, username, password);

            // Register statechange event
            x.onreadystatechange = function() {
                if (x.readyState === 4 && x.status === 200) {
                    var res;
                    try {
                        // give parser a try
                        res = parser != null ? parser(x.responseText || x.responseXML) : x.responseText || x.responseXML;
                    } catch (e) {
                        // reject the promise if the parser not work
                        reject('Invalid data type.', x);
                    }
                    // call resolve method when the ajax request success
                    resolve(res);
                } else if (x.readyState === 4 && x.status !== 200) {
                    // call reject method when the ajax request fail
                    reject(x.response, x);
                }
            };

            // Set header for the request if available
            for (var h in header) {
                if (header.hasOwnProperty(h)) {
                    x.setRequestHeader(h, header[h]);
                }
            }

            // Set timeout for the request if available
            if (timeout && timeout > 0) {
                // handle time out exception
                x.timeout = timeout;
                x.ontimeout = function() { reject('timeout', x); };
            }

            // Submit the request
            x.send(data);
        });

        /**
         * JsonP - Cross domain purpose
         * @param {Function} callback - Callback event handler for JsonP
         */
        this.jsonp = function(callback) {
            jsonp = callback;
            return this;
        };

        /*
         * Authenticate request with username and password
         * @param {String} user - Username
         * @param {String} pass - Password
         * @return {html.Promise} Promise of ajax request, for fluent API
         */
        this.authenticate = function(user, pass) {
            username = user;
            password = pass;
            return this;
        };

        /*
         * Set header for a request
         * Extend the header object instead of replace it
         * @param {String|Object} key - Key of header,
         *        or an object that contains key value pairs of header
         * @param {String} arg - Value of header
         * @return {html.Promise} Promise
         */
        this.header = function(key, arg) {
            if (arg !== undefined && typeof key === 'function') {
                header[key] = arg;
            } else {
                html.extend(header, key);
            }
            return this;
        };

        /**
         * Set parser to ajax request
         * @param {Function} p - Parser function
         * @return {html.Promise} Promise
         */
        this.parser = function(p) {
            parser = p;
            return this;
        };

        /**
         * Set timeout to ajax request
         * @param {Number} miliseconds - Milisecond that timeout event occurs
         * @return {html.Promise} Promise
         */
        this.timeout = function(miliseconds) {
            timeout = miliseconds;
            return this;
        };

        this.contentType = function(contentType) {
            html.extend(header, { 'Content-type': contentType });
            return this;
        };

        // Set done and fail method to ajax
        this.done = promise.done;
        this.fail = promise.fail;
    };

    /**
     * Mock ajax request
     * @param {String} url - Url string to mock
     * @param {Object} data - Data that we expect to return
     */
    html.ajax.mock = function(url, data) {
        mockSetup.push({
            url: url,
            data: data
        });
    };

    /**
     * Clear mock data that have been registered
     * @param {String|String[]|undefined} url -
     */
    html.ajax.clearMock = function(url) {
        while (mockSetup.length) {
            mockSetup.pop();
        }
    };

    // create shorthand for request JSON format with 'GET' method
    html.getJSON = function(url, data, async) {
        var query = [];
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                // get all parameters and append to query url
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
        }
        // do ajax request, and pass JSON parser for user
        // return a promise to user
        return html.ajax(query.length ? url + '?' + query.join('&') : url, null, 'GET', async)
            .parser(JSON.parse);
    };

    // create shorthand for request JSON format with 'POST' method
    html.postJSON = function(url, data, async) {
        // do ajax request, and pass JSON parser for user
        // return a promise to user
        return html.ajax(url, JSON.stringify(data), 'POST', async)
            .header({ 'Content-type': 'application/json' })
            .parser(JSON.parse);
    };

    /**
     * Partial loading a view, along with scripts and styles
     * @param {String} url Partial view url
     * @param {String|Element} containerSelector Selector of the container which the partial view append to
     */
    html.partial = function(url, containerSelector) {
        if (containerSelector == null) {
            throw 'containerSelector is null or undefined';
        }

        // 1. Let ele be html context, scripts and doneActions be empty arrays
        var ele = html(containerSelector).context,
            bundle = null, doneActions = [];

        // 2. Call the ajax for loading partial
        var promise = html.ajax(url);

        // 3. After loading partial view
        promise.done(function(view) {
            // a. Empty the element before append partial
            html(ele).empty();

            // b. Append the view to container
            ele.innerHTML = view;

            // c. Remove reference for avoiding memory leak
            ele = null;

            // d. If bundle is not null
            if (bundle != null) {
                // i. Load the script bundle
                var scriptLoaded = html.scripts.render(bundle);

                // ii. When script loaded
                scriptLoaded.done(function() {
                    // execute all done actions callback here
                    doneActions.forEach(function(action) {
                        if (action != null) {
                            action(view);
                        }
                    });
                });
            } else {
                doneActions.forEach(function(action) {
                    if (action != null) {
                        action(view);
                    }
                });
            }
        });

        /**
         * Load bundle/script after load partial
         * @param {String|String[]} scriptBundle - Script bundle to load after partial
         * @return Promise
         */
        promise.scripts = function(scriptBundle) {
            bundle = scriptBundle; // save the bundle
            return promise;
        };

        // override done action
        // we will call all done actions after loading partial view and scripts
        promise.done = function(action) {
            if (typeof action === 'function') {
                // only push the callback to the queue if it is a function
                doneActions.push(action);
            }
            return promise;
        };
        return promise;
    };

})(this.html, this);

/* END OF AJAX MODULE */
/**
 * Document ready implementation
 * https://github.com/addyosmani/jquery.parts/blob/master/jquery.documentReady.js
 */
(function (html, window) {
	'use strict';

	var document = window.document,
		setTimeout = window.setTimeout;

	html.ready = function (callback) {
		registerOrRunCallback(callback);
		bindReady();
	};
	var readyBound = false,
		isReady = false,
		callbackQueue = [],
		registerOrRunCallback = function (callback) {
			if (typeof callback === 'function') {
				callbackQueue.push(callback);
			}
		},
		documentReadyCallback = function () {
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
				document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
			} else {
				// we're here because readyState !== 'loading' in oldIE
				// which is good enough for us to call the DOM ready!
				document.detachEvent('onreadystatechange', DOMContentLoaded);
			}
			documentReady();
		},

		// Handle when the DOM is ready
		documentReady = function () {
			// Make sure that the DOM is not already loaded
			if (!isReady) {
				// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
				if (!document.body) {
					return setTimeout(documentReady, 1);
				}
				// Remember that the DOM is ready
				isReady = true;
				// If there are functions bound, to execute
				documentReadyCallback();
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
			if (document.readyState !== 'loading') {
				documentReady();
			}

			// Mozilla, Opera and webkit nightlies currently support this event
			if (document.addEventListener) {
				// Use the handy event callback
				document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
				// A fallback to window.onload, that will always work
				window.addEventListener('load', DOMContentLoaded, false);
				// If IE event model is used
			} else if (document.attachEvent) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent('onreadystatechange', DOMContentLoaded);
				// A fallback to window.onload, that will always work
				window.attachEvent('onload', DOMContentLoaded);
				// If IE and not a frame
				// continually check to see if the document is ready
				try {
					toplevel = window.frameElement === null;
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
				document.documentElement.doScroll('left');
			} catch (error) {
				setTimeout(doScrollCheck, 1);
				return;
			}
			// and execute any waiting functions
			documentReady();
		};

})(this.html, this);
  /* End Document ready implementation */
;(function (html, window) {
    'use strict';

    var history = window.history,
        location = window.location,
        routes = [],
        ignoredRoutes = [],
        makeRegEx = null;

    // Let makeRegex be a function to create routing pattern
    makeRegEx = function (pattern) {
        var reg = '^' + pattern
            .replace(/\//g, "\\/")
            .replace(/\?/g, "\\?")
            .replace(/:([0-9a-zA-Z-_]*)/g, "([0-9a-zA-Z-_]*)") + '$';
        return new RegExp(reg);
    };

    html.router = {};

    /**
     * Register routing pattern and callback to handle
     * @param {String} pattern Pattern of a route
     * @param [Function] fn Callback function to handle route
     */
    html.router.when = function (pattern, fn) {
        // 1. Check for pattern has been registered yet
        var isPatternRegistered = routes.find(function (r) {
            return r.originalPattern === pattern;
        });

        // 2. If the pattern was not registered
        if (!isPatternRegistered) {
            // a. Register the pattern
            routes.push({
                originalPattern: pattern,
                pattern: makeRegEx(pattern),
                doneActions: [fn]
            });
        } else {
            // throw exception when we found it has been registered
            // this action make developers easier to debug routing
            throw 'Duplicated pattern: ' + pattern + '. Please provide another pattern!';
        }
        return html.router;
    };

    /**
     * Partial loading HTML corresponding to a route
     * After loading HTML file,
     * append it to the first container that has [body] attribute
     * @param {String} url Partial url of HTML file
     * @param {String} [container="[body]"] Container selector
     * @return {Object} html.router
     */
    html.router.partial = function (url, container) {
        if (routes.length === 0) {
            throw 'Expected at least a registered route.';
        }
        routes[routes.length - 1].partialURL = url;
        routes[routes.length - 1].container = container || '[body]';
        return this;
    };

    /**
     * Dyanmic loading JavaScript corresponding to a route
     * @param {String|Array} bundle Bundle script files
     * @return {Object} html.router
     */
    html.router.scripts = function (bundle) {
        if (routes.length === 0) {
            throw 'Expected at least a registered route.';
        }
        routes[routes.length - 1].scripts = routes[routes.length - 1].scripts || [];
        var scripts = routes[routes.length - 1].scripts;
        if (bundle instanceof Array) {
            scripts.push.apply(scripts, bundle);
        } else {
            scripts.push(bundle);
        }
        return this;
    };

    /**
     * Function to execute after running a route
     * @param {Function} action - Callback function to execute
     * @return {Object} html.router
     */
    html.router.done = function (action) {
        if (action == null) {
            throw TypeError('Callback action is null or undefined.');
        }

        // 1. Get route actions in registered routes
        var actions = routes[routes.length - 1].doneActions;

        // 2. Add the action to the list
        actions.push(action);
        return this;
    };

    /**
     * Get route parameters
     */
    html.router.getRouteParam = function () {
        // 1. Let path be the current location
        var path = location.pathname + location.hash;

        // 2. Find the matched route in registered routes
        var route = routes.find(function (r) {
            return r.pattern.test(path);
        });

        // 3. Get all parameters from the url
        var params = path.match(route.pattern);

        // 4. Remove the first match,
        //    it is a redundant matched item contain the whole url
        params.shift();

        // 5. Let context be the result object,
        //    currently it is an empty object
        var context = {};

        // 6. Map the params to context
        var routeParams = route.originalPattern.match(/:(\w*)/g);
        routeParams = routeParams && routeParams.map(function (arg) {
            return arg.replace(':', '');
        });
        if (!routeParams) {
            return null;
        }
        routeParams.forEach(function (key, index) {
            // map the param to context variable
            // e.g context.section = 'homePage';
            // e.g context.pageIndex = '12';
            context[key] = params[index];
        });

        // 7. Return params
        return context;
    };

    /**
     * Ignore a pattern
     * @param {String} pattern - Pattern to ignore
     */
    html.router.ignoreRoute = function (pattern) {
        // 1. Check for the pattern is registered or not
        var isPatternRegistered = routes.find(function (r) { return r.originalPattern === pattern; });

        // 2. If the route has been registered,
        //    throw exception to trace bug
        if (isPatternRegistered) {
            throw 'Pattern has been registered! Please check the routing configuration.';
        }

        // 3. Push the current route to ignored list
        ignoredRoutes.push(makeRegEx(pattern));

        // 4. Return html.router
        return this;
    };

    /**
     * Internal use.
     * Run route callback funcitons
     * @param {Function[]} actions - Route callback functions
     * @param {object[]} params - Parammeters to pass into route callback
     */
    function runRoute(actions, params) {
        actions.forEach(function (action) {
            if (action) {
                action.apply(null, params);
            }
        });
    }

    /**
     * Pre-process a route before dispatch to handler
     * @param {Event} e Event arguments
     */
    function processRoute(e) {
        // Hack for PhantomJs doesn't fully support es5 spec
        if (Array.prototype.find == null) {
            return;
        }
        var path = null,
            isIgnored = null,
            route = null;

        // 1. Let path be the current location URL
        path = location.pathname + location.hash;

        // 2. Check the current location is ignored
        isIgnored = ignoredRoutes.find(function (r) { 
            return r.test(path); 
        });

        // 3. Find the matched route in registered routes
        route = routes.find(function (r) {
            return r.pattern.test(path);
        });

        // 4. If there are no matched route or the route is ignored, return
        if (route == null || isIgnored) {
            return;
        }

        // 5. find all variable matched the pattern
        var params = path.match(route.pattern);

        // 6. Remove the first match,
        //    it is a redundant matched item contain the whole url
        params.shift();

        // 7. If the partial is registered along with route, then
        //    load partial view
        if (route.partialURL) {
            html.partial(route.partialURL, route.container).done(function () {
                // a. Let scripts be route.scripts
                var scripts = route.scripts != null && route.scripts.slice(0);

                // b. When finishing loading partial,
                //    we then load all scripts
                if (scripts != null && scripts.length > 0) {
                    // i. Load script bundles one by one
                    var scriptLoaded = html.scripts.render(scripts.shift());
                    while (scripts.length) {
                        scriptLoaded.then(scripts.shift());
                    }

                    // ii. After all scripts loaded
                    scriptLoaded.done(function () {
                        // Finally, Run the callback with its parameters
                        runRoute(route.doneActions, params);
                    });
                } else {
                    // Run the callback with its parameters
                    runRoute(route.doneActions, params);
                }
            });
        } else {
            // Run the callback with its parameters
            runRoute(route.doneActions, params);
        }
    }

    // Register event for window object, detect url change (hash change or state change)
    // fall back to hash tag change event if window.history is not available
    if (history.pushState) {
        html(window).onPopstate(processRoute);
    } else {
        html(window).onHashchange(processRoute);
    }

    // Process route for the first time loading
    html.ready(function () {
        processRoute();
    });

})(this.html, this);
  /* END OF ROUTER */
;(function (html, window) {
    'use strict';

    var document = window.document,
        scripts = {}, styles = {},
        urlList = [],
        dependencies = [],
        bundleQueue = [],
        callbackQueue = [];

    // create head section if not exists
    var head = document.getElementsByTagName('head')[0] || html(document).head.context;

    // run when a script has been loaded
    // event that script just loaded or loaded in previous bundle
    var dependenciesLoadedCallback = function () {
        // a flag indicating all scripts in a bundle has been loaded
        // we'll check this condition again using urlList
        var isAllLoaded = false, doneCallback;
        if (typeof dependencies === 'string') {
            // if dependency is a script not a bundle
            // check whether the scripts is in loaded urls
            urlList.forEach(function (node) {
                if (node.url === dependencies && node.isLoaded) {
                    // whenever we cant find the dependency
                    // set the flag to be true
                    isAllLoaded = true;
                }
            });
        } else if (dependencies instanceof Array) {
            // if the dependencies are in an array
            // temporarily set the flag to be true
            // set it to false whenever we get a script not loaded
            isAllLoaded = true;
            dependencies.forEach(function (url) {
                var isLoaded = urlList.find(function (x) { return x.url === url && x.isLoaded; });
                if (!isLoaded) {
                    isAllLoaded = false;
                }
            });
        }
        if (isAllLoaded) {
            while (typeof bundleQueue[0] === 'function') {
                doneCallback = bundleQueue.shift();
                // temporarily push to callback queue
                callbackQueue.push(doneCallback);
            }
            if (bundleQueue.length === 0) {
                // when finished render all bundles, execute all done callbacks reversed order
                for (var i = callbackQueue.length - 1; i >= 0; i--) {
                    doneCallback = callbackQueue[i];
                    doneCallback.apply(window, html.module(doneCallback.__requiredModules__) || []);
                }
            }
            // load that bundle
            return html.scripts.render(bundleQueue.shift());
        }
    };

    html.config.allowDuplicate = false;

    // create scripts node, append them to head section of document
    // browser will know how to treat that node says load it and execute
    var createScriptNode = function (url, callback) {
        // check if the script has been loaded?
        var isLoaded = urlList.find(function (x) { return x.url === url; });
        // if the script has been loaded and duplication is not allowed, do nothing
        if (isLoaded && !html.config.allowDuplicate) {
            callback();
            return;
        }

        // if the script hasn't been loaded, create script node
        var node = document.createElement('script');
        // set type of that node to text/javascript
        // this is traditional type
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        // set the url for the script node
        node.async = true;

        var scriptLoaded = function () {
            // remove the node after finish loading
            node.parentElement.removeChild(node);
            // set a flag for url loading tracking state
            urlList.push({ url: url, isLoaded: true });
            // call the callback, so can execute 'then' function
            callback();
        };
        if (node.onreadystatechange !== undefined) {
            node.onload = node.onreadystatechange = function () {
                if (this.readyState === 'complete' || this.readyState === 'loaded') {
                    scriptLoaded();
                }
            };
        } else {
            html(node).onLoad(scriptLoaded);
        }
        node.src = url;
        // append the script node to header, if not, browser doesn't load and execute
        head.appendChild(node);
        return node;
    };

    // create style node, append them to head section of document
    // browser will know how to treat that node says load it and apply the css
    var createStyleNode = function (url) {
        var isLoaded = urlList.find(function (x) { return x.url === url; });
        if (isLoaded && !html.config.allowDuplicate) return;

        var node = document.createElement('link');
        node.type = 'text/css';
        node.rel = 'stylesheet';
        node.href = url;
        node.async = true;
        head.appendChild(node);
        urlList.push({ url: url, isLoaded: true });
        return node;
    };

    html.scripts = function (bundles) {
        html.extend(scripts, bundles);
    };

    html.styles = function (bundles) {
        html.extend(styles, bundles);
    };

    html.scripts.render = function (bundle) {
        // get the script list in the bundle
        var scriptList = scripts[bundle];
        // if the parameter is a script, then assign to scriptList to load
        if (!scriptList) scriptList = bundle;
        if (typeof scriptList === 'string') {
            // if the current script list is just one script
            // set dependencies
            dependencies = scriptList;
            // create script node, when the node has been loaded, run dependenciesLoadedCallback
            // that callback will load the next bundle
            createScriptNode(scriptList, dependenciesLoadedCallback);
        } else if (scriptList.push != null) {
            // if the current script list is an array of scripts
            // set dependencies
            dependencies = scriptList;
            // create script node for each of element in scriptList
            for (var i = 0, j = scriptList.length; i < j; i++) {
                createScriptNode(scriptList[i], dependenciesLoadedCallback);
            }
        }
        return html.scripts;
    };

    html.styles.render = function (bundle) {
        var styleList = styles[bundle];
        if (!styleList) styleList = bundle;
        if (typeof styleList === 'string') {
            createStyleNode(styleList);
        } else if (styleList instanceof Array) {
            for (var i = 0, j = styleList.length; i < j; i++) {
                createStyleNode(styleList[i]);
            }
        }
        return this;
    };

    // append more scripts into the queue to load
    html.scripts.then = function (bundle) {
        // just append the bundle queue
        bundleQueue.push(bundle);
        return html.scripts;
    };

    html.styles.then = function (bundle) {
        return html.styles.render(bundle);
    };

    // callback function - run when all scripts has been loaded
    html.scripts.done = function (callback, requiredModules) {
        bundleQueue.push(callback);
        callback.__requiredModules__ = requiredModules;
        return html.scripts;
    };

    html.require = html.scripts.render;
})(this.html, this);

;(function(html) {
    'use strict';

    var managedObjs = {},
        mockObjs = {};
    // import / export an object to outside environment
    html.module = function(key, obj) {
        if (obj == null) {
            // test if the keys is kind of Array
            // turn it into Array anyway
            var isArr = key instanceof Array,
                res = [];
            key = isArr ? key : [key];
            for (var i = 0, j = key.length; i < j; i++) {
                // get values by its key in managedObjs
                // by default, we will get mock object before get real object
                res.push(mockObjs[key[i]] || managedObjs[key[i]]);
            }
            return isArr ? res : res[0];
        }
        // set the key and value to export
        managedObjs[key] = obj;
        return html;
    };

    // mock a module for testing purpose
    html.mockModule = function(key, obj) {
        mockObjs[key] = obj;
        return html;
    };
})(this.html);
