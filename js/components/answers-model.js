/*global app Backbone*/
(function (app) {
    'use strict';

    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        defaults: {
            'x_coord': 0,
            'y_coord': 0
        },

        initialize: function () {  }
    }));
}(app));
