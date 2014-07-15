/** @jsx React.DOM */
(function (app) {
    'use strict';

    app.ns(app, 'AnswerItemView', React.createClass({
        render: function () {
            return <li><a href={this.props.href}>{this.props.text}</a></li>;
        }
    }));
}(app));