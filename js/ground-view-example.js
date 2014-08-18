(function (app) {
    'use strict';

    var SvgFactory = app.SvgBoundaryFactory,

        host = Backbone.history.location.hostname,
        collection = new Backbone.Collection(),
        loaded,
        data = '/dummy-data.json',
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,
        mapLoaded = new $.Deferred();

    loaded = collection.fetch({url: endPointUrl});

    Backbone.Events.once('map-loaded', function () {
        app.map.setCenter(new google.maps.LatLng(41.577060100767945, -93.90260298828126));

        mapLoaded.resolve();
    });

    function createGroundOverlay(county) {
        var element = document.createElement('div'),
            bounds = SvgFactory.convertBounds(county),
            view = new app.GroundViewOverlay(element, bounds);

        view.isInDom.done(function (dimensions) {
            SvgFactory.create(
                county,
                element,
                {height: dimensions.height, width: dimensions.width},
                SvgFactory.getOverlayViewProjection(view.getProjection(), bounds)
            );
        });

        return view;
    }

    $.when(mapLoaded, loaded).done(function () {
        var counties = app.getIowaGeoJson(),
            views = [];

        _.each(counties, function (county) {
            views.push(createGroundOverlay(county));
        });

        _.invoke(views, 'setMap', app.map);
    });

}(app));
