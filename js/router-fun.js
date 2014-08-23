(function () {
    function init() {
        var Router = Backbone.Router.extend({
                initialize: function (options) {
                    var routeSpec = '';

                    this.components = options.components;
                    this.routeParams = {};

                    _.each(this.components, function (value, key) {
                        routeSpec += '(' + key + '/:' + value.join('/:') + ')(/)';

                        _.each(value, function (item) {
                            this.routeParams[item] = key;
                        }, this);
                    }, this);

                    this.route(routeSpec, 'component', this.broadcast);
                },
                broadcast: function () {
                    var routeParts = _.keys(this.routeParams),
                        matched = {},
                        targetComponents = {};

                    _.each(arguments, function (param, index) {
                        var paramName = routeParts[index],
                            targetComponent = this.routeParams[paramName],
                            target;

                        if (param) {
                            if (!targetComponents[targetComponent]) {
                                target = targetComponents[targetComponent] = {};
                            } else {
                                target = targetComponents[targetComponent];
                            }

                            target[paramName] = param;

                            matched[paramName + ':' + param] = targetComponent;
                        }

                    }, this);

                    _.each(targetComponents, function (value, key) {
                        this.trigger(key + '-route-fired', value);
                    }, this);
                }
            }),
            router = new Router({
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
