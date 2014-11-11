var ViewModel = function (model) {
    var self = this;
    self.txtFirstName = ko.observable(model.FirstName);
    self.txtLastName = ko.observable(model.LastName);
    self.txtTitle = ko.observable(model.Title);
    self.children = ko.observableArray(model.Children);
    self.FullName = ko.computed(function () {
        return self.txtLastName() + ' ' + self.txtFirstName();
    });
    self.Counter = ko.computed(function(){
        return self.children().length;
    });
    
    self.replaceByAPerson = function (data, event) {
		self.children.push(new Person({Name: 'Nhan', Age: 25, checked: true}));
		self.refresh();
    }
    self.add1 = function(data, event){
        self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
    };
	self.add1000 = function(data, event){
        self.children([]);
		for(var i=  0; i < 1000; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
        alert('done');
	};
    self.add2000 = function(data, event){
        self.children([]);
		for(var i=  0; i < 2000; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
        alert('done');
	};
    self.add3000 = function(data, event){
        self.children([]);
		for(var i=  0; i < 3000; i++){
			self.children.push(new Person({Name: 'Nhan', Age: 25, checked: false}));
		}
        alert('done');
	};
    self.CheckAll = ko.computed({
        read: function(){
            if(!self.children().length) return false;
            for(var i = 0, j = self.children().length; i < j; i++){
                if(!self.children()[i].checked())
                    return false;
            }
            return true;
        },
        write: function(value){
            for(var i = 0, j = self.children().length; i < j; i++){
                self.children()[i].checked(value);
            }
        }
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
};

var Person = function(person){
    var self = this;
    this.Name = ko.observable(person.Name);
    this.Age = ko.observable(person.Age);
    this.DisplayName = ko.computed(function(){
        return 'Name: '+ self.Name() + ' Age: ' + self.Age();
    });
    this.checked = ko.observable(person.checked);
    this.time = new Date;
    this.timeFormat = ko.computed(function(){
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

ko.applyBindings(test);