// We can use this file indenpendently
// If html wasn't added, it would add some functions as global  
;(function(html, window) {
  'use strict';

  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
  (function () {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vendors[x] + 'CancelAnimationFrame']) || 
          (window[vendors[x] + 'CancelRequestAnimationFrame']);
      }

      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function () { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };
      }

      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
          window.clearTimeout(id);
        };
      }
  }());

  function isPropertiesEnumerable(x) {
    return typeof x === 'object' && x != null && !(x instanceof Date);
  }

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

  // Let computedStack be an empty array
  // We'll use this to track the stack of observable data,
  // to register dependencies for computed property
  var computedStack = [],
    exeStack = [];

  /**
   * Observable data, implementation of observer pattern
   * @constructor
   * @see https://en.wikipedia.org/wiki/Observer_pattern
   * @param {Object} data Data to be observed
   */
  html.observable = function (data) {
    // Make sure to return a new instance of html.observable
    // regardless of using "new" keyword
    if (!(this instanceof html.observable)) {
      return new html.observable(data);
    }

    // Keep a reference to context
    var self = this;

    /** Get and set underlying without side effect */
    this._newData = null;

    /** Save a reference to the function of computed value */
    this._computedFn = null;

    /** Old data of the observable object, internal use */
    this._oldData = null;

    /** Subscribers that listen to data changes */
    this.subscribers = [];

    /** All validation rules */
    this.rules = [];

    /** Save a list of input/textarea element. This is helpful for validation and error handling */
    this.bindingNodes = [];

    /** All references to observable objects what depend on this */
    this.dependencies = [];

    /**
     * Is valid state, default be null, not validated state <br /> 
     * NOTE: Null is different from valid and invalid state
     */
    this.isValid = null;

    /** Delay time */
    this.delayTime = null;

    if (typeof data === 'function') {
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
    this.setDependency = function (dependency) {
      // Get index of dependency,
      // to check duplicate
      var index = self.dependencies.indexOf(dependency);
      // If the dependency is not in the dependency list, then
      if (index < 0 && dependency !== self) {
        // push it to the list
        self.dependencies.push(dependency);
      }
    };

    /***
     * Getter - Get observable data
     */
    function get() {
      var res;
      if (self._computedFn != null) { // assume that _computedFn always be a function if it's not null
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
    }

    /***
     * Setter - Set data to observable and notify change as well as dependencies
     * {Object} data - Data to set
     */
    function set(data) {
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
    }

    // Shorthand for getter and setter
    Object.defineProperty(self, 'data', {
      get: get,
      set: set
    });

    /**
     * Subscribe change to observable data.
     * Whenever the underlaying data changes,
     * it trigger all subscribed functions
     * @param  {Function} observer Observer
     */
    this.subscribe = function (subscriber) {
      if (self.subscribers.indexOf(subscriber) < 0) {
        self.subscribers.push(subscriber);
      }
      return self;
    };

    /***
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
    this.notify = function () {
      // If the data is not computed and no delay time, then
      if (self._computedFn == null && self.delayTime == null) {
        // Notify change immediately
        notify();
        return;
      }
      window.cancelAnimationFrame(waitForLastChange);
      waitForLastChange = window.requestAnimationFrame(function () {
        notify();
      }, self.delayTime);
    };

    /**
     * Set delay time of notifying changes
     * @param {Number} time Delay time (miliseconds)
     */
    this.delay = function (time) {
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
    this.validators = function (rule) {
      // Simply push the rule to rule list
      self.rules.push(rule);
    };

    /**
     * Validate data against validators
     */
    this.validate = function () {
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
   * @constructor
   * @extends html.observable
   * @param {Array} arr Array data to observe
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
    this.notify = function (listItem, item, index, action) {
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
    this.push = function (item) {
      self.add(item);
    };

    /**
     * Add an item into an observable array
     * @param {Object} item  Item to add
     * @param {Number} index Index to add
     */
    this.add = function (item, index) {
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
    this.remove = function (item) {
      var index = self._newData.indexOf(item);
      self.removeAt(index);
    };

    /**
     * Remove an item from the list
     * @param  {Number} index Index of removed item
     */
    this.removeAt = function (index) {
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
    this.update = function (item, index) {
      self._newData[index] = item;
      self.notify(self._newData, item, index, 'udpate');
    };
  };

  // Inherit html.observable prototype
  html.observableArray.prototype = Object.create(html.observable.prototype);

  /**
   * Serialize observable data to pure JSON. This method is for submitting data to server.
   * @param {html.observable|Object} rootObj Observable object
   * @param {Function} [serializer] Callback to handle seializing
   * @return {Object|Array} Pure JSON data
   */
  html.serialize = function (rootObj) {
    // Unwrap data
    rootObj = rootObj.subscribe ? rootObj._newData : rootObj;
    if (rootObj == null) {
      return rootObj;
    }

    // Let isList be true if root object is an array
    var isList = rootObj instanceof Array;

    // Initialize result based on root obj type
    var result = isList ? [] : {};

    // Check that root object should be loop through properties
    // we don't use propertyIsEnumerable because it's not trusted
    // go through all objects that are primitive type like Date, String, null, undefined, Number, etc
    var hasProps = isPropertiesEnumerable(rootObj) || rootObj != null;

    // If root object doesn't have any properties, return rootObj
    if (!hasProps) {
      return rootObj;
    }

    // Loop through properties of rootObj
    // NOTE: we iterate all properties of object as well as indices of Array
    for (var i in rootObj) {
      if (rootObj[i] && rootObj[i].subscribe && !rootObj[i].add) {
        // If it is an observable but not an observableArray, then
        // get underlying data value
        var newData = rootObj[i]._newData;

        // Assign underlying to result
        result[i] = !isPropertiesEnumerable(newData) ? newData : html.unwrapData(rootObj[i]);
      } else {
        // Recursively serialize child object
        result[i] = html.serialize(rootObj[i]);
      }
    }

    // If rootObj is an array
    if (isList) {
      i = 0;
      // loop through element
      for (var j = rootObj.length; i < j; i++) {
        // assign to result and then apply serialize recursively
        result[i] = html.serialize(rootObj[i]);
      }
    }

    return result;
  };

})(this.html || this, this);
