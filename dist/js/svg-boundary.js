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
    app.ns(app, 'getIowaGeoJson', function () {
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
    'use strict';

    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(40.583324574181574, -90.72755416015626),
            zoom: 8
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
            Backbone.Events.trigger('map-loaded', map);
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);
}(app));

(function (app) {
    'use strict';

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
    'use strict';

    function createPathWith(projection) {
        return d3.geo.path()
            .projection(projection);
    }

    function SvgBoundary(element, dimensions) {
        this.element = element;
        this.height = dimensions.height;
        this.width = dimensions.width;
    }

    _.extend(SvgBoundary.prototype, {
        render: function (feature, projection) {
            var fragment = document.createDocumentFragment(),
                path = createPathWith(projection),
                svg = d3.select(fragment).append('svg');

            svg
                .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
                .selectAll('path')
                .data(feature.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', 'url(#diagonalHatch)');

            this.element.appendChild(fragment);

            return svg;
        }
    });

    app.ns(app, 'SvgBoundary', SvgBoundary);

}(app));

(function (app) {
    'use strict';

    var DEFAULT_SIZE_RATIO = .95;
//        ,
//        PATTERN = '<pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"> ' +
//            '<line x1="0" y1="0" x2="0" y2="10"/> ' +
//            '</pattern>';

    function createDefaultProjection() {
        return d3.geo.mercator()
            .scale(1)
            .translate([0, 0]);
    }

    function createPathWith(projection) {
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

    /**
     * Math for this function was borrowed from
     * http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object#14691788
     */
    function getMercatorProjection(feature, dimensions, customSizeRatio) {
        var sizeRatio = customSizeRatio || DEFAULT_SIZE_RATIO,
            projection = createDefaultProjection(),
            path = createPathWith(projection),
            bounds = getBoundsPoints(path.bounds(feature)),
            center = d3.geo.centroid(feature),
            scale = calculateScaleWith(bounds, dimensions),
            translation = calculateTranslationWith(dimensions, scale, bounds);

        projection
                .center(center)
                .scale(sizeRatio / scale)
                .translate(translation);

        return projection;
    }

    function rawCoordinateToPoint(projection, coordinate) {
        var latLng = new google.maps.LatLng(coordinate.lat, coordinate.lng);

        return projection.fromLatLngToDivPixel(latLng);
    }

    function bboxToDxDy(projection, bbox) {
        var dx = rawCoordinateToPoint(projection, bbox.sw).x,
            dy = rawCoordinateToPoint(projection, bbox.ne).y;

        return {
            dx: dx,
            dy: dy
        };
    }

    function getGoogleOverlayViewProjection(overlayViewProjection, bbox) {
        var boundsXy = bboxToDxDy(overlayViewProjection, bbox);

        return function (coordinates) {
            var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]),
                pixelCoordinates = overlayViewProjection.fromLatLngToDivPixel(googleCoordinates);

            return [pixelCoordinates.x - boundsXy.dx, pixelCoordinates.y - boundsXy.dy];
        };
    }

    function convertFeatureToBounds(data) {
        return getBoundsPoints(d3.geo.bounds(data));
    }

    function create(element, dimensions) {
        return new app.SvgBoundary(element, dimensions);
    }

    app.ns(app, 'SvgBoundaryFactory', {
        create: create,
        convertBounds: convertFeatureToBounds,
        getMercatorProjection: getMercatorProjection,
        getOverlayViewProjection: getGoogleOverlayViewProjection
    });

}(app));

(function (app) {
    'use strict';

    function getGoogleLatLngBounds(bounds) {
        var swPoint = new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
            nePoint = new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng);

        return new google.maps.LatLngBounds(swPoint, nePoint);
    }

    function getBboxXy(projection) {
        var southWestPoint = projection.fromLatLngToDivPixel(this.bounds.getSouthWest()),
            northEastPoint = projection.fromLatLngToDivPixel(this.bounds.getNorthEast());

        return {
            sw: southWestPoint,
            ne: northEastPoint
        };
    }

    function calculateDimensions(bboxPixels) {
        return {
            width: bboxPixels.ne.x - bboxPixels.sw.x,
            height: bboxPixels.sw.y - bboxPixels.ne.y
        };
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
        this.div = element;
        this.div.className = 'ground-overlay-view';
        this.bounds = getGoogleLatLngBounds(bounds);
        this.isInDom = new $.Deferred();
    }

    GroundOverlay.prototype = new google.maps.OverlayView();

    _.extend(GroundOverlay.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this.div);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                extents,
                dimensions;

            extents = getBboxXy.call(this, overlayProjection);
            dimensions = calculateDimensions(extents);

            setTopLeftFor(this.div, extents.sw, extents.ne);
            setHeightAndWidthFor(this.div, dimensions.width, dimensions.height);

            this.isInDom.resolve(dimensions);
        }
    });

    app.ns(app, 'GroundViewOverlay', GroundOverlay);

}(app));

(function (app) {
    'use strict';

    var SvgFactory = app.SvgBoundaryFactory,

        host = Backbone.history.location.hostname,
        collection = new Backbone.Collection(),
        loaded,
        data = '/dummy-data.json',
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,
        mapLoaded = new $.Deferred();

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
            var svgBoundary = SvgFactory.create(
                    element,
                    dimensions
                ),
                projection = SvgFactory.getOverlayViewProjection(view.getProjection(), bounds);

            svgBoundary.render(county, projection);
        });

        return view;
    }

    $.when(mapLoaded, loaded).done(function () {
        var counties = app.getIowaGeoJson(),
            views = [];

        _.each(counties, function (county) {
            views.push(createGroundOverlay(county));
        });

        _.invoke(views, 'setMap', app.map);
    });

}(app));

//# sourceMappingURL=svg-boundary.js.map