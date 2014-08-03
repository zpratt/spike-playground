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