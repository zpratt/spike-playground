function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(40.79575, -90.53804),
        zoom: 10
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