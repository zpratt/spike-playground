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
