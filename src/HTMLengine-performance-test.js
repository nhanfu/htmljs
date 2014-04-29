var ViewModel = function (model) {
    var self = this;
	self.CurrentDate = HTML.data(new Date);
	self.divClss = HTML.data('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    self.txtFirstName = HTML.data(model.FirstName);
    self.txtLastName = HTML.data(model.LastName);
    self.txtTitle = HTML.data(model.Title);
    self.children = HTML.data(model.Children);
    self.FullName = HTML.data(function () {
        return self.txtLastName() + ' ' + self.txtFirstName();
    });
    self.Counter = HTML.data(function(){
        return self.children().length;
    });
    self.TotalAge = HTML.data(function () {
        var totalAge = 0;
        for(var i = 0, j = self.children().length; i < j; i++){
            totalAge += parseInt(HTML.getData(self.children()[i].Age));
        }
        return totalAge;
    });
    self.WholeFamily = HTML.data(function() {
        var names = '';
        for(var i = 0, j = self.children().length; i < j; i++){
            names += HTML.getData(self.children()[i].Name) + ' ';
        }
        return names;
    });
    self.replaceByAPerson = function (data, event) {
		self.children.push(new Person({Name: 'Nhan', Age: 25, checked: true}));
		self.refresh();
    }
    self.push1000 = function(){
        for(var i=  0; i < 1000; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
        self.Counter.refresh();
        self.Counter.refresh();
        //self.refresh();
    }
	self.add1000 = function(data, event){
        self.children([]);
		for(var i=  0; i < 1000; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
		//self.WholeFamily.refresh();
        self.Counter.refresh();
		self.CheckAll.refresh();
	};
    self.add2000 = function(data, event){
        self.children([]);
		for(var i=  0; i < 2000; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
    self.add3000 = function(data, event){
        self.children([]);
		for(var i=  0; i < 3000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
    self.add6000 = function(data, event){
        self.children([]);
		for(var i=  0; i < 6000; i++){
			self.children.add(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
    self.add10000 = function(data, event){
        self.children([]);
        var children = [];
		for(var i=  0; i < 10000; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
	};
	self.checkChange = function(){
		self.CheckAll.refresh();
	};
    self.CheckAll = HTML.data(function(){
		if(!self.children().length) return false;
        for(var i = 0, j = self.children().length; i < j; i++){
            if(!self.children()[i].checked())
                return false;
        }
        return true;
    });
	self.CheckAll_Changed = function(value, e){
		var ele = e.srcElement || e.target;
		var checked = ele.checked === true;
		for(var i = 0, j = self.children().length; i < j; i++){
            self.children()[i].checked(checked);
        }
	};
	self.DeletePerson = function(data, event){
		self.children.remove(data);
	}
    self.shouldDisplay = HTML.data(true);
    self.displayClick = function(d, e){
        self.shouldDisplay(!self.shouldDisplay());
    }
};

var Person = function(person){
    var self = this;
    this.Name = HTML.data(person.Name);
    this.Age = HTML.data(person.Age);
    this.DisplayName = HTML.data(function(){
        return 'Name: '+ self.Name() + ' Age: ' + self.Age();
    });
    this.checked = HTML.data(person.checked);
    this.time = new Date;
    this.timeFormat = HTML.data(function(){
        return self.time.toLocaleTimeString();
    });
    this.increaseAge = function(data, e){
        self.Age(self.Age()+1);
        self.DisplayName.refresh();
    };
};
var test = new ViewModel({
    FirstName: 'Nhan', LastName: 'Nguyen', Title: 'Developer', Children:
       [new Person({ Name: 'Adrew', Age: 10, checked: true }),
        new Person({ Name: 'Peter', Age: 15, checked: true }),
        new Person({ Name: 'Jackson', Age: 20, checked: true })]
});

HTML.render(document.body)
    .checkbox(test.CheckAll).change(test.CheckAll_Changed).$()
	.input(test.CheckAll).$()
    .span(test.Counter).$()
    .button('toggle').click(test.displayClick).$().br()
    .div().clss(test.divClss).attr({title: 'This is my title'}).id('ddd').visible(test.shouldDisplay)
        .each(test.children, function(model, index){
            HTML.render(this)
                .span(index).$()
                .checkbox(model.checked).change(test.checkChange).$()
                .span(model.DisplayName).$()
                .input(model.Name).refreshChange(model).$()
                .input(model.Age).refreshChange(model).$()
                .span('Render at: ').$().span(model.timeFormat).$()
                .button('Delete').click(test.DeletePerson, model).refreshChange(test).$()
                .br();
        })
    .$()
    .button('Add 1.000 children').click(test.push1000).$()
    .button('1.000 children').click(test.add1000).$()
    .button('2.000 children').click(test.add2000).$()
    .button('3.000 children').id('del').click(test.add3000).$()
    .button('6.000 children').click(test.add6000).$()
    .button('10.000 children').click(test.add10000).$()
.$$();