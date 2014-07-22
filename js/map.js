function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(41.06757690864442, -92.51283248046876),
        zoom: 8
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    app.ns(app, 'map', map);

    google.maps.event.addListener(map, 'idle', function () {
        Backbone.Events.trigger('map-idle');
    });

    google.maps.event.addListenerOnce(map, 'idle', function () {
        Backbone.Events.trigger('map-loaded');
    });
}
google.maps.event.addDomListener(window, 'load', initialize);