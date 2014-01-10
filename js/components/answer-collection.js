var AnswerCollection = (function() {
    'use strict';

    return Backbone.Collection.extend({
        model: AnswersModel,
        parse: function(response) {
            return response.items;
        },
        url: 'https://api.stackexchange.com/2.1/answers?pagesize=10&fromdate=1382659200&order=desc&sort=activity&site=stackoverflow&filter=!-.Cac(MY(6Qj'
    });
}());
