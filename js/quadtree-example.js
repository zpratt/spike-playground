(function (app) {
    var collection = new Backbone.Collection(),
        loaded = collection.fetch({url: '/dummy-data.json'}),
        mapLoaded = $.Deferred(),
        rects = [];

    function convertLatLngToXy(latLng) {
        var projection = app.map.getProjection(),
            gLatLng = new google.maps.LatLng(latLng.lat, latLng.lng),
            point = projection.fromLatLngToPoint(gLatLng);

        return {x: point.x, y: point.y};
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

    function pointInBounds(point, bounds) {
        var projection = app.map.getProjection(),
            latLng = projection.fromPointToLatLng(new google.maps.Point(point.x, point.y));

        return bounds.contains(latLng);
    }

    function createQuadTree(xyPoints, inputBounds) {
        var quadtree,

            pointsInBounds = _.filter(xyPoints, function (point) {
                return pointInBounds(point, inputBounds)
            });

        if (xyPoints.length === pointsInBounds.length) {
            quadtree = d3.geom.quadtree()
                .extent([ [0, 0], [255, 255] ])
            (pointsToArray(pointsInBounds));
        } else {
            quadtree = d3.geom.quadtree(pointsInBounds);

        }

        updateNodes(quadtree);

        return quadtree;

    }

    function pointsToGoogleLatLngBounds(x1, y1, x2, y2) {
        var projection = app.map.getProjection(),
            swGeo = projection.fromPointToLatLng(new google.maps.Point(x1, y1)),
            neGeo = projection.fromPointToLatLng(new google.maps.Point(x2, y2));

            return new google.maps.LatLngBounds(swGeo, neGeo);
    }

    function flattenQuadtree(quadtree) {
        var nodes = [];

        quadtree.visit(function (node) {
            nodes.push(node);
        });

        return nodes;
    }

    function googleMapsRectangleFromBounds(bounds) {
        return new google.maps.Rectangle({
            bounds: bounds,
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
        var outerNe = outerBounds.ne,
            outerSw = outerBounds.sw,
            innerSw = innerBounds.sw,
            innerNe = innerBounds.ne;

        return outerNe.x >= innerNe.x &&
            outerNe.y >= innerNe.y &&
            outerSw.x <= innerSw.x &&
            outerSw.y <= innerSw.y;
    }

    function createAndRenderQuadtree(bounds) {
        var xyPoints = collectionToXyPoints(),
            quadtree = createQuadTree(xyPoints, bounds),
            nodes = flattenQuadtree(quadtree),

            boundsContainsBounds = {},

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

        _.each(containingBoundsSet, function (childBounds) {
            var xyBounds = convertGoogleMapBoundsToXY(childBounds);

            _.times(containingBoundsSet.length, function (index) {
                var boundsComparedTo = containingBoundsSet[index];

                if (boundsComparedTo.id != childBounds.id) {
                    var containingXy = convertGoogleMapBoundsToXY(boundsComparedTo),
                        isBoundsContained = boundsContainedBy(containingXy, xyBounds);

                    if (isBoundsContained) {
                        if (boundsContainsBounds[childBounds.id]) {
                            boundsContainsBounds[childBounds.id].push(boundsComparedTo.id);
                        } else {
                            boundsContainsBounds[childBounds.id] = [boundsComparedTo.id];
                        }
                    }
                }
            });
        });

        _.each(boundsContainsBounds, function (value, key, boundsMapping) {
            if (!boundsMapping[value]) {
                rects.push(googleMapsRectangleFromBounds(containingBoundsSet[value]));
            }
        });

        app.containingBounds = containingBoundsSet;
        app.boundsContainsBounds = boundsContainsBounds;

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
