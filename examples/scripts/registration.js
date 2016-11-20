html.displayErrorMessage = function(validationResults, observer, input){
    //callback when validation finish
    var error = validationResults.firstOrDefault(function(i){return i.isValid === false;});
    if(error){
        input.style.color = 'red';
        input.setAttribute('data-toggle', 'popover');
        input.setAttribute('data-content', error.message);
        $(input).popover('show');
        $(input).parent().prev().css('color', 'red');
    } else {
        input.style.color = 'black';
        input.title = '';
        input.removeAttribute('data-toggle');
        input.removeAttribute('data-content');
        $(input).popover('destroy');
        $(input).parent().prev().css('color', '');
    }
};

html.maximumLength = function (observer, maxLength) {
    var ele = html.element(),
        startPosition,
        endPosition;
    html.keydown(function () {
        startPosition = ele.selectionStart;
        endPosition = ele.selectionEnd;
    });
    observer.subscribe(function (newVal, oldVal) {
        if (observer().length > maxLength) {
            observer(oldVal);
            ele.selectionStart = startPosition;
            ele.selectionEnd = endPosition;
        }
    });
};

html.scripts.render('../html-ui/datepicker.js').done(function () {
    html.observable.validation.availableName = function (message) {
        var self = this;
        self.validate(function(newValue, oldValue) {
            html.getJSON('./resources/existNames.json')
                .done(function (names) {
                    if (names.indexOf(html.trim(newValue)) < 0) {
                        self.setValidationResult(true, message);
                    } else {
                        self.setValidationResult(false, message);
                    }
                });
        });
        return self;
    };

    var Step1 = function(model) {
        var self = this;
        this.login = html.observable('')
            .required('Login info is required.')
            .availableName('This name is not available.')
            .delay(300);
        this.email = html.observable('').required('Email is required.').isEmail('Must be a valid email.').delay(300);
        this.password = html.observable('')
            .required('Password is required.')
            .minLength(6, 'Password must contain at least 6 characters')
            .delay(300)
            .subscribe(function(val) {
                self.confirmation.isDirty() && self.confirmation.validate();
            });
        this.confirmation = html.observable('')
            .required('Password confirmation is required.')
            .equal(this.password, 'Password confirmation not matched.')
            .delay(300);
    };

    var Step2 = function(model) {
        var self = this;
        this.name = html.observable('').required('Name is required.');
        this.lastName = html.observable('').required('Last name is required.');
        this.dateOfBirth = html.observable('').required('Date of birth is requried.')
        this.gender = html.observable('').required('Gender is required.');
        this.comment = html.observable('');
        this.charLeft = html.observable(function() {
            var length = self.comment().length;
            return length <= 520? 520 - length: 0;
        });
    };

    var Step3 = function(model) {
        var self = this;
        this.phoneNo = html.observable('');
        this.phoneNo.pattern = '(999) 999-99-99';
        this.phoneNo.maskInputRequired(this.phoneNo.pattern,'Phone number is required.');
        this.country = html.observable('').required('Country is required.');
        this.city = html.observable('').required('City is requried.')
        this.address = html.observable('').required('Address is required.');
        this.address2 = html.observable('');
        this.address2Enabled = html.observable(function() {
            return self.address.isValid();
        });
        //this.address.setDependency(this.address2Enabled);
        this.socialNetwork = html.observableArray(['', 'Facebook', 'Twitter', 'Instagram', 'Google+']);
        this.selectedSocialNetwork = html.observable('').required('Social network is required');
    };

    var ViewModel = function () {
        var self = this;
        this.checkStepValid = function (stepNumber) {
            stepNumber = stepNumber || self.step();
            var step = self['step' + stepNumber],
                result = true;
            for (var prop in step) {
                if(!step[prop].isValid) continue;
                var isValid = step[prop].isValid();
                if (step[prop].validators.length > 0 && !isValid) {
                    result = false;
                    break;
                }
            }
            return result;
        };
        this.step = html.observable(1);

        // events
        this.nextStepClick = function (e) {
            vm.step(vm.step() + 1);
            html.navigate('#step' + vm.step());
            var step = self['step' + vm.step()];
            for (var prop in step) {
                step[prop].isValid(null);
            }
        };
        this.step1 = new Step1;
        this.step2 = new Step2;
        this.step3 = new Step3;

        this.nextStepEnabled = html.observable(function () {
            return self.checkStepValid(self.step());
        });
    };

    var vm = new ViewModel;
    window.vm = vm;

    /* BINDING DATA TO VIEW */
    (function(vm) {
        $('form > div').hide();
        $('form > div').first().show();
        html('#next').click(vm.nextStepClick).enable(vm.nextStepEnabled);

        // step1
        html('#txtLogin').value(vm.step1.login);
        html('#txtEmail').value(vm.step1.email);
        html('#txtPassword').value(vm.step1.password);
        html('#txtPasswordConfirmation').value(vm.step1.confirmation);

        // step2
        html('#txtName').value(vm.step2.name);
        html('#txtLastName').value(vm.step2.lastName);
        html.datepicker(vm.step2.dateOfBirth).value(html.id.txtDoB).autoClose(true);
        html('#txtGender').value(vm.step2.gender);
        vm.step2.comment.displayError = false;
        html('#txtComment').textarea(vm.step2.comment).maximumLength(vm.step2.comment, 520);
        html('#charLeft').text(vm.step2.charLeft);

        // step3
        html('#txtPhone').maskInput(vm.step3.phoneNo, vm.step3.phoneNo.pattern);
        html('#txtCountry').value(vm.step3.country);
        html('#txtCity').value(vm.step3.city);
        html('#txtAddress').value(vm.step3.address);
        html('#txtAddress2').value(vm.step3.address2).enable(vm.step3.address2Enabled);
        html('#ddlSocialNetwork').dropdown(vm.step3.socialNetwork, vm.step3.selectedSocialNetwork);
    })(vm);

    /* ROUTING */
    html.router.when(location.pathname + '#step:step', function(step) {
        step = parseInt(step);
        if(step > 1 && !vm.checkStepValid(step - 1)) {
            html.navigate('#step' + (step - 1));
            // show error message when the previous step is not valid
            var models = vm['step' + (step - 1)];
            for (var i in models) {
                models[i].validate();
            }
            $('.html-error').first().prev().focus();
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
                html(html.id.txtLogin).focus(); break;
            case 2:
                html(html.id.txtName).focus();
                break;
            case 3:
                html(html.id.txtPhone).focus(); break;
            case 4:
                $('#lastStep').show();
                html(html.id.lastStep).empty().tbody
                    .tr.td.text('Login').$td.td.text(vm.step1.login).$tr
                    .tr.td.text('Email').$td.td.text(vm.step1.email).$tr

                    .tr.td.text('Name').$td.td.text(vm.step2.name).$tr
                    .tr.td.text('Last Name').$td.td.text(vm.step2.lastName).$tr
                    .tr.td.text('Date of Birth').$td.td.text(vm.step2.dateOfBirth).$tr
                    .tr.td.text('Gender').$td.td.text(vm.step2.gender).$tr
                    .tr.td.text('Additional Comments').$td.td.text(vm.step2.comment).$tr

                    .tr.td.text('Phone Number').$td.td.text(vm.step3.phoneNo).$tr
                    .tr.td.text('Country').$td.td.text(vm.step3.country).$tr
                    .tr.td.text('City').$td.td.text(vm.step3.city).$tr
                    .tr.td.text('Address').$td.td.text(vm.step3.address).$tr
                    .tr.td.text('Address 2').$td.td.text(vm.step3.address2).$tr
                    .tr.td.text('Social Network').$td.td.text(vm.step3.selectedSocialNetwork).$tr;

                localStorage.userInfo = JSON.stringify(html.serialize(vm));
                break;
        }
    });
    /* END OF ROUTING */
});
/* END OF BINDING DATA */