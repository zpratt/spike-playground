var AnswersModel = (function() {
    return Backbone.Model.extend({
        initialize: function () {  },
        defaults: {
            score: 0
        },
        parse: function(response, options) {
            for(key in response) {
                this[key] = response[key];
            }
            return this;
        }
    });
}());