/** @jsx React.DOM */
(function (app) {
    'use strict';

    Backbone.Events.on('map-idle', function () {
        var element = document.createElement('div'),
            ContentView,

            location = new google.maps.LatLng(40.01144663490021, -90.22767623046876),
            marker = new app.CompositeMarker(element, location);

        $(element).css('position', 'absolute');

        ContentView = React.createClass({
            getInitialState: function () {
                return {
                    posts: {}
                };
            },
            componentDidMount: function () {
            },
            render: function() {
                return <p>Hey, {this.props.name}</p>;
            }
        });

        React.renderComponent(<ContentView name={'Hello World'} />, element);

        marker.setMap(app.map);
    });
}(app));
