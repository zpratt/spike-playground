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
