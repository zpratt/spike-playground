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

}(app));
(function (app) {

    function createDefaultProjection() {
        return d3.geo.mercator()
            .scale(1)
            .translate([0, 0]);
    }

    function createDefaultPath(projection) {
        return d3.geo.path()
            .projection(projection);
    }

    function calculateScaleWith(bounds, dimensions) {
        return Math.max(
                (bounds.ne.lng - bounds.sw.lng) / dimensions.width,
                (bounds.ne.lat - bounds.sw.lat) / dimensions.height
        );
    }

    function calculateTranslationWith(dimensions, scale, bounds) {
        return [
                (dimensions.width - scale * (bounds.ne.lng + bounds.sw.lng)) / 2,
                (dimensions.height - scale * (bounds.ne.lat + bounds.sw.lat)) / 2
        ];
    }

    /**
     * Math for this function was borrowed from
     * http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object#14691788
     */
    function getMercatorProjection(feature, dimensions) {
        var SIZE_RATIO = .95,
            projection = createDefaultProjection(),
            path = createDefaultPath(projection),
            bounds = getBoundsPoints(path.bounds(feature)),
            center = d3.geo.centroid(feature),
            scale = calculateScaleWith(bounds, dimensions),
            translation = calculateTranslationWith(dimensions, scale, bounds);

        projection
                .center(center)
                .scale(SIZE_RATIO / scale)
                .translate(translation);

        return projection;
    }

    function rawCoordinateToPoint(projection, coordinate) {
        var latLng = new google.maps.LatLng(coordinate.lat, coordinate.lng);

        return projection.fromLatLngToDivPixel(latLng)
    }

    function bboxToDxDy(projection, bbox) {
        var dx = rawCoordinateToPoint(projection, bbox.sw).x,
            dy = rawCoordinateToPoint(projection, bbox.ne).y;

        return {
            dx: dx,
            dy: dy
        }
    }

    function getGoogleOverlayViewProjection(overlayViewProjection, bbox) {
        var boundsXy = bboxToDxDy(overlayViewProjection, bbox);

        return function (coordinates) {
            var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]),
                pixelCoordinates = overlayViewProjection.fromLatLngToDivPixel(googleCoordinates);

            return [pixelCoordinates.x - boundsXy.dx, pixelCoordinates.y - boundsXy.dy];
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
        return getBoundsPoints(d3.geo.bounds(data));
    }

    function createPolygonWith(geojson, element, dimensions, projection) {
        var path = d3.geo.path().projection(projection),
            pattern = '<pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"> ' +
                '<line x1="0" y1="0" x2="0" y2="10"/> ' +
                '</pattern>',

            svg = d3.select(element).append('svg');

        svg.append('defs').html(pattern);

        svg
            .attr('viewBox', '0 0 ' + dimensions.width + ' ' + dimensions.height)
            .selectAll('path')
            .data(geojson.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'url(#diagonalHatch)');

        return svg;
    }

    app.ns(app, 'SvgBoundaryFactory', {
        create: createPolygonWith,
        convertBounds: convertFeatureToBounds,
        getMercatorProjection: getMercatorProjection,
        getOverlayViewProjection: getGoogleOverlayViewProjection
    });

}(app));

(function (app) {

    function getGoogleLatLngBounds(bounds) {
        var swPoint = new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
            nePoint = new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng);

        return new google.maps.LatLngBounds(swPoint, nePoint);
    }

    function getBboxXy(projection) {
        var southWestPoint = projection.fromLatLngToDivPixel(this._bounds.getSouthWest()),
            northEastPoint = projection.fromLatLngToDivPixel(this._bounds.getNorthEast());

        return {
            sw: southWestPoint,
            ne: northEastPoint
        }
    }

    function calculateDimensions(bboxPixels) {
        return {
            width: bboxPixels.ne.x - bboxPixels.sw.x,
            height: bboxPixels.sw.y - bboxPixels.ne.y
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

    function GroundOverlay (element, bounds) {
        this._div = element;
        this._div.className = 'ground-overlay-view';
        this._bounds = getGoogleLatLngBounds(bounds);
        this.isInDom = $.Deferred();
    }

    GroundOverlay.prototype = new google.maps.OverlayView();

    _.extend(GroundOverlay.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this._div);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                extents,
                dimensions;

            extents = getBboxXy.call(this, overlayProjection);
            dimensions = calculateDimensions(extents);

            setTopLeftFor(this._div, extents.sw, extents.ne);
            setHeightAndWidthFor(this._div, dimensions.width, dimensions.height);

            this.isInDom.resolve(dimensions);
        }
    });

    app.ns(app, 'GroundViewOverlay', GroundOverlay);

}(app));

(function (app) {
    var SvgFactory = app.SvgBoundaryFactory,

        host = Backbone.history.location.hostname,
        collection = new Backbone.Collection(),
        loaded,
        data = '/dummy-data.json',
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,
        mapLoaded = $.Deferred();

    loaded = collection.fetch({url: endPointUrl});

    Backbone.Events.once('map-loaded', function () {
        app.map.setCenter(new google.maps.LatLng(41.577060100767945, -93.90260298828126));

        mapLoaded.resolve();
    });

    function createGroundOverlay(county) {
        var element = document.createElement('div'),
            bounds = SvgFactory.convertBounds(county),
            view = new app.GroundViewOverlay(element, bounds);

        view.isInDom.done(function (dimensions) {
            SvgFactory.create(
                county,
                element,
                {height: dimensions.height, width: dimensions.width},
                SvgFactory.getOverlayViewProjection(view.getProjection(), bounds)
            );
        });

        return view;
    }

    $.when(mapLoaded, loaded).done(function () {
        var counties = app.IowaGeoJson(),
            views = [];

        _.each(counties, function (county) {
            views.push(createGroundOverlay(county));
        });

        _.invoke(views, 'setMap', app.map);
    });

}(app));

//# sourceMappingURL=svg-boundary.js.map