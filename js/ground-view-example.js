(function (app) {
    var collection = new Backbone.Collection(),
        loaded = collection.fetch({url: '/dummy-data.json'}),
        mapLoaded = $.Deferred();

    Backbone.Events.on('map-loaded', function () {
        app.map.setCenter(new google.maps.LatLng(41.577060100767945, -93.90260298828126));

        mapLoaded.resolve();
    });

    function createGroundOverlay(county) {
        return new app.GroundViewOverlay(app.map, county);
    }

    $.when(mapLoaded, loaded).done(function () {
        var counties = app.IowaGeoJson();

        _.each(counties, function (county) {
            createGroundOverlay(county);
        });


    });

}(app));