/* CUSTOM CONTROL */
html.datepicker = function(observedDate) {
    //get the current element of html engine.
    var currentElem = this.element();  
    html.input(observedDate);
    //bind that element to bootstrap datepicker
    var datepicker = $(currentElem).datepicker({format:'dd/mm/yyyy'})
    
    //register change event to update observedDate
    datepicker.on('changeDate', function(e){  
        observedDate($(currentElem).data('datepicker').date);
        //html(this).change();
    });
    
    //subscribe to observedDate
    //so that we can change the datepicker control by setting observerdDate's value
    observedDate.subscribe(function(val) {
        var widget = $(currentElem).data("datepicker");
        if (widget) {
            widget.date = val;
            if (widget.date) {
                widget.setValue(widget.date);
            }
        }
    });
    
    //return this (html object) for fluent API
    return this;
};

html.maskInput = function (observer, pattern, errorHandler) {
    html.input(observer, errorHandler);
    $(html.$$()).mask(pattern);
    $(html.$$()).on('blur.mask', function(e) {
        html(this).change();
    });
};

html.data.validation.maskInputRequired = function(pattern, message) {
    this.validate(function(newVal, oldVal) {
        newVal = html.trim(newVal);
        if (!html.isNotNull(newVal) || newVal === '' || newVal.replace(/_/g, '9') == pattern) {
            this.setValidationResult(false, message);
        } else {
            this.setValidationResult(true);
        }
    });
};

/* END CUSTOM CONTROL */