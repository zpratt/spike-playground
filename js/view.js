/** @jsx React.DOM */
(function () {
    'use strict';

    var AnswerItemView = React.createClass({displayName: 'AnswerItemView',
        /*getInitialState: function () {

        },*/
        render: function () {
            return React.DOM.li(null, "hello");
        }
    });
}());
/** @jsx React.DOM */
(function () {
    'use strict';

    var AnswerListView = React.createClass({displayName: 'AnswerListView',
        getInitialState: function () {
            return {
                posts: {}
            };
        },
        componentDidMount: function () {
            var self = this;
            self.props.data.fetch({
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
                return React.DOM.li(null, "Loading");
            } else {
                entries = _.map(this.state.posts.models, function (model) {
                    return AnswerItemView( {href:model.attributes.link, text:model.attributes.owner.display_name} );
                });
            }

            return React.DOM.ul( {id:"post-list"}, entries);
        }
    });

    var AnswerItemView = React.createClass({displayName: 'AnswerItemView',
        render: function () {
            return React.DOM.li(null, React.DOM.a( {href:this.props.href}, this.props.text));
        }
    });

    React.renderComponent(AnswerListView( {data:new AnswerCollection()} ), document.getElementById('main-container'));
}());