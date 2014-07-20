(function (app) {
    var collection = new Backbone.Collection(),
        loaded = collection.fetch({url: '/dummy-data.json'}),
        mapLoaded = $.Deferred();

    Backbone.Events.on('map-loaded', function () {
        mapLoaded.resolve();
    });

    $.when(mapLoaded, loaded).done(function () {
        collection.each(function (model) {
            var view = new app.GroundViewOverlay(app.map, model.attributes.location);

            google.maps.event.addListenerOnce(view, 'ready', function (element) {
                app.donut.graph(element.element, [model.attributes, {percent_done: 100 - model.attributes.percent_done}]);
            });
        });
    });
}(app));