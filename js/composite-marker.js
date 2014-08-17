(function (app) {

    function setTopLeftFor(div, point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
    }

    function CompositeMarker (element, location) {
        this._element = element;
        this._location = location;

        this._element.className = 'composite-marker';
    }

    CompositeMarker.prototype = new google.maps.OverlayView();

    _.extend(CompositeMarker.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            panes.overlayLayer.appendChild(this._element);
        },

        draw: function () {
            var overlayProjection = this.getProjection(),
                positionWithinDiv = overlayProjection.fromLatLngToDivPixel(this._location);

            setTopLeftFor(this._element, positionWithinDiv);
        }
    });

    app.ns(app, 'CompositeMarker', CompositeMarker);
}(app));
