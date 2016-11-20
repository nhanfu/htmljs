html(document).onDOMContentLoaded(function () {
	var firstName = html.observable('Nhan');
	var lastName = html.observable('Nguyen');
	var fullName = html.observable(function () {
		return firstName() + ' ' + lastName();
	});
	
	html('#firstName').value(firstName);
	html('#lastName').value(lastName);
	
	// bind to full name
	html('#lblFullName').text(fullName);
	
	window.firstName = firstName;
});

html(document).onDOMContentLoaded(function () {
	var smartPhone = html.observable('');
    var smartPhoneList = html.observableArray([
		'iPhone6 +',
		'Lumia 930',
		'Xperia 3'
	]);
	
	html('#sm').value(smartPhone);
	
	html('#sml').each(smartPhoneList, function (phone, index) {
		html.li(phone);
	});
	
	html('#add').click(function () {
		if (smartPhone() === '') return;
		smartPhoneList.push(smartPhone());
		smartPhone('');
	});
});

html(document).onDOMContentLoaded(function () {
	// DATA
	var Child = function (model) {
		this.Name = html.observable(model.Name);
		this.Age = html.observable(model.Age);
		this.buttonText = html.observable('Edit');
		this.editMode = html.observable(false);
	};
	
	var name = html.observable('');
	var age = html.observable('');
	var editMode = html.observable(false);
	
	var children = html.observableArray([
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
			.value(child.Name).visible(child.editMode).$()
			.span('Age: ').$()
			.span(child.Age).hidden(child.editMode).$()
			.value(child.Age).visible(child.editMode).$()
			.button('Delete').click(removeChild, child).$()
			.button().text(child.buttonText).click(changeEditMode, child).$();
	});
	html('#addChild').click(function () {
		children.add(new Child({Name: name(), Age: age()}));
		name(''); age('');
	});
	html('#name').value(name);
	html('#age').value(age);
	html('#search').searchbox(children);
});