/** @jsx React.DOM */
(function (app) {
    'use strict';

    var AnswerItemView = app.AnswerItemView,
        answerCollection = new app.AnswerCollection(),

        AnswerListView = React.createClass({
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
                    return <li>Loading</li>;
                } else {
                    entries = this.props.collection.map(function (model) {
                        return <AnswerItemView model={model} />;
                    });
                }

                return <ul id="post-list">{entries}</ul>;
            }
        });

    answerCollection.fetch();
    React.renderComponent(<AnswerListView collection={answerCollection} />, document.getElementById('main-container'));
}(app));