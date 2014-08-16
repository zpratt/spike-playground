(function (app) {

    function getMercatorProjection(centerPoint, extents) {
        return d3.geo.mercator()
                .center([centerPoint.lng(), centerPoint.lat()])
                .translate([extents.width / 2, extents.height / 2])
                .scale(5200);
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
        convertBounds: convertFeatureToBounds
    });

}(app));