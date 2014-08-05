/* ROUTER
 * https://github.com/addyosmani/jquery.parts/blob/master/jquery.documentReady.js
 */
(function () {    
    var _html   = this,
        origin  = window.location.origin || window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: ''),
        routes  = _html.array([]);
    var router = this.router = function(pattern, fn) {
        if(!fn) {
            window.history.pushState(null, null, pattern);
            process(pattern);
        } else {
            var isPatternRegistered = routes.any(function(r){ return r.originalPattern === pattern; });
            if(!isPatternRegistered) {
                var realPattern = new RegExp('^' + pattern.replace(/\//g, "\\/").replace(/:(\w*)/g,"(\\w*)") + '$');
                routes.push({originalPattern: pattern, pattern: realPattern, fn: fn});
            } else {
                throw 'Duplicated pattern: ' + pattern + '. Please provide another pattern!';
            }
        }
    };
    
    var process = function() {
        var path = window.location.pathname.replace(origin, '');
        var route = routes.firstOrDefault(function(r){ return r.pattern.test(path); });
        if(route) {
            var paramKeys = _html.array(route.originalPattern.match(/:(\w*)/g)).each(function(arg){ return arg.replace(':', ''); });
            var params = path.match(route.pattern);
            params.shift();
            route.fn.apply(window, params);
        }
    };
    
    _html(document).click(function(e) {
        var a = e.target || e.srcElement;
        if(a && a.nodeName && a.nodeName.toLowerCase() === 'a') {
            window.history.pushState(null, null, a.getAttribute('href'));
            process(a.getAttribute('href'));
        }
    });
    
    window.addEventListener('popstate', process);

}).call(html);
/* END OF ROUTER */

html.router('/user', function() {
    console.log('user');
});

html.router('/about', function() {
    html('#qunit').empty()
        .span('Nhan 1').$()
        .span('Nguyen').$();
});

html.router('/user/:id/:sub', function(id, sub) {
    html('#qunit').empty()
        .input(id).$()
        .span(sub).$();
});

html(document.body).a('Route to user', '/user/123/456').$().br().a('Route to about', '/about').$();