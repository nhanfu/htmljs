/* SETUP MOCK STORAGE */
(function () {
    'use strict';
    
    html.scripts({
        ViewModel: '/htmljs/examples/todo/js/ViewModel.js',
        storage: '/htmljs/examples/todo/js/localStorage.js'
    });

    var mockLocalStorage = {
        getFromLocalStorage: function () {
            return mockLocalStorage.todos;
        },
        saveToLocalStorage: function (todos) {
            mockLocalStorage.todos = todos;
        }
    };
    html.mockModule('storage', mockLocalStorage);
})();
/* END OF SET UP */

html.require('ViewModel').done(function (ViewModel) {
    'use strict';
    var vm = new ViewModel();
    
    module('Test ViewModel');
    test('No Todos', function () {
        equal(vm.itemCount(), 0, 'should hide #main and #footer');
    });
    
    test('Add new', function () {
        vm.newToDo('Interview');
        vm.addNew();
        equal(vm.todoList().length, 1, 'should allow me to add todo items');
        equal(vm.todoList()[0].title(), 'Interview', 'should trim text input');
        equal(vm.newToDo(), '', 'should clear text input field when an item is added');
        equal(vm.itemCount(), 1, 'should show #main and #footer when items added');
    });
    
    test('Mark all as completed', function () {
        vm.newToDo('Programming');
        vm.addNew();
        
        vm.todoList()[0].completed(true);
        vm.todoList()[1].completed(true);
        ok(true, 'should allow me to mark all items as completed');
        ok(vm.isAllCompleted() === true, 'complete all checkbox should update state when items are completed');
        vm.todoList()[0].completed(false);
        vm.todoList()[1].completed(false);
        ok(true, 'should allow me to clear the completion state of all items');
        vm.toggleAll();
        ok(vm.todoList()[0].completed() === true && vm.todoList()[1].completed() === true, 'should complete all items when click on toggle checkbox');
    });
    
    
// resolve ViewModel symbol
}, ['ViewModel']);