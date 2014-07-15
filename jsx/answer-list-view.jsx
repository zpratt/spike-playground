/** @jsx React.DOM */
(function (app) {
    'use strict';

    var AnswerItemView = app.AnswerItemView,
        AnswerListView = React.createClass({
        getInitialState: function () {
            return {
                posts: {}
            };
        },
        componentDidMount: function () {
            this.props.data.fetch().done(_.bind(function () {
                this.setState({
                    posts: this.props.data
                });
            }, this));
        },
        render: function() {
            var post = 'loading';
            var entries = [];
            if (_.isEmpty(this.state.posts)) {
                return <li>Loading</li>;
            } else {
                entries = this.state.posts.map(function (model) {
                    return <AnswerItemView href={model.attributes.link} text={model.attributes.owner.display_name} />;
                });
            }

            return <ul id="post-list">{entries}</ul>;
        }
    });

    React.renderComponent(<AnswerListView data={new app.AnswerCollection()} />, document.getElementById('main-container'));
}(app));