(function (html) {
    'use strict';
    
    /* ROUTING */
    html.require('js/binding.js').done(function () {
        var vm = html.module('vm');
        html.router('#/:section', function (section) {
            vm.section(section);
            vm.showItems();
        });
        html.router.process();
    });
    /* END OF ROUTING */
})(window.html);