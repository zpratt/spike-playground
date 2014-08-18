(function(global) {
    'use strict';

    function ns (parentNamespace, nsString, extent) {
        var namespaceParts = nsString.split('.'),
            hlq = 'app',
            parent = parentNamespace,
            i;

        if (namespaceParts[0] === hlq) {
            namespaceParts = namespaceParts.slice(0);
        }

        for (i = 0; i < namespaceParts.length; i += 1) {
            if (parent[namespaceParts[i]] === undefined) {
                if (extent) {
                    parent[namespaceParts[i]] = extent;
                } else {
                    parent[namespaceParts[i]] = {};
                }
            }

            parent = parent[namespaceParts[i]];
        }

        return parent;
    }

    function bindNS (parentNamespace, namespaceString, extent) {
        ns.apply(this, [parentNamespace, namespaceString, extent]);
    }

    global.app = {
        ns: ns,
        bindNS: bindNS
    };

}(this));

/*global app Backbone*/
(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        defaults: {
            'x_coord': 0,
            'y_coord': 0
        },

        initialize: function () {  }
    }));
}(app));

/*global app Backbone $*/
(function (app) {
    app.ns(app, 'AnswerCollection', Backbone.Collection.extend({
        model: app.AnswersModel,

        initialize: function () {
            this.loaded = new $.Deferred();
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
    'use strict';

    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(40.01144663490021, -90.22767623046876),
            zoom: 7
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
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
    'use strict';

    function setTopLeftFor(div, point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
    }

    function CompositeMarker (element, location) {
        this.element = element;
        this.location = location;

        this.element.className = 'composite-marker';
    }

    CompositeMarker.prototype = new google.maps.OverlayView();

    _.extend(CompositeMarker.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this.element);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                positionWithinDiv = overlayProjection.fromLatLngToDivPixel(this.location);

            setTopLeftFor(this.element, positionWithinDiv);
        }
    });

    app.ns(app, 'CompositeMarker', CompositeMarker);
}(app));

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

//# sourceMappingURL=experiment.js.map