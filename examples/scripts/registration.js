var Step1 = function(model) {
    var self = this;
    this.login = html.data('').required('Login info is required.');
    this.email = html.data('').required('Email is required.').isEmail('Must be a valid email.');
    this.password = html.data('').required('Password is required.').subscribe(function(val) {
        self.confirmation.validate();
    });
    this.confirmation = html.data('').equal(this.password, 'Password confirmation not matched.');
};

var Step2 = function(model) {
    var self = this;
    this.name = html.data('').required('Name is required.');
    this.lastName = html.data('').required('Last name is required.');
    this.dateOfBirth = html.data('').required('Date of birth is requried.')
    this.gender = html.data('').required('Gender is required.'); 
    this.comment = html.data('').maxLength(520,'Max length is 520.').validate().subscribe(function(newVal, oldVal) {
        if (newVal.length > 520) {
            self.comment(oldVal);
        }
    });;
    this.charLeft = html.data(function() {
        var length = self.comment().length;
        return length <= 520? 520 - length: 0;
    });
};

var Step3 = function(model) {
    var self = this;
    this.phoneNo = html.data('');
    this.phoneNo.pattern = '(999) 999-99-99';
    this.phoneNo.maskInputRequired(this.phoneNo.pattern,'Phone number is required.');
    this.country = html.data('').required('Country is required.');
    this.city = html.data('').required('City is requried.')
    this.address = html.data('').required('Address is required.'); 
    this.address2 = html.data('');
    this.address2Enabled = html.data(function() {
        return self.address.isValid();
    });
	//this.address.setDependency(this.address2Enabled);
    this.socialNetwork = html.data(['Facebook', 'Twitter', 'Instagram', 'Google+']);
    this.selectedSocialNetwork = html.data('Facebook');
};

var ViewModel = function () {
    var self = this;
    this.checkStepValid = function (step) {
        var step = self['step' + step];
        for (var prop in step) {
            if(!step[prop].isValid) continue;
            var isValid = step[prop].isValid();
            if(!isValid) {
                return false;
            }
        }
        return true;
    };
    this.activeNextStep = function() {
        self.checkStepValid(vm.step())? self.nextStepEnabled(true): self.nextStepEnabled(false);
    };
    this.step = html.data(1);
    this.nextStepEnabled = html.data(false);
    
    // events
    this.nextStepClick = function(e) {
        vm.step(vm.step() + 1);
        html.navigate('#step' + vm.step());
    };
    this.step1 = new Step1;
    this.step2 = new Step2;
    this.step3 = new Step3;
};

var vm = new ViewModel;

/* BINDING DATA TO VIEW */
(function(vm) {
	for (var i in vm.step1) {
		vm.step1[i].setValidationHandler(vm.activeNextStep);
	}
	for (var i in vm.step2) {
		vm.step2[i].setValidationHandler(vm.activeNextStep);
	}
	for (var i in vm.step3) {
		if (i !== 'address2' && i !== 'socialNetwork' && i !== 'selectedSocialNetwork')
			vm.step3[i].setValidationHandler(vm.activeNextStep);
	}
    $('form > div').hide();
    $('form > div').first().show();
    html('#next').click(vm.nextStepClick).enable(vm.nextStepEnabled);
    
    // step1
    html('#txtLogin').input(vm.step1.login);
    html('#txtEmail').input(vm.step1.email);
    html('#txtPassword').input(vm.step1.password);
    html('#txtPasswordConfirmation').input(vm.step1.confirmation);
    
    // step2
    html('#txtName').input(vm.step2.name);
    html('#txtLastName').input(vm.step2.lastName);
    html('#txtDoB').datepicker(vm.step2.dateOfBirth);
    html('#txtGender').input(vm.step2.gender);
    html('#txtComment').input(vm.step2.comment);
    html('#charLeft').text(vm.step2.charLeft);
    
    // step3
    html('#txtPhone').maskInput(vm.step3.phoneNo, vm.step3.phoneNo.pattern);
    html('#txtCountry').input(vm.step3.country);
    html('#txtCity').input(vm.step3.city);
    html('#txtAddress').input(vm.step3.address);
    html('#txtAddress2').input(vm.step3.address2).enable(vm.step3.address2Enabled);
    html('#ddlSocialNetwork').dropdown(vm.step3.socialNetwork, vm.step3.selectedSocialNetwork);
})(vm);

/* END OF BINDING DATA */

/* ROUTING */
	html.ignoreRoute(':homepage.html');
    html.router('#step:step', function(step) {
        step = parseInt(step);
        if(step > 1 && !vm.checkStepValid(step - 1)) {
            html.navigate('#step' + (step - 1));
            return;
        }
        vm.step(step);
        
        $('#lastStep').hide();
        $('form > div').hide();
        if (step==4) {
            $('div.main').hide();
        } else {
            $('div.main').show();
            $('#step' + step).show();
        }
        $('ol.breadcrumb li a').removeClass('btn btn-sm btn-info');
        $('a[href="#step' + vm.step() + '"]').addClass('btn btn-sm btn-info');
        switch (vm.step()) {
            case 1:
                html('#txtLogin').focus(); break;
            case 2:
                html('#txtName').focus();
                break;
            case 3:
                html('#txtPhone').focus(); break;
            case 4:
                $('#lastStep').show();
                html('#lastStep').empty().tbody()
                    .tr().td('Login').$('tr').td(vm.step1.login).$('tbody')
                    .tr().td('Email').$('tr').td(vm.step1.email).$('tbody')
                    
                    .tr().td('Name').$('tr').td(vm.step2.name).$('tbody')                    
                    .tr().td('Last Name').$('tr').td(vm.step2.lastName).$('tbody')                    
                    .tr().td('Date of Birth').$('tr').td(vm.step2.dateOfBirth).$('tbody')                    
                    .tr().td('Gender').$('tr').td(vm.step2.gender).$('tbody')                    
                    .tr().td('Additional Comments').$('tr').td(vm.step2.comment).$('tbody')
                    
                    .tr().td('Phone Number').$('tr').td(vm.step3.phoneNo).$('tbody')
                    .tr().td('Country').$('tr').td(vm.step3.country).$('tbody')
                    .tr().td('City').$('tr').td(vm.step3.city).$('tbody')
                    .tr().td('Address').$('tr').td(vm.step3.address).$('tbody')
                    .tr().td('Address 2').$('tr').td(vm.step3.address2).$('tbody')
                    .tr().td('Social Network').$('tr').td(vm.step3.selectedSocialNetwork).$('tbody');
                    
                localStorage.userInfo = JSON.stringify(html.serialize(vm));
                break;
        }
    });
/* END OF ROUTING */