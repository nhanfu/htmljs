html.ready(function () {
	var firstName = html.data('Nhan');
	var lastName = html.data('Nguyen');
	var fullName = html.data(function () {
		return firstName() + ' ' + lastName();
	});
	
	html('#firstName').input(firstName);
	html('#lastName').input(lastName);
	
	// bind to full name
	html('#lblFullName').text(fullName);
	
	window.firstName = firstName;
});

html.ready(function () {
	var smartPhone = html.data('');
    var smartPhoneList = html.data([
		'iPhone6 +',
		'Lumia 930',
		'Xperia 3'
	]);
	
	html('#sm').input(smartPhone);
	
	html('#sml').each(smartPhoneList, function (phone, index) {
		html.li(phone);
	});
	
	html('#add').click(function () {
		if (smartPhone() === '') return;
		smartPhoneList.push(smartPhone());
		smartPhone('');
	});
});

html.ready(function () {
	// DATA
	var Child = function (model) {
		this.Name = html.data(model.Name);
		this.Age = html.data(model.Age);
		this.buttonText = html.data('Edit');
		this.editMode = html.data(false);
	};
	
	var name = html.data('');
	var age = html.data('');
	var editMode = html.data(false);
	
	var children = html.data([
		new Child({Name: 'Anderson', Age: 30})
	]);
	
	var removeChild = function (e, child) {
		children.remove(child);
	};
	var changeEditMode = function (e, child) {
		child.editMode(!child.editMode());
		child.buttonText(child.editMode()? 'Save': 'Edit');
	};
	
	// BINDING
	html('#children').each(children, function (child, index) {
		html.li()
			.span('Name: ').$()
			.span(child.Name).hidden(child.editMode).$()
			.input(child.Name).visible(child.editMode).$()
			.span('Age: ').$()
			.span(child.Age).hidden(child.editMode).$()
			.input(child.Age).visible(child.editMode).$()
			.button('Delete').click(removeChild, child).$()
			.button().text(child.buttonText).click(changeEditMode, child).$();
	});
	html('#addChild').click(function () {
		children.add(new Child({Name: name(), Age: age()}));
		name(''); age('');
	});
	html('#name').input(name);
	html('#age').input(age);
	html('#search').searchbox(children);
});