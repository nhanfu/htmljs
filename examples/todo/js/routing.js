html.scripts({
    binding: '/htmljs/examples/todo/js/binding.js',
    ViewModel: '/htmljs/examples/todo/js/ViewModel.js',
    storage: '/htmljs/examples/todo/js/localStorage.js'
});

html.require('binding').done(function () {
    'use strict';
    var vm = html.module('vm');
    html.router.when(location.pathname + '#/:section', function (section) {
        vm.section(section);
        vm.showItems();
    });
    html.router.process();
});