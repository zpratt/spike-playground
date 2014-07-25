(function (app) {

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

    function createPolygonWith(extents, projection) {
        var path = d3.geo.path().projection(gMapProjectionTransform(projection, extents)),
            pattern = '<pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"> ' +
                        '<line x1="0" y1="0" x2="0" y2="10"/> ' +
                        '</pattern>',

            svg = d3.select(this._div).append('svg');

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
        this._div = $('<div />').get(0);
        this._data = data;
        this._bounds = getGoogleLatLngBounds(getBoundsPoints(convertFeatureToBounds(this._data)));
        this._svg = null;

        this.setMap(map);
    }

    GroundOverlay.prototype = new google.maps.OverlayView();

    _.extend(GroundOverlay.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            $(this._div).addClass('ground-overlay-view');

            panes.overlayLayer.appendChild(this._div);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
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
                this._svg = createPolygonWith.call(this, extents, overlayProjection);
                this._data = null;
            }
        }
    });

    app.ns(app, 'GroundViewOverlay', GroundOverlay);

}(app));