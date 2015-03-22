(function (html) {
    'use strict';
    
    html.require('js/ViewModel.js').then('js/customEvents.js').done(function () {
        var ViewModel = html.module('ViewModel'), // get ViewModel class
            vm = new ViewModel();                 // create a new instance of ViewModel
        
        // export vm instance for routing
        html.module('vm', vm);
        html('#new-todo').input(vm.newToDo).pressEnter(vm.addNew);
        html('#toggle-all').checkbox(vm.isAllCompleted).click(vm.toggleAll);
        html('#itemText').text(vm.itemText);
        html('#todo-count strong').text(vm.itemLeft);
        html('#footer').visible(vm.itemCount, true);
        html('#main').visible(vm.itemCount, true);
        html('#showAll').className(html.data(function () {
            return vm.section() === '' ? 'selected' : '';
        }));
        html('#showActive').className(html.data(function () {
            return vm.section() === 'active' ? 'selected' : '';
        }));
        html('#showCompleted').className(html.data(function () {
            return vm.section() === 'completed' ? 'selected' : '';
        }));
        html('#clear-completed').click(vm.clearCompleted).visible(vm.completedCount, true);
        html('#itemCount').text(vm.itemCount);
        
        // binding data and event for new to do list
        // $() is end of a control binding
        html('#todo-list').each(vm.todoList, function (item) {
            html.li().className(item.editingClass).className(item.completedClass).visible(item.isShown, true)
                .div().addClass('View')
                    .checkbox(item.completed)
                        .click(vm.saveChanges)
                        .click(item.checkChange)
                        .addClass('toggle').hidden(item.editingClass).$()
                    .label(item.title).dblclick(item.showEditor).hidden(item.editMode, true).$()
                    .button().addClass('destroy').click(vm.deleteTask, item).$()
                .$()
                .input(item.title)
                    .addClass('edit')
                    .visible(item.editMode, true)
                    .pressEscape(item.revertChange)
                    .pressEnter(item.saveChange)
                    .blur(item.saveChange)
                .$();
        });
    });
})(window.html);