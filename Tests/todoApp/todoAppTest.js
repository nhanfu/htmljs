var vm = html.module('view-model');

module('ToDo App test');
test('No Todos', function () {
    // clear all to do items
    // UI should hide footer and main
    // we have no way but clear the model
    // other tests should trigger event in UI
    vm.todoList([]);
    stop();
    setTimeout(function () {
        equal(html('#main').css('display'), 'none', 'Should hide the #main');
        equal(html('#footer').css('display'), 'none', 'Should hide the #footer');
        start();
    },10);
});

test('New Todo', function () {
    // set the value for new-todo model
    vm.newToDo('   Interview     ');
    var newTodo = html('#new-todo').$$();
    
    equal(html('#new-todo').$$().value, '   Interview     ', 'Should change the #new-todo value');
    
    // trigger add new to do item function
    vm.addNew();
    
    equal(html('#todo-list li').$$().innerHTML, '<div class=\"View\"><input type=\"checkbox\" ' +
        'class=\"toggle\" style=\"visibility: visible;\"><label style=\"display: inline;\">Interview' +
        '</label><button class=\"destroy\"></button></div><input class=\"edit\" style=\"display: none;\">',
        'Should allow me to add todo items');
    equal(html('#new-todo').$$().value, '', 'Should clear text input field when an item is added');
    equal(html('#todo-list li label').$$().innerHTML, 'Interview', 'Should trim text input');
    
    stop();
    setTimeout(function () {
        equal(html('#main').css('display'), 'block', 'Should show the #main');
        equal(html('#footer').css('display'), 'block', 'Should show the #footer');
        start();
    }, 10);
});

test('Mark all as complete', function () {
    // clear all items before testing
    vm.todoList([]);
    
    vm.newToDo('   Interview     ');
    vm.addNew();
    vm.newToDo('   Programming     ');
    vm.addNew();
    
    // trigger click event on "toggle all" checkbox
    // this time will mark all items as completed
    html('#toggle-all').click();
    html.query('#todo-list li input[type="checkbox"]').each(function (chk) {
        equal(chk.checked, true, 'Should allow me to mark all items as completed');
    });
    // trigger click event on "toggle all" checkbox
    // this time will mark all items as not completed
    html('#toggle-all').click();
    html.query('#todo-list li input[type="checkbox"]').each(function (chk) {
        equal(chk.checked, false, 'Should allow me to clear the completion state of all items');
    });
    stop();
    // click on all check boxes, complete them all
    html.query('#todo-list li input[type="checkbox"]').each(function (chk) {
        html(chk).click();
    });
    setTimeout(function () {
        equal(html('#toggle-all').$$().checked, true, 'Complete all checkbox should update state when items are completed');
        start();
    }, 10);
});

test('Item', function () {
    // clear all items before testing
    vm.todoList([]);
    
    vm.newToDo('   Interview     ');
    vm.addNew();
    vm.newToDo('   Programming     ');
    vm.addNew();
    
    // trigger click on the first checkbox
    html('#todo-list li input[type="checkbox"]').click();
    equal(html('#todo-list li input[type="checkbox"]').$$().checked, true, 'Should allow me to mark items as complete.');
    html('#todo-list li input[type="checkbox"]').click();
    equal(html('#todo-list li input[type="checkbox"]').$$().checked, false, 'Should allow me to un-mark items as complete.');
    
    html('#todo-list li label').dblclick();
    equal(html('#todo-list li > input').css('display'), 'inline-block', 'Should allow me to edit an item.');
    
    html('#todo-list li button').click();
    equal(html('#todo-list').$$().innerHTML, '<li style=\"display: list-item;\">' + 
        '<div class=\"View\"><input type=\"checkbox\" class=\"toggle\" style=\"visibility: visible;\">' + 
        '<label style=\"display: inline;\">Programming</label><button class=\"destroy\"></button></div>' +
        '<input class=\"edit\" style=\"display: none;\"></li>', 'Should allow me to delete an item.');
});

test('Editing', function () {
    // clear all items before testing
    vm.todoList([]);
    
    vm.newToDo('   Interview     ');
    vm.addNew();
    vm.newToDo('   Programming     ');
    vm.addNew();
    
    // trigger dblclick on the label
    
    html('#todo-list li label').dblclick();
    stop();
    setTimeout(function () {
        equal(html('#todo-list li input[type="checkbox"]').css('visibility'), 'hidden', 'Should hide other controls when editing.');
        equal(html('#todo-list li > input').css('visibility'), 'visible', 'Should show the editor when double click on label.');
        start();
        
        // change the input
        html('#todo-list li > input').$$().value = 'Another task';
        // trigger blur event, before that trigger change event of the input for notifying change
        html.change().blur();
        equal(html('#todo-list li label').$$().innerHTML, 'Another task', 'Should save edits on blur.');;
    });
});