(function (app) {
    var collection = new Backbone.Collection(),
        loaded = collection.fetch({url: '/dummy-data.json'}),
        mapLoaded = $.Deferred();

    Backbone.Events.on('map-loaded', function () {
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