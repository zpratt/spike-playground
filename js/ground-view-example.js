(function (app) {
    var host = Backbone.history.location.hostname,
        collection = new Backbone.Collection(),
        loaded,
        data = '/dummy-data.json',
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,
        mapLoaded = $.Deferred();

    loaded = collection.fetch({url: endPointUrl});

    Backbone.Events.on('map-loaded', function () {
        app.map.setCenter(new google.maps.LatLng(41.577060100767945, -93.90260298828126));

        mapLoaded.resolve();
    });

    function createGroundOverlay(county) {
        var element = document.createElement('div');

        return new app.GroundViewOverlay(app.map, element, county);
    }

    $.when(mapLoaded, loaded).done(function () {
        var counties = app.IowaGeoJson();

        _.each(counties, function (county) {
            createGroundOverlay(county);
        });
    });

}(app));
