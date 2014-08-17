(function (app) {

    var SvgFactory = app.SvgBoundaryFactory;

    function gMapProjectionTransform(projection, extents) {
        var dx = extents.sw.x,
            dy = extents.ne.y;

        return function (coordinates) {
            var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]),
                pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);

            return [pixelCoordinates.x - dx, pixelCoordinates.y - dy];
        }
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

    function GroundOverlay (map, element, data) {
        this._div = element;
        this._div.className = 'ground-overlay-view';

        this._data = data;
        this._bounds = getGoogleLatLngBounds(SvgFactory.convertBounds(data));
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
                this._svg = SvgFactory.create(this._data, fragment, extents, gMapProjectionTransform(overlayProjection, extents));
                this._data = null;
                this._div.appendChild(fragment);
            }

        }
    });

    app.ns(app, 'GroundViewOverlay', GroundOverlay);

}(app));
