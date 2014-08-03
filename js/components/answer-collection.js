(function (app) {
    app.ns(app, 'AnswerCollection', Backbone.Collection.extend({
        model: app.AnswersModel,

        initialize: function () {
            this.loaded = $.Deferred();
        },

        fetch: function () {
            var jqXHR = Backbone.Collection.prototype.fetch.apply(this, arguments);

            jqXHR.done(this.loaded.resolve);
            jqXHR.fail(this.loaded.reject);
        },

        parse: function(response) {
            return response.items;
        },
        url: 'http://api.stackexchange.com/2.2/tags/reactjs/faq?site=stackoverflow'
    }));
}(app));