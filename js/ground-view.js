(function (app) {

    // source for scaling: http://gis.stackexchange.com/questions/7430/google-maps-zoom-level-ratio
    var scaleFactor = {
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
    },
        projection,
        bounds,
        dx,
        dy;

    function googleMapProjection(coordinates) {
//        var sw = bounds.getSouthWest(),
//            ne = bounds.getNorthEast(),
//
//            nw = ne.;

        var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
        var pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
        return [pixelCoordinates.x-dx, pixelCoordinates.y-dy];
    }

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

    function getPathWith() {
//        var currentZoomLevel = app.map.getZoom(),
//            scale = scaleFactor[currentZoomLevel],
//            bounds = getCenterPointFromBounds(data),
//          var projection = d3.geo.mercator()
//                .center([ bounds.xCenter, bounds.yCenter])
//                .scale(50000)
//                .translate([width / 2, height / 2]);

        return d3.geo.path().projection(googleMapProjection)
            .center();
    }

    function createPolygonWith(element, width, height, data) {
        var centerPoint = getCenterPointFromBounds(data),
            path = d3.geo.path().projection(googleMapProjection);
//                .center([ centerPoint.xCenter, centerPoint.yCenter]);

        return d3.select(element).append('svg')
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

    function getGoogleLatLngBounds(bounds) {
        var swPoint = new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
            nePoint = new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng);

        return new google.maps.LatLngBounds(swPoint, nePoint);
    }

    function GroundOverlay (map, data) {
        this._div = $('<div />').get(0);
        this._data = data;

        this.setMap(map);
    }

    GroundOverlay.prototype = new google.maps.OverlayView();

    _.extend(GroundOverlay.prototype, {
        onAdd: function () {
            var panes = this.getPanes();

            $(this._div).addClass('ground-overlay-view');

            panes.overlayLayer.appendChild(this._div);

//            google.maps.event.trigger(this, 'ready', {element: this._div});
        },

        draw: function () {
            var overlayProjection = this.getProjection();
            projection = overlayProjection;

            this._bounds = getGoogleLatLngBounds(getBoundsPoints(convertFeatureToBounds(this._data)));
            bounds = this._bounds;

            var sw = overlayProjection.fromLatLngToDivPixel(this._bounds.getSouthWest());
            var ne = overlayProjection.fromLatLngToDivPixel(this._bounds.getNorthEast());

            dx = sw.x;
            dy = ne.y;

            this._div.style.left = sw.x + 'px';
            this._div.style.top = ne.y + 'px';
            var width = (ne.x - sw.x);
            this._div.style.width = width + 'px';
            var height = (sw.y - ne.y);
            this._div.style.height = height + 'px';

            $(this._div).empty();

            var svg = createPolygonWith(this._div, width, height, this._data);

            svg.style('top', ne.y + 'px');
            svg.style('left', sw.x + 'px');

//            google.maps.event.trigger(this, 'ready', {element: this._div});
        }
    });

    app.ns(app, 'GroundViewOverlay', GroundOverlay);

}(app));


/*
var overlay = new google.maps.OverlayView();

overlay.onAdd = function () {
    var layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay").attr("id","mySvg");
    var svg = layer.append("svg");
    var adminDivisions = svg.append("g").attr("class", "AdminDivisions");

    overlay.draw = function () {
        var markerOverlay = this;
        var overlayProjection = markerOverlay.getProjection();

        // Turn the overlay projection into a d3 projection
        var googleMapProjection = function (coordinates) {
            var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
            var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
            return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
        }

        path = d3.geo.path().projection(googleMapProjection);

        adminDivisions.selectAll("path")
            .data(geoJson.features)
            .attr("d", path) // update existing paths
            .attr("class","myPathClass")
            .enter().append("svg:path")
            .attr("d", path);

    };

    //DOESN'T WORK  :(
    //Try adding click event to main-<svg>
    d3.selectAll(".SvgOverlay").on("click", doSomething);

    //Try adding click event to individual <path>
    d3.selectAll(".myPathClass").on("click", doSomething);
};

});
*/