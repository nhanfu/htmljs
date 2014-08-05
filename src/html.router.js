/* ROUTER
 * https://github.com/addyosmani/jquery.parts/blob/master/jquery.documentReady.js
 */
(function () {
    var _html = this,
        routes  = _html.array([]);
    var router = this.router = function(path, fn) {
        if(!fn) {
            window.history.pushState(null, null, path);
            process(path);
        }
        routes.push({path: path, fn: fn});
    };
    
    var process = function() {
        var path = window.location.pathname;
        //handle map route here
        var route = routes.where(function(r){ return r.path === path; });
        route.fn();
    };
    
    _html(document).click(function(e) {
        debugger;
        var aTags = _html.query('a[href]');
        window.history.pushState(null, null, ele.href);
    });
    
    window.addEventListener('popstate', process);

}).call(html);
/* END OF ROUTER */

html.router('user', function() {
    console.log('user');
});

html.router('about', function() {
    console.log('about');
});

html.router('user');