(function (app) {
    'use strict';

    var host = Backbone.history.location.hostname,
        collection = new Backbone.Collection(),
        loaded,
        data = '/dummy-data.json',
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,
        mapLoaded = new $.Deferred(),
        markers = {};

    loaded = collection.fetch({url: endPointUrl});

    Backbone.Events.on('map-loaded', function () {
        mapLoaded.resolve();
    });

    $.when(mapLoaded, loaded).done(function () {
        collection.each(function (item) {

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(item.attributes.location.lat, item.attributes.location.lng),
                title: item.attributes.name
            });

            markers[item.id] = marker;

            marker.setMap(app.map);
        });

    });

}(app));
