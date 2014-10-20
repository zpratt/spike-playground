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
    'use strict';

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
    'use strict';

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

(function (app){
    'use strict';

    var SvgFactory = app.SvgBoundaryFactory;

    function renderBoundary(boundary, element, dimensions) {
        var projection = SvgFactory.getMercatorProjection(boundary, dimensions),
            svgBoundary = SvgFactory.create(element, dimensions);

        svgBoundary.render(boundary, projection);

        return svgBoundary;
    }

    function renderList(counties) {
        var container = document.querySelector('#main-container ul'),
            height = 50,
            width = 50;

        _.each(counties, function (county) {
            var listItem = document.createElement('li'),
                element = document.createDocumentFragment();

            $(listItem).css('height', height);
            $(listItem).css('width', width);
            listItem.className = 'polygon';

            renderBoundary(county, element, {
                height: height,
                width: width
            });

            listItem.appendChild(element);
            container.appendChild(listItem);
        });
    }

    renderList(app.getIowaGeoJson());
}(app));

//# sourceMappingURL=boundary-list-example.js.map