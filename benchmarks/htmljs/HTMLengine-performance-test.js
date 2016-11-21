//html.config.lazyInput = true;
var ViewModel = function (model) {
    var self = this;
	self.performanceTest = html.observable('Fell free to press key.');
    self.children = html.observableArray(model.Children);
    self.Counter = html.observable(function(){
        return self.children.data.length;
    });

    self.numberOfChildren = html.observable(5000);
    self.timer = html.observable(0);
    self.addChildren = function () {
        var start = new Date;
        for(var i = 0, j = self.numberOfChildren.data; i < j; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
        var stop = new Date;
        self.timer.data = stop-start;
    }

    self.CheckAll = html.observable(function () {
		if(!self.children.data.length) return false;
        var res = true;
        for(var i = 0, j = self.children.data.length; i < j; i++) {
            // We have to loop through all item to register dependencies
            if(!self.children.data[i].checked.data) {
                res = false;
            }
        }
        return res;
    });
	self.CheckAll_Changed = function (e) {
		var checked = this.checked === true;
		for(var i = 0, j = self.children.data.length; i < j; i++){
            self.children.data[i].checked.data = checked;
        }
	};
	self.DeletePerson = function (event, data) {
		self.children.remove(data);
	};

    self.deleteAll = function (data, event) {
		for (var i = 0 , j = self.children.data.length; i < j; i++) {
			if (self.children.data[i].checked.data) {
				self.children.removeAt(i);
				i--; j--;
			}
		}
	};
};

var Person = function(person){
    var self = this;
    this.Name = html.observable(person.Name);
    this.Age = html.observable(person.Age);
    this.DisplayName = html.observable(function(){
        return 'Name: '+ self.Name.data + ' Age: ' + self.Age.data;
    });
    this.checked = html.observable(person.checked);
    this.time = new Date;
    this.timeFormat = html.observable(function(){
        return self.time.toLocaleTimeString();
    });
    this.increaseAge = function(data, e){
        self.Age.data++;
    };
};
var test = new ViewModel({
    FirstName: 'Nhan', LastName: 'Nguyen', Title: 'Developer', Children:
       [new Person({ Name: 'Andrew', Age: 50, checked: true }),
        new Person({ Name: 'Peter', Age: 15, checked: true }),
        new Person({ Name: 'Andrew', Age: 10, checked: true }),
        new Person({ Name: 'Andrew', Age: 10, checked: false }),
        new Person({ Name: 'Jackson', Age: 20, checked: true })]
});

html(document.body, test)
    // .searchbox(test.children).attr({placeholder: 'Searching...'}).$.br
    .checkbox(test.CheckAll).attr({id: 'checkAll'}).onClick(test.CheckAll_Changed).$
	.value(test.CheckAll).$
    .span.text(test.Counter).$;

html('#numberOfChildren').value(test.numberOfChildren);
html('#addChildren').onClick(test.addChildren);
html('#timeCounter').text(test.timer);
html('span.pt').text(test.performanceTest);
html('input.pt').value(test.performanceTest);


html(document.body)
	.div.attr({title: 'This is my title', id: 'abc'})
		.each(test.children, function(model, index){
            html.div
                .span.text(index).$
                .checkbox(model.checked).$
                .span.text('Name: ').$.span.text(model.Name).$.span.text(' ').$
                .span.text('Age: ').$.span.text(model.Age).$
                .input.value(model.Name).$
                .input.value(model.Age).$
                .span.text('Render at: ').$.span.text(model.timeFormat).$
				.button.text('Delete').className('delete').onClick(test.DeletePerson, model).$
				.br
            .$;
        }).$;

html('#deleteAll').onClick(test.deleteAll).$;

//a = html.serialize(test);
//console.log(a);
//var orderedList = test.children.orderBy({field: 'Name', isAsc: false}, {field: 'Age', isAsc: false});
//console.log(html.serialize(orderedList));
//var orderedList = test.children.orderBy({field: 'Name', isAsc: true}, {field: 'Age', isAsc: true}, {field: 'checked', isAsc: false});
//console.log(html.serialize(orderedList));
//var orderedList = test.children.orderBy('Name', 'Age', 'checked');
//console.log(html.serialize(orderedList));
// test.children.orderBy('Name', 'Age', 'checked');
