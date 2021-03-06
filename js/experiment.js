/** @jsx React.DOM */
(function (app) {
    'use strict';

    var mapIdleDeferred;

    function main() {
        var element = document.createElement('div'),
            ContentView,

            location = new google.maps.LatLng(40.01144663490021, -90.22767623046876),
            marker = new app.CompositeMarker(element, location);

        $(element).css('position', 'absolute');

        ContentView = React.createClass({displayName: 'ContentView',
            getInitialState: function () {
                return {
                    posts: {}
                };
            },
            componentDidMount: function () {
            },
            render: function() {
                return React.DOM.p(null, "Hey, ", this.props.name);
            }
        });

        React.renderComponent(ContentView({name: 'Hello World'}), element);

        marker.setMap(app.map);
    }

    function init() {
        mapIdleDeferred = $.Deferred();

        Backbone.Events.once('map-idle', function () {
            mapIdleDeferred.resolve();
        });

        mapIdleDeferred.done(main);
    }

    init();
}(app));
