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
