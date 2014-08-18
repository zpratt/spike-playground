(function (app) {
    'use strict';

    function setTopLeftFor(div, point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
    }

    function CompositeMarker (element, location) {
        this.element = element;
        this.location = location;

        this.element.className = 'composite-marker';
    }

    CompositeMarker.prototype = new google.maps.OverlayView();

    _.extend(CompositeMarker.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this.element);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                positionWithinDiv = overlayProjection.fromLatLngToDivPixel(this.location);

            setTopLeftFor(this.element, positionWithinDiv);
        }
    });

    app.ns(app, 'CompositeMarker', CompositeMarker);
}(app));
