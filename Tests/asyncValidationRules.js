html.data.validation.asyncRequired1 = function(message) {
    var self = this;
    self.validate(function(newValue, oldValue) {
        setTimeout(function() {
            if (newValue === undefined || newValue === null || newValue === '') {
                self.setValidationResult(false, message);
            }
        }, 5);
    });
    return this;
};

html.data.validation.asyncRequired2 = function(message) {
    var self = this;
    self.validate(function(newValue, oldValue) {
        html.ajax('requireMessage.json')
            .done(function(message) {
                if (newValue === undefined || newValue === null || newValue === '') {
                    self.setValidationResult(false, message);
                }
            });
    });
    return this;
};