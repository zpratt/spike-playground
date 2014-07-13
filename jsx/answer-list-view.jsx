/** @jsx React.DOM */
(function () {
    'use strict';

    var AnswerListView = React.createClass({
        getInitialState: function () {
            return {
                posts: {}
            };
        },
        componentDidMount: function () {
            var self = this;
            this.props.data.fetch({
                success: function(collection) {
                    self.setState({
                        posts: collection
                    });
                }
            });
        },
        render: function() {
            var post = 'loading';
            var entries = [];
            if (_.isEmpty(this.state.posts)) {
                post = 'loading';
                return <li>Loading</li>;
            } else {
                entries = _.map(this.state.posts.models, function (model) {
                    return <AnswerItemView href={model.attributes.link} text={model.attributes.owner.display_name} />;
                });
            }

            return <ul id="post-list">{entries}</ul>;
        }
    });

    var AnswerItemView = React.createClass({
        render: function () {
            return <li><a href={this.props.href}>{this.props.text}</a></li>;
        }
    });

    React.renderComponent(<AnswerListView data={new AnswerCollection()} />, document.getElementById('main-container'));
}());