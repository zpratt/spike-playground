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
