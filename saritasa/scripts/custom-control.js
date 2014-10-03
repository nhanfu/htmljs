/* CUSTOM CONTROL */
html.datepicker = function(observedDate) {
    //get the current element of html engine.
    var currentElem = this.element();  
    
    //bind that element to bootstrap datepicker
    var datepicker = $(currentElem).datepicker({format:'dd/mm/yyyy'})
    
    //register change event to update observedDate
    datepicker.on('changeDate', function(e){  
        observedDate($(currentElem).data('datepicker').date);
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
/* END CUSTOM CONTROL */