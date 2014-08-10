//html.config.lazyInput = true;
var ViewModel = function (model) {
    var self = this;
	self.CurrentDate = html.data(new Date);
	self.divClss = html.data('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    self.txtFirstName = html.data(model.FirstName);
    self.txtLastName = html.data(model.LastName);
    self.txtTitle = html.data(model.Title);
    self.children = html.data(model.Children);
    self.FullName = html.data(function () {
        return self.txtLastName() + ' ' + self.txtFirstName();
    });
    self.Counter = html.data(function(){
        return self.children().length;
    });
    self.TotalAge = html.data(function () {
        var totalAge = 0;
        for(var i = 0, j = self.children().length; i < j; i++){
            totalAge += parseInt(html.getData(self.children()[i].Age));
        }
        return totalAge;
    });
    self.WholeFamily = html.data(function() {
        var names = '';
        for(var i = 0, j = self.children().length; i < j; i++){
            names += html.getData(self.children()[i].Name) + ' ';
        }
        return names;
    });
    self.replaceByAPerson = function (data, event) {
		self.children.add(new Person({Name: 'Nhan', Age: 25, checked: true}));
		self.refresh();
    }
    self.addMore1000 = function(){
        for(var i=  0; i < 1000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
        self.Counter.refresh();
    }
	self.add1000 = function(data, event){
		for(var i=  0; i < 1000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
    self.add2000 = function(data, event){
		//self.children([]);
		for(var i=  0; i < 2000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
    self.add3000 = function(data, event){
		for(var i=  0; i < 3000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
    self.add6000 = function(data, event){
		for(var i=  0; i < 6000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
    self.add10000 = function(data, event){
		for(var i=  0; i < 10000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
	self.add100000 = function(data, event){
		for(var i=  0; i < 100000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
	self.checkChange = function(){
		self.CheckAll.refresh();
	};
    self.CheckAll = html.data(function(){
		if(!self.children().length) return false;
        for(var i = 0, j = self.children().length; i < j; i++){
            if(!self.children()[i].checked())
                return false;
        }
        return true;
    });
	self.CheckAll_Changed = function(e){
		var checked = this.checked === true;
		for(var i = 0, j = self.children().length; i < j; i++){
            self.children()[i].checked(checked);
        }
        //self.CheckAll.refresh();
	};
	self.DeletePerson = function(event, data){
		self.children.remove(data);
        //self.Counter.refresh();
        //self.CheckAll.refresh();
	}
    
    self.deleteAll = function(data, event){
		self.children().where(function(x){return x.checked();}).each(function(x){
            self.children.remove(x);
        });
	}
};

var Person = function(person){
    var self = this;
    this.Name = html.data(person.Name);
    this.Age = html.data(person.Age);
    this.DisplayName = html.data(function(){
        return 'Name: '+ self.Name() + ' Age: ' + self.Age();
    });
    this.checked = html.data(person.checked);
    this.time = new Date;
    this.timeFormat = html.data(function(){
        return self.time.toLocaleTimeString();
    });
    this.increaseAge = function(data, e){
        self.Age(self.Age()+1);
        self.DisplayName.refresh();
    };
};
var test = new ViewModel({
    FirstName: 'Nhan', LastName: 'Nguyen', Title: 'Developer', Children:
       [new Person({ Name: 'Adrew', Age: 50, checked: true }),
        new Person({ Name: 'Peter', Age: 15, checked: true }),
        new Person({ Name: 'Adrew', Age: 10, checked: true }),
        new Person({ Name: 'Adrew', Age: 10, checked: false }),
        new Person({ Name: 'Jackson', Age: 20, checked: true })]
});

html.render(document.body, test)
    .searchbox(test.children).attr({placeholder: 'Searching...'}).$().br()
    .checkbox(test.CheckAll).id('checkAll').click(test.CheckAll_Changed).$()
	.input(test.CheckAll).$()
    .span(test.Counter).$();
	
	
html(document.body)
	.div().clss(test.divClss).attr({title: 'This is my title'})
		.each(test.children, function(model, index){
            html.span(index).$()
                .checkbox(model.checked).click(test.checkChange).f5(test).$()
                .span('Name: ').$().span(model.Name).$().space(1)
                .span('Age: ').$().span(model.Age).$()
                .input(model.Name).$()
                .input(model.Age).$()
                .span('Render at: ').$().span(model.timeFormat).$()
				.button('Delete').clss('delete').click(test.DeletePerson, model).f5(test).$()
				.br();
        })
    .$()
    .button('Add 1.000 children').click(test.addMore1000).f5(test).$()
    .button('1.000 children').click(test.add1000).f5(test).$()
    .button('2.000 children').click(test.add2000).f5(test).$()
    .button('3.000 children').click(test.add3000).f5(test).$()
	.br().span('Large data').$().br()
    .button('6.000 children').click(test.add6000).f5(test).$()
	.button('10.000 children').click(test.add10000).f5(test).$()
    .button('100.000 children').click(test.add100000).f5(test).$();

html.get('#deleteAll').click(test.deleteAll).f5(test);
//a = html.serialize(test);
//console.log(a);
//var orderedList = test.children().orderBy({field: 'Name', isAsc: false}, {field: 'Age', isAsc: false});
//console.log(html.serialize(orderedList));
//var orderedList = test.children().orderBy({field: 'Name', isAsc: true}, {field: 'Age', isAsc: true}, {field: 'checked', isAsc: false});
//console.log(html.serialize(orderedList));
//var orderedList = test.children().orderBy('Name', 'Age', 'checked');
//console.log(html.serialize(orderedList));
test.children.orderBy('Name', 'Age', 'checked');