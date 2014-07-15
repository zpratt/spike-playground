(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        initialize: function () {  },
        defaults: {
            score: 0
        },
        parse: function(response) {
            for(key in response) {
                this[key] = response[key];
            }
            return this;
        }
    }));
}(app));