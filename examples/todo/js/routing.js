html.autoFocus = function (observer) {
    var ele = html.element();
    observer.subscribe(function (newVal, oldVal) {
        if (newVal) {
            html(ele).focus();
        }
    });
    return html;
};

var newTodo = html.data('');

function ToDo (title) {
    var self = this;
    this.text = html.data(title);
    this.completed = html.data(false);
    this.editMode = html.data(false);
    this.editClass = html.data(function () {
        return self.editMode() ? 'editing' : '';
    });
}

var todoList = html.data([]);
var isAllCompleted = html.data(function () {
    if (todoList().length === 0) {
        return false;
    }
    for (var i = 0, j = todoList().length; i < j; i++) {
        if (!todoList()[i].completed()) {
            return false;
        }
    }
    return true;
});


// BINDING
html('ul#todo-list').each(todoList, function (todo) {
    html.li.className(todo.editClass)
        .div.className('view')
            .checkbox(todo.completed).className('toggle').$
            .label.text(todo.text).dblclick(function () {
                todo.editMode(true);
            }).$
            .button.className('destroy').click(function () {
                todoList.remove(todo);
            }).$
        .$
        .form.input(todo.text).className('edit').visible(todo.editMode, true)
        .keydown(function (e) {
            if (e.keyCode === 27) todo.editMode(false);
        })
        .autoFocus(todo.editMode).blur(function () {
            todo.editMode(false);
        }).$
        .submit(function (e) {
            e.preventDefault();
            todo.editMode(false);
        });
});

html('#new-todo').input(newTodo).keypress(function (e) {
    if (e.keyCode !== 13) return;
    todoList.add(new ToDo(newTodo()), 0);
    newTodo('');
});

html('#toggle-all').checkbox(isAllCompleted).click(function () {
    var isChecked = isAllCompleted();
    for (var i = 0, j = todoList().length; i < j; i++) {
        todoList()[i].completed(!isChecked);
    }
});









