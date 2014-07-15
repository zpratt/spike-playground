(function (app) {
    app.ns(app, 'AnswerCollection', Backbone.Collection.extend({
        model: app.AnswersModel,
        parse: function(response) {
            return response.items;
        },
        url: 'https://api.stackexchange.com/2.1/answers?pagesize=10&fromdate=1382659200&order=desc&sort=activity&site=stackoverflow&filter=!-.Cac(MY(6Qj'
    }));
}(app));