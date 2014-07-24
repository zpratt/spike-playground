(function (app) {
    var collection = new Backbone.Collection(),
        loaded = collection.fetch({url: '/dummy-data.json'}),
        mapLoaded = $.Deferred(),
        svg,
    // source for scaling: http://gis.stackexchange.com/questions/7430/google-maps-zoom-level-ratio
        scaleFactor = {
            20 : 1128.497220,
            19 : 2256.994440,
            18 : 4513.988880,
            17 : 9027.977761,
            16 : 18055.955520,
            15 : 36111.911040,
            14 : 72223.822090,
            13 : 144447.644200,
            12 : 288895.288400,
            11 : 577790.576700,
            10 : 1155581.153000,
            9  : 2311162.307000,
            8  : 4622324.614000,
            7  : 9244649.227000,
            6  : 18489298.450000,
            5  : 36978596.910000,
            4  : 73957193.820000,
            3  : 147914387.600000,
            2  : 295828775.300000,
            1  : 591657550.500000
        };

    function getBoundsPoints(bounds) {
        return {
            sw: {
                lat: bounds[0][1],
                lng: bounds[0][0]
            },
            ne: {
                lat: bounds[1][1],
                lng: bounds[1][0]
            }
        };
    }

    function convertFeatureToBounds(data) {
        return d3.geo.bounds(data);
    }

    function getCenterPointFromBounds(data) {
        var bounds = convertFeatureToBounds(data),
            points = getBoundsPoints(bounds);

        return {
            xCenter: ((points.ne.lng + points.sw.lng) / 2),
            yCenter: (points.ne.lat + points.sw.lat) / 2
        }
    }

    function getPathWith(data, height, width) {
        var currentZoomLevel = app.map.getZoom(),
            scale = scaleFactor[currentZoomLevel],
            bounds = getCenterPointFromBounds(data),
            projection = d3.geo.mercator()
                .center([ bounds.xCenter, bounds.yCenter])
                .scale(50000)
                .translate([width / 2, height / 2]);

        return d3.geo.path().projection(projection);
    }

    function createPolygonWith(element, width, height, data, path) {
        svg = d3.select(element.element).append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'grey')
            .style('fill-opacity', '.5')
            .style('stroke', '#000')
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
            path = getPathWith(data, height, width);

//        var bounds = getBoundsPoints(convertFeatureToBounds(data));
        var polyView = new app.GroundViewOverlay(app.map, data);

//        google.maps.event.addListenerOnce(polyView, 'ready', function (element) {
//            var divWidth = polyView._div.offsetWidth,
//                divHeight = polyView._div.offsetHeight;
//
//            createPolygonWith(element, divWidth, divHeight, data, path);
//        });

//        google.maps.event.addListener(polyView, 'ready', function (element) {
//            var divWidth = polyView._div.offsetWidth,
//                divHeight = polyView._div.offsetHeight;
//
//            svg.attr('width', divWidth)
//                .attr('height', divHeight);
//        });
    });

}(app));