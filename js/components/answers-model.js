(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        initialize: function () {  },
        defaults: {
            score: 0
        },
        parse: function(response) {
            console.log(JSON.stringify(response));
            for(key in response) {
                this[key] = response[key];
            }
            return this;
        }
    }));
}(app));