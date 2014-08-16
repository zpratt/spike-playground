(function (app) {
    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(40.01144663490021, -90.22767623046876),
            zoom: 7
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);

        app.ns(app, 'map', map);

        google.maps.event.addListener(map, 'idle', function () {
            Backbone.Events.trigger('map-idle');
        });

        google.maps.event.addListener(map, 'zoom_changed', function () {
            Backbone.Events.trigger('zoom-change', map.getBounds());
        });

        google.maps.event.addListener(map, 'bounds_changed', function () {
            Backbone.Events.trigger('bounds-change', map.getBounds());
        });

        google.maps.event.addListenerOnce(map, 'idle', function () {
            Backbone.Events.trigger('map-loaded');
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);
}(app));