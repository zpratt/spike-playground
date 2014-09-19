(function () {
    function init() {
        var router = new app.Hub({
                components: {
                    'thoughts': ['thoughtType'],
                    'question': ['questionType', 'questionId']
                }
            }),

            TestView = Backbone.View.extend({
                initialize: function (options) {
                    this.setElement(options.element);

                    this.listenTo(router, 'thoughts-route-fired', function (params) {
                        this.render('Thought: ' + JSON.stringify(params));
                    });

                    this.listenTo(router, 'question-route-fired', function (params) {
                        this.render('Question: ' + JSON.stringify(params));
                    });
                },

                render: function (data) {
                    this.$el.append('<p>' + data + '</p>');

                    $('body').append(this.$el);
                }
            }),
            testViewFragment = document.createDocumentFragment();

        //$('body').append();
        Backbone.history.start();

        return new TestView({element: testViewFragment});
    }

    init();
}());
