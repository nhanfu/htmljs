html.require('js/ViewModel.js').then('js/customEvents.js').done(function (ViewModel) {
    'use strict';
    // create a new instance of ViewModel
    var vm = new ViewModel();
    // export vm instance for routing
    html.module('vm', vm);
    html('#new-todo').value(vm.newToDo).pressEnter(vm.addNew);
    html('#toggle-all').checkbox(vm.isAllCompleted).click(vm.toggleAll);
    html(html.id.itemText).text(vm.itemText);
    html('#todo-count strong').text(vm.itemLeft);
    html(html.id.footer).visible(vm.itemCount, true);
    html(html.id.main).visible(vm.itemCount, true);
    html(html.id.showAll).className(html.observable(function () {
        return vm.section() === '' || vm.section() === 'all' ? 'selected' : '';
    }));
    html(html.id.showActive).className(html.observable(function () {
        return vm.section() === 'active' ? 'selected' : '';
    }));
    html(html.id.showCompleted).className(html.observable(function () {
        return vm.section() === 'completed' ? 'selected' : '';
    }));
    html('#clear-completed').click(vm.clearCompleted).visible(vm.completedCount, true);
    html(html.id.itemCount).text(vm.itemCount);
    
    // binding data and event for new to do list
    // $ is end of a control binding
    html('#todo-list').each(vm.todoList, function (item) {
        html.li.className(item.editingClass).className(item.completedClass).visible(item.isShown, true)
            .div.addClass('View')
                .checkbox(item.completed)
                    .click(vm.saveChanges)
                    .click(item.checkChange)
                    .addClass('toggle').hidden(item.editingClass).$
                .label.text(item.title).dblclick(item.showEditor).hidden(item.editMode, true).$
                .button.addClass('destroy').click(vm.deleteTask, item).$
            .$
            .value(item.title)
                .addClass('edit')
                .visible(item.editMode, true)
                .pressEscape(item.revertChange)
                .pressEnter(item.saveChange)
                .blur(item.saveChange)
                .autoFocus(item.editMode)
            .$;
    });
}, ['ViewModel']);