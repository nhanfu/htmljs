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