(function (app) {
    var collection = new Backbone.Collection(),
        loaded = collection.fetch({url: '/dummy-data.json'}),
        mapLoaded = $.Deferred();

    function getCentroidOf(data) {
        return d3.geo.centroid(data);
    }

    function getPathWith(data, height, width) {
        var centroid = getCentroidOf(data),
            projection = d3.geo.mercator()
                .center(centroid)
                .scale(50000)
                .translate([width / 2, height / 2]);

        return d3.geo.path().projection(projection);
    }

    function createPolygonWith(element, width, height, data, path) {
        d3.select(element.element).append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'grey')
            .style('fill-opacity', '.5')
            .selectAll('path')
            .data(data.features)
            .enter()
            .append('path')
            .attr('d', path);
    }

    Backbone.Events.on('map-loaded', function () {
        mapLoaded.resolve();
    });

    $.when(mapLoaded, loaded).done(function () {
        var height = 500,
            width = 500,
            data = app.IowaGeoJson(),
            centroid = getCentroidOf(data),
            path = getPathWith(data, height, width);

        collection.each(function (model) {
            var view = new app.GroundViewOverlay(app.map, model.attributes.location);

            google.maps.event.addListenerOnce(view, 'ready', function (element) {
                app.donut.graph(element.element, [model.attributes, {percent_done: 100 - model.attributes.percent_done}]);
            });
        });

        var polyView = new app.GroundViewOverlay(app.map, {
            lat: centroid[1],
            lng: centroid[0]
        });

        google.maps.event.addListenerOnce(polyView, 'ready', function (element) {
            createPolygonWith(element, width, height, data, path);
        });
    });

}(app));