html.require('js/binding.js').done(function () {
    'use strict';
    var vm = html.module('vm');
    html.router('#/:section', function (section) {
        vm.section(section);
        vm.showItems();
    });
    html.router.process();
});