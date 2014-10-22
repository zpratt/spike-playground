(function (app) {
    'use strict';

    function getGoogleLatLngBounds(coordinates) {
        return new google.maps.LatLng(coordinates.lat, coordinates.lng);
    }

    function setTopLeftFor(div, sw, ne) {
        var height = div.offsetHeight,
            width = div.offsetWidth;

        div.style.left = sw - Math.floor(width / 2) + 'px';
        div.style.top = ne - height - 8 + 'px';
    }

    function VanillaOverlay (element, coordinates) {
        this.div = element;
        this.div.className = 'vanilla-overlay';
        this.point = getGoogleLatLngBounds(coordinates);
    }

    VanillaOverlay.prototype = new google.maps.OverlayView();

    _.extend(VanillaOverlay.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this.div);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                extents = overlayProjection.fromLatLngToDivPixel(this.point);

            setTopLeftFor(this.div, extents.x, extents.y);
        }
    });

    app.ns(app, 'VanillaOverlay', VanillaOverlay);

}(app));
