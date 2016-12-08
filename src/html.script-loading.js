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
