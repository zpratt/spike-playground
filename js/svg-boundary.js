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

    function createPolygonWith(geojson, element, extents, projection) {
        var path = d3.geo.path().projection(projection),
            pattern = '<pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"> ' +
                '<line x1="0" y1="0" x2="0" y2="10"/> ' +
                '</pattern>',

            svg = d3.select(element).append('svg');

        svg.append('defs').html(pattern);

        svg
            .attr('viewBox', '0 0 ' + extents.width + ' ' + extents.height)
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
        getProjection: getMercatorProjection
    });

}(app));