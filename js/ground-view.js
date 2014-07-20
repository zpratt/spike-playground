(function (app) {

    function GroundOverlay (map, point) {
        var googleLatLng = new google.maps.LatLng(point.lat, point.lng);

        this._div = $('<div />').get(0);
        this._point = googleLatLng;

        this.setMap(map);
    }

    GroundOverlay.prototype = new google.maps.OverlayView();

    _.extend(GroundOverlay.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            $(this._div).addClass('ground-overlay-view');

            panes.overlayLayer.appendChild(this._div);

            google.maps.event.trigger(this, 'ready', {element: this._div});
        },
        draw: function () {
            var overlayProjection = this.getProjection(),
                pixel = overlayProjection.fromLatLngToDivPixel(this._point);

            this._div.style.left = (pixel.x - 100) + 'px';
            this._div.style.top = (pixel.y - 100) + 'px';
        }
    });

    app.ns(app, 'GroundViewOverlay', GroundOverlay);

}(app));