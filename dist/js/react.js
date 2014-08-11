(function(global) {
    'use strict';

    function ns (parent_ns, ns_string, extent) {
        var ns_parts = ns_string.split('.'),
            hlq = 'app',
            parent = parent_ns,
            i;

        if (ns_parts[0] === hlq) {
            ns_parts = ns_parts.slice(0);
        }

        for (i = 0; i < ns_parts.length; i += 1) {
            if (parent[ns_parts[i]] === undefined) {
                if (extent) {
                    parent[ns_parts[i]] = extent;
                } else {
                    parent[ns_parts[i]] = {};
                }
            }

            parent = parent[ns_parts[i]];
        }

        return parent;
    }

    function bindNS (parent_ns, ns_string, extent) {
        ns.apply(this, [parent_ns, ns_string, extent]);
    }

    global.app = {
        ns: ns,
        bindNS: bindNS
    };

}(this));
;(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        defaults: {
            'x_coord': 0,
            'y_coord': 0
        },

        initialize: function () {  }
    }));
}(app));;(function (app) {
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
}(app));;/** @jsx React.DOM */
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
            if ('pending' === this.props.collection.loaded.state()) {
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