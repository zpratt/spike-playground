(function(global) {
    'use strict';

    function ns (parentNamespace, nsString, extent) {
        var namespaceParts = nsString.split('.'),
            hlq = 'app',
            parent = parentNamespace,
            i;

        if (namespaceParts[0] === hlq) {
            namespaceParts = namespaceParts.slice(0);
        }

        for (i = 0; i < namespaceParts.length; i += 1) {
            if (parent[namespaceParts[i]] === undefined) {
                if (extent) {
                    parent[namespaceParts[i]] = extent;
                } else {
                    parent[namespaceParts[i]] = {};
                }
            }

            parent = parent[namespaceParts[i]];
        }

        return parent;
    }

    function bindNS (parentNamespace, namespaceString, extent) {
        ns.apply(this, [parentNamespace, namespaceString, extent]);
    }

    global.app = {
        ns: ns,
        bindNS: bindNS
    };

}(this));

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

/*global app Backbone $*/
(function (app) {
    'use strict';

    app.ns(app, 'AnswerCollection', Backbone.Collection.extend({
        model: app.AnswersModel,

        initialize: function () {
            this.loaded = new $.Deferred();
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

/** @jsx React.DOM */
(function (app) {
    'use strict';

    app.ns(app, 'AnswerItemView', React.createClass({
        render: function () {
            var postHref = this.props.model.get('link'),
                title = this.props.model.get('title');
            return React.DOM.li(null, React.DOM.a({href: postHref}, title));
        }
    }));
}(app));
/** @jsx React.DOM */
(function (app) {
    'use strict';

    var AnswerItemView = app.AnswerItemView,
        answerCollection = new app.AnswerCollection(),

        AnswerListView = React.createClass({displayName: 'AnswerListView',
            getInitialState: function () {
                return {
                    posts: {}
                };
            },
            componentDidMount: function () {
                this.props.collection.loaded.done(_.bind(function () {
                    this.setState({
                        posts: this.props.collection.loaded.state()
                    });
                }, this));
            },
            render: function() {
                var entries = [];
                if (this.props.collection.loaded.state() === 'pending') {
                    return React.DOM.li(null, "Loading");
                } else {
                    entries = this.props.collection.map(function (model) {
                        return AnswerItemView({model: model});
                    });
                }

                return React.DOM.ul({id: "post-list"}, entries);
            }
        });

    answerCollection.fetch();
    React.renderComponent(AnswerListView({collection: answerCollection}), document.getElementById('main-container'));
}(app));

//# sourceMappingURL=react.js.map