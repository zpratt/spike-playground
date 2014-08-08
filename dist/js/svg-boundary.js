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
;(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        initialize: function () {  }
    }));
}(app));;(function (app) {
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
}(app));;(function (app) {
    app.ns(app, 'IowaGeoJson', function () {
        return [
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Dallas","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.8166,41.8638],[-93.7892,41.5133],[-93.8221,41.5078],[-94.2438,41.5023],[-94.2438,41.6009],[-94.2821,41.6009],[-94.2821,41.8638],[-94.1617,41.8638],[-93.8166,41.8638]]]]}}
            ]},
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Polk","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.7728,41.8638],[-93.6961,41.8638],[-93.3456,41.8638],[-93.3292,41.5078],[-93.3292,41.4914],[-93.7071,41.5133],[-93.7892,41.5133],[-93.8166,41.8638],[-93.7728,41.8638]]]]}}
            ]},
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Warren","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.7071,41.5133],[-93.3292,41.4914],[-93.3292,41.1627],[-93.5592,41.1627],[-93.6742,41.1627],[-93.7892,41.1627],[-93.7892,41.5133],[-93.7071,41.5133]]]]}}
            ]},
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Madison","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.8221,41.5078],[-93.7892,41.5133],[-93.7892,41.1627],[-94.0138,41.1573],[-94.2438,41.1573],[-94.2438,41.5023],[-93.8221,41.5078]]]]}}
            ]}
        ];
    });
}(app));;function initialize() {
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
google.maps.event.addDomListener(window, 'load', initialize);;(function (app) {

    function createSvg(element, width, height) {
        return d3.select(element).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    }

    function graph(element, data) {
        var width = 100,
            height = 100,
            radius = Math.min(width, height) / 2,

            color,
            arc,
            pie,
            svg,
            g;

        color = d3.scale.ordinal()
            .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

        arc = d3.svg.arc()
            .outerRadius(radius - 60)
            .innerRadius(radius - 70);

        pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.percent_done;
            });

        svg = createSvg(element, width, height);

        g = svg.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', arc)
            .style('fill', function(d) {
                var value = d.data.percent_done;

                return color(value);
            });

        g.append('text')
            .attr('transform', function(d) {
                return 'translate(' + arc.centroid(d) + ')';
            })
            .attr('dy', '.35em')
            .style('text-anchor', 'middle');
    }

    app.ns(app, 'donut', {
        graph: graph
    });

}(app));;(function (app) {

    function gMapProjectionTransform(projection, extents) {
        var dx = extents.sw.x,
            dy = extents.ne.y;

        return function (coordinates) {
            var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]),
                pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);

            return [pixelCoordinates.x - dx, pixelCoordinates.y - dy];
        }
    }

    function getBoundsPoints(bounds) {
        return {
            sw: {
                lat: bounds[0][1],
                lng: bounds[0][0]
            },
            ne: {
                lat: bounds[1][1],
                lng: bounds[1][0]
            }
        };
    }

    function convertFeatureToBounds(data) {
        return d3.geo.bounds(data);
    }

    function createPolygonWith(element, extents, projection) {
        var path = d3.geo.path().projection(gMapProjectionTransform(projection, extents)),
            pattern = '<pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"> ' +
                        '<line x1="0" y1="0" x2="0" y2="10"/> ' +
                        '</pattern>',

            svg = d3.select(element).append('svg');

        svg.append('defs').html(pattern);

        svg
            .attr('viewBox', '0 0 ' + extents.width + ' ' + extents.height)
            .selectAll('path')
            .data(this._data.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'url(#diagonalHatch)');

        return svg;
    }

    function getGoogleLatLngBounds(bounds) {
        var swPoint = new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
            nePoint = new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng);

        return new google.maps.LatLngBounds(swPoint, nePoint);
    }

    function getExtents(projection) {
        var southWestPoint = projection.fromLatLngToDivPixel(this._bounds.getSouthWest()),
            northEastPoint = projection.fromLatLngToDivPixel(this._bounds.getNorthEast());

        return {
            sw: southWestPoint,
            ne: northEastPoint,

            width: northEastPoint.x - southWestPoint.x,
            height: southWestPoint.y - northEastPoint.y
        }
    }

    function setTopLeftFor(div, sw, ne) {
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
    }

    function setHeightAndWidthFor(div, width, height) {
        div.style.width = width + 'px';
        div.style.height = height + 'px';
    }

    function GroundOverlay (map, data) {
        this._div = document.createElement('div');
        this._div.className = 'ground-overlay-view';

        this._data = data;
        this._bounds = getGoogleLatLngBounds(getBoundsPoints(convertFeatureToBounds(this._data)));
        this._svg = null;

        this.setMap(map);
    }

    GroundOverlay.prototype = new google.maps.OverlayView();

    _.extend(GroundOverlay.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this._div);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                fragment = document.createDocumentFragment(),
                extents,
                width,
                height;

            extents = getExtents.call(this, overlayProjection);
            width = extents.width;
            height = extents.height;

            setTopLeftFor(this._div, extents.sw, extents.ne);
            setHeightAndWidthFor(this._div, width, height);

            if (this._svg) {
                this._svg.attr('width', extents.width);
                this._svg.attr('height', extents.height);
            } else {
                this._svg = createPolygonWith.call(this, fragment, extents, overlayProjection);
                this._data = null;
                this._div.appendChild(fragment);
            }

        }
    });

    app.ns(app, 'GroundViewOverlay', GroundOverlay);

}(app));;(function (app) {
    var collection = new Backbone.Collection(),
        loaded = collection.fetch({url: '/dummy-data.json'}),
        mapLoaded = $.Deferred();

    Backbone.Events.on('map-loaded', function () {
        app.map.setCenter(new google.maps.LatLng(41.577060100767945, -93.90260298828126));

        mapLoaded.resolve();
    });

    function createGroundOverlay(county) {
        return new app.GroundViewOverlay(app.map, county);
    }

    $.when(mapLoaded, loaded).done(function () {
        var counties = app.IowaGeoJson();

        _.each(counties, function (county) {
            createGroundOverlay(county);
        });


    });

}(app));
//# sourceMappingURL=svg-boundary.js.map