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

(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        defaults: {
            'x_coord': 0,
            'y_coord': 0
        },

        initialize: function () {  }
    }));
}(app));
(function (app) {
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
}(app));
(function (app) {
    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(40.01144663490021, -90.22767623046876),
            zoom: 7
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);

        app.ns(app, 'map', map);

        google.maps.event.addListener(map, 'idle', function () {
            Backbone.Events.trigger('map-idle');
        });

        google.maps.event.addListener(map, 'zoom_changed', function () {
            Backbone.Events.trigger('zoom-change', map.getBounds());
        });

        google.maps.event.addListener(map, 'bounds_changed', function () {
            Backbone.Events.trigger('bounds-change', map.getBounds());
        });

        google.maps.event.addListenerOnce(map, 'idle', function () {
            Backbone.Events.trigger('map-loaded');
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);
}(app));
(function (app) {

    function setTopLeftFor(div, point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
    }

    function CompositeMarker (element, location) {
        this._element = element;
        this._location = location;

        this._element.className = 'composite-marker';
    }

    CompositeMarker.prototype = new google.maps.OverlayView();

    _.extend(CompositeMarker.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this._element);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                positionWithinDiv = overlayProjection.fromLatLngToDivPixel(this._location);

            setTopLeftFor(this._element, positionWithinDiv);
        }
    });

    app.ns(app, 'CompositeMarker', CompositeMarker);
}(app));

/** @jsx React.DOM */
(function (app) {
    'use strict';

    var mapIdleDeferred;

    function init() {
        mapIdleDeferred = $.Deferred();

        Backbone.Events.once('map-idle', function () {
            mapIdleDeferred.resolve();
        });

        mapIdleDeferred.done(main);
    }

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

    init();
}(app));

//# sourceMappingURL=experiment.js.map