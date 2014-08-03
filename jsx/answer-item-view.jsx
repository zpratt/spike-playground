/** @jsx React.DOM */
(function (app) {
    'use strict';

    app.ns(app, 'AnswerItemView', React.createClass({
        render: function () {
            var postHref = this.props.model.get('link'),
                title = this.props.model.get('title');
            return <li><a href={postHref}>{title}</a></li>;
        }
    }));
}(app));