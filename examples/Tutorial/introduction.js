// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    var self = this;
    this.firstName = html.data("Bert");
    this.lastName = html.data("Bertington");

    this.fullName = html.data(function() {
        return self.firstName() + " " + self.lastName();    
    });

    this.capitalizeLastName = function() {
        var currentVal = self.lastName();        // Read the current value
        self.lastName(currentVal.toUpperCase()); // Write back a modified value
        self.fullName.f5();
    };    
}

var vm = new AppViewModel();

html.render(document.body)
    .div().attr({test: 'test'})
        .span('First name: ').$().span(vm.firstName).$().br()
        .span('Last name: ').$().span(vm.lastName).$()
    .$()
    .div().attr({test2: 'test'})
        .span('First name: ').$().input(vm.firstName).f5(vm).$().br()
        .span('Last name: ').$().input(vm.lastName).f5(vm).$()
    .$()
    .div()
        .span('Full name: ').$().span(vm.fullName).$()
    .$()
    .button('Capitalize last name').click(vm.capitalizeLastName).$()
    
    alert(html.querySelector('div[test2="test"]').innerHTML);
    
    