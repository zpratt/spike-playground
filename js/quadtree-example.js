(function (app) {
    var EPSG_4087 = '+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
        EPSG_4326 = '+proj=longlat +datum=WGS84 +no_defs',

        host = Backbone.history.location.hostname,
        collection = new Backbone.Collection(),
        loaded,
        data = '/dummy-data.json',
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,
        mapLoaded = $.Deferred(),
        rects = [];

    loaded = collection.fetch({url: endPointUrl});

    function convertLatLngToXy(latLng) {
        var projectedPoint = proj4(EPSG_4326, EPSG_4087, [latLng.lng, latLng.lat]);

        return {x: projectedPoint[0], y: projectedPoint[1]};
    }

    function convertGoogleMapBoundsToXY(inputBounds) {
        var bounds = inputBounds || app.map.getBounds(),
            swLatLng = bounds.getSouthWest(),
            neLatLng = bounds.getNorthEast(),

            swXY = convertLatLngToXy({
                lat: swLatLng.lat(),
                lng: swLatLng.lng()
            }),

            neXY = convertLatLngToXy({
                lat: neLatLng.lat(),
                lng: neLatLng.lng()
            });

        return {
            sw: swXY,
            ne: neXY
        }
    }

    function updateNodes(qTree) {
        qTree.depth = 0;

        qTree.visit(function (node, x1, y1, x2, y2) {
            node.bounds = {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };

            if (!node.leaf) {
                var leafNodes = _.filter(node.nodes, function (node) {
                    return (node && node.leaf);
                });

                node.containsLeaf = leafNodes.length > 0;
            }
        });
    }

    function pointToArray(point) {
        return [point.x, point.y];
    }

    function pointsToArray(xyPoints) {
        return _.map(xyPoints, pointToArray);
    }

    function bboxToPolygon(swPoint, nePoint) {
        return new Terraformer.Polygon({
            type:"Polygon",
            coordinates:
                [
                    [
                        [nePoint.x, nePoint.y],
                        [swPoint.x, nePoint.y],
                        [swPoint.x, swPoint.y],
                        [nePoint.x, swPoint.y],
                        [nePoint.x, nePoint.y]
                    ]
                ]
        })
    }

    function pointInBounds(point, bounds) {
        var boundsPoints = convertGoogleMapBoundsToXY(bounds),
            boundsPoly = bboxToPolygon(boundsPoints.sw, boundsPoints.ne),
            latLng = new Terraformer.Point({
                type:"Point",
                coordinates:[point.x, point.y]
            });

        return boundsPoly.contains(latLng);
    }

    function createQuadTree(xyPoints, inputBounds) {
        var quadtree,
            xyBounds = convertGoogleMapBoundsToXY(inputBounds),
            PROJECTION_BOUNDS = [[-20037508.3428, -10018754.1714], [20037508.3428, 10018754.1714]],

            pointsInBounds = _.filter(xyPoints, function (point) {
                return pointInBounds(point, inputBounds)
            });

        if (xyPoints.length === pointsInBounds.length) {
            quadtree = d3.geom.quadtree()
                .extent(PROJECTION_BOUNDS)
//                .extent([[xyBounds.sw.x, xyBounds.sw.y], [xyBounds.ne.x, xyBounds.ne.y]])
            (pointsToArray(pointsInBounds));
        } else {
            quadtree = d3.geom.quadtree(pointsInBounds);
        }

        updateNodes(quadtree);

        return quadtree;

    }

    function pointsToGoogleLatLngBounds(x1, y1, x2, y2) {
        return bboxToPolygon({x: x1, y: y1}, {x: x2, y: y2});
    }

    function flattenQuadtree(quadtree) {
        var nodes = [];

        quadtree.visit(function (node) {
            nodes.push(node);
        });

        return nodes;
    }

    function boundingBoxToExtent(inputBounds) {
        var bounds = inputBounds.bbox();
        return [[bounds[0], bounds[1]], [bounds[2], bounds[3]]];
    }

    function projectedCoordinatePairToGoogleLatLng(coordinates) {
        var geographicCoords = proj4(EPSG_4087, EPSG_4326, coordinates);

        return new google.maps.LatLng(geographicCoords[1], geographicCoords[0]);
    }

    function googleMapsRectangleFromBounds(inputBounds) {
        var bounds = boundingBoxToExtent(inputBounds),
            swCoords = bounds[0],
            neCoords = bounds[1],

            swGlatLng = projectedCoordinatePairToGoogleLatLng(swCoords),
            neGlatLng = projectedCoordinatePairToGoogleLatLng(neCoords);

        return new google.maps.Rectangle({
            bounds: new google.maps.LatLngBounds(swGlatLng, neGlatLng),
            map: app.map,
            fillOpacity: 0
        });
    }

    function collectionToXyPoints() {
        return _.map(collection.pluck('location'), convertLatLngToXy);
    }

    function getContainingBounds(nodes) {
        return _.filter(nodes, function (childNode) {
            return childNode.containsLeaf;
        });
    }

    function boundsContainedBy(innerBounds, outerBounds) {
        var innerBoundsCoords = boundingBoxToExtent(innerBounds),
            outerBoundsCoords = boundingBoxToExtent(outerBounds),

            outerNeCoords = outerBoundsCoords[1],
            outerSwCoords = outerBoundsCoords[0],
            innerNeCoords = innerBoundsCoords[1],
            innerSwCoords = innerBoundsCoords[0];

        return outerNeCoords[0] >= innerNeCoords[0] &&
            outerNeCoords[1] >= innerNeCoords[1] &&
            outerSwCoords[0] <= innerSwCoords[0] &&
            outerSwCoords[1] <= innerSwCoords[1];
    }

    function createAndRenderQuadtree(bounds) {
        var xyPoints = collectionToXyPoints(),
            quadtree = createQuadTree(xyPoints, bounds),
            nodes = flattenQuadtree(quadtree),
            groupsToRender,

            containingBoundsSet;

        _.each(rects, function (rect) {
            rect.setMap(null);
        });

        containingBoundsSet = _.map(getContainingBounds(nodes), function (node, index) {
            var nodeBounds = node.bounds,
                xyBounds = pointsToGoogleLatLngBounds(
                    nodeBounds.x1,
                    nodeBounds.y1,
                    nodeBounds.x2,
                    nodeBounds.y2
                );

            xyBounds.id = index;

            return xyBounds;
        });

        groupsToRender = _.filter(containingBoundsSet, function (outerBounds) {
            var containsOthers = false;

            _.each(containingBoundsSet, function (innerBounds) {
                if (boundsContainedBy(innerBounds, outerBounds) && outerBounds.id != innerBounds.id) {
                    containsOthers = true;
                }
                return !containsOthers;
            });

            return !containsOthers;
        });

        _.each(groupsToRender, function (childBounds) {
            rects.push(googleMapsRectangleFromBounds(childBounds));
        });

        app.containingBounds = containingBoundsSet;

        return quadtree;
    }

    Backbone.Events.on('map-loaded', function () {
        mapLoaded.resolve();
    });

    $.when(mapLoaded, loaded).done(function () {
        var quadtree;

        Backbone.Events.on('zoom-change', function (bounds) {
            createAndRenderQuadtree(bounds);
        });

        Backbone.Events.on('bounds-change', function (bounds) {
            createAndRenderQuadtree(bounds);
        });

        collection.each(function (item) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(item.attributes.location.lat, item.attributes.location.lng)
            });

            marker.setMap(app.map);
        });

        quadtree = createAndRenderQuadtree(app.map.getBounds());

        app.quadtree = quadtree;
    });

}(app));
