(function(global) {
    'use strict';

    function ns (parentNamespace, nsString, extent) {
        var namespaceParts = nsString.split('.'),
            hlq = 'app',
            parent = parentNamespace,
            i;

        if (namespaceParts[0] === hlq) {
            namespaceParts = namespaceParts.slice(0);
        }

        for (i = 0; i < namespaceParts.length; i += 1) {
            if (parent[namespaceParts[i]] === undefined) {
                if (extent) {
                    parent[namespaceParts[i]] = extent;
                } else {
                    parent[namespaceParts[i]] = {};
                }
            }

            parent = parent[namespaceParts[i]];
        }

        return parent;
    }

    function bindNS (parentNamespace, namespaceString, extent) {
        ns.apply(this, [parentNamespace, namespaceString, extent]);
    }

    global.app = {
        ns: ns,
        bindNS: bindNS
    };

}(this));

/*global app Backbone*/
(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        defaults: {
            'x_coord': 0,
            'y_coord': 0
        },

        initialize: function () {  }
    }));
}(app));

/*global app Backbone $*/
(function (app) {
    app.ns(app, 'AnswerCollection', Backbone.Collection.extend({
        model: app.AnswersModel,

        initialize: function () {
            this.loaded = new $.Deferred();
        },

        fetch: function () {
            var jqXHR = Backbone.Collection.prototype.fetch.apply(this, arguments);

            jqXHR.done(this.loaded.resolve);
            jqXHR.fail(this.loaded.reject);
        },

        parse: function(response) {
            return response.items;
        },
        url: 'http://api.stackexchange.com/2.2/tags/reactjs/faq?site=stackoverflow'
    }));
}(app));

(function (app) {
    'use strict';

    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(40.583324574181574, -90.72755416015626),
            zoom: 8
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

        app.ns(app, 'map', map);

        google.maps.event.addListener(map, 'idle', function () {
            Backbone.Events.trigger('map-idle');
        });

        google.maps.event.addListener(map, 'zoom_changed', function () {
            Backbone.Events.trigger('zoom-change', map.getBounds());
        });

        google.maps.event.addListener(map, 'bounds_changed', function () {
            Backbone.Events.trigger('bounds-change', map.getBounds());
        });

        google.maps.event.addListenerOnce(map, 'idle', function () {
            Backbone.Events.trigger('map-loaded');
        });
    }
    google.maps.event.addDomListener(window, 'load', initialize);
}(app));

(function (app) {
    'use strict';

    var EPSG_3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
        EPSG_4326 = '+proj=longlat +datum=WGS84 +no_defs',
//        WORLD_BOUNDS = [[-20026376.39, -20048966.10], [20026376.39, 20048966.10]],

        host = Backbone.history.location.hostname,
        collection = new Backbone.Collection(),
        loaded,
        data = '/locations.json',
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,

        mapLoaded = new $.Deferred(),

        rects = [],
        markers = {},
        groupMarkers = {};

    loaded = collection.fetch({url: endPointUrl});

    function coordinatesToXy(lon, lat) {
        return {x: lon, y: lat};
    }

    function convertLatLngToXy(latLng) {
        var projectedPoint = proj4(EPSG_4326, EPSG_3857, [latLng.lng, latLng.lat]);

        return coordinatesToXy(projectedPoint[0], projectedPoint[1]);
    }

    function convertGoogleMapBoundsToXY(inputBounds) {
        var swLatLng = inputBounds.getSouthWest(),
            neLatLng = inputBounds.getNorthEast(),

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
        };
    }

    function filterLeafNodes(nodes) {
        return _.filter(nodes, function (childNode) {
            return (childNode && childNode.leaf);
        });
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
                var leafNodes = filterLeafNodes(node.nodes);
                node.containsLeaf = leafNodes.length > 0;
                node.nodes = _.compact(node.nodes);
            }
        });
    }

    function bboxToPolygonCoordinateArray(swPoint, nePoint) {
        return [
            [
                [nePoint.x, nePoint.y],
                [swPoint.x, nePoint.y],
                [swPoint.x, swPoint.y],
                [nePoint.x, swPoint.y],
                [nePoint.x, nePoint.y]
            ]
        ];
    }

    function bboxToPolygon(swPoint, nePoint) {
        return new Terraformer.Polygon({
            type: 'Polygon',
            coordinates: bboxToPolygonCoordinateArray(swPoint, nePoint)
        });
    }

    function pointInBounds(point, bbox) {
        var swX = bbox.sw.x,
            swY = bbox.sw.y,
            neX = bbox.ne.x,
            neY = bbox.ne.y,
            y = point.y,
            x = point.x;

        return  swX <= x && x <= neX && swY <= y && y <= neY;
    }

    function createQuadTree(xyPoints, inputBounds) {
        var quadtree,
            bbox = convertGoogleMapBoundsToXY(inputBounds),

            pointsInBounds = _.filter(xyPoints, function (point) {
                return pointInBounds(point, bbox);
            });

//        if (xyPoints.length === pointsInBounds.length) {
//            quadtree = d3.geom.quadtree()
//                .extent(WORLD_BOUNDS)(pointsToArray(pointsInBounds));
//        } else {
            quadtree = d3.geom.quadtree(pointsInBounds);
//        }

        updateNodes(quadtree);

        return quadtree;
    }

    function pointsToPolygon(x1, y1, x2, y2) {
        return bboxToPolygon(coordinatesToXy(x1, y1), coordinatesToXy(x2, y2));
    }

    function flattenQuadtree(quadtree) {
        var nodes = {},
            nodeId = 0;

        quadtree.visit(function (node) {
            node.id = nodeId;
            nodes[nodeId] = node;

            nodeId += 1;
        });

        return nodes;
    }

    function terraformerBboxToExtent(inputBounds) {
        var bounds = inputBounds.bbox();
        return [[bounds[0], bounds[1]], [bounds[2], bounds[3]]];
    }

    function projectedCoordinatePairToGoogleLatLng(coordinates) {
        var geographicCoords = proj4(EPSG_3857, EPSG_4326, coordinates);

        return new google.maps.LatLng(geographicCoords[1], geographicCoords[0]);
    }

    function polygonToGoogleLatLngBounds(inputBounds) {
        var bounds = terraformerBboxToExtent(inputBounds),
            swCoords = bounds[0],
            neCoords = bounds[1],

            swGlatLng = projectedCoordinatePairToGoogleLatLng(swCoords),
            neGlatLng = projectedCoordinatePairToGoogleLatLng(neCoords);

        return new google.maps.LatLngBounds(swGlatLng, neGlatLng);
    }

    function getContainingBounds(nodes) {
        return _.filter(nodes, function (childNode) {
            return childNode.containsLeaf;
        });
    }

    function getAllBoundsFromQuadtreeNodes(nodes) {
        return _.map(getContainingBounds(nodes), function (node) {
            var nodeBounds = node.bounds,
                xyBounds = pointsToPolygon(
                    nodeBounds.x1,
                    nodeBounds.y1,
                    nodeBounds.x2,
                    nodeBounds.y2
                );

            xyBounds.id = node.id;

            return xyBounds;
        });
    }

    function hideDebugRectangles() {
        _.each(rects, function (rect) {
            rect.setMap(null);
        });
    }

    function boundsContainedBy(outerBounds, innerBounds) {
        if (outerBounds.id === innerBounds.id) {
            return false;
        }

        var X_COORD = 0,
            Y_COORD = 1,

            innerBoundsCoords = terraformerBboxToExtent(innerBounds),
            outerBoundsCoords = terraformerBboxToExtent(outerBounds),

            outerNeCoords = outerBoundsCoords[1],
            outerSwCoords = outerBoundsCoords[0],
            innerNeCoords = innerBoundsCoords[1],
            innerSwCoords = innerBoundsCoords[0];

        return outerNeCoords[X_COORD] >= innerNeCoords[X_COORD] &&
            outerNeCoords[Y_COORD] >= innerNeCoords[Y_COORD] &&
            outerSwCoords[X_COORD] <= innerSwCoords[X_COORD] &&
            outerSwCoords[Y_COORD] <= innerSwCoords[Y_COORD];
    }

    function filterBoundsThatContainBounds(allBoundsFromQuadtree) {
        return _.filter(allBoundsFromQuadtree, function (outerBounds) {
            var containsOthers = false;

            _.each(allBoundsFromQuadtree, function (innerBounds) {
                if (boundsContainedBy(outerBounds, innerBounds)) {
                    containsOthers = true;
                }
            });

            return !containsOthers;
        });
    }

    function publishHideMarkerFor(nodesInBounds, bounds) {
        _.each(nodesInBounds, function (nodeToHide) {
            Backbone.Events.trigger('hide-marker', {point: {x: nodeToHide.x, y: nodeToHide.y}, bounds: bounds});
        });
    }

    function renderQuadtree(quadtree) {
        var nodes = flattenQuadtree(quadtree),
            lowestDepthBounds,

            allBoundsFromQuadtree;

        hideDebugRectangles();

        allBoundsFromQuadtree = getAllBoundsFromQuadtreeNodes(nodes);

        lowestDepthBounds = filterBoundsThatContainBounds(allBoundsFromQuadtree);

        _.each(lowestDepthBounds, function (childBounds) {
            var nodesInChildBounds = nodes[childBounds.id].nodes;

            publishHideMarkerFor(nodesInChildBounds, childBounds);
        });

        return quadtree;
    }

    function createMarkerForGroup(bounds) {
        var center;

        if (!groupMarkers[bounds.id]) {
            center = polygonToGoogleLatLngBounds(bounds).getCenter();

            groupMarkers[bounds.id] = new google.maps.Marker({
                position: center,
                map: app.map,
                title: 'group ' + bounds.id,
                opacity: 1.0,
                icon: 'blue-marker.png'
            });
        }
    }

    function resetGroupMarkerCache() {
        _.each(groupMarkers, function (marker) {
            marker.setMap(null);
        });

        groupMarkers = {};
    }

    function renderMarker(locationModel) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(locationModel.attributes.location.lat, locationModel.attributes.location.lng),
            title: locationModel.attributes.name,
            opacity: 1.0
        });

        markers[locationModel.id] = marker;

        marker.setMap(app.map);
    }

    function lookupModelByCoordinates(xCoord, yCoord) {
        return collection.where({xCoord: xCoord, yCoord: yCoord})[0];
    }

    function hideMarkerFromCache(id) {
        markers[id].setMap(null);
    }

    function groupMarkersWithin(bounds, point) {
        var model = lookupModelByCoordinates(point.x, point.y);

        hideMarkerFromCache(model.id);

        createMarkerForGroup(bounds);
    }

    function listenToHideMarkerEvent() {
        Backbone.Events.on('hide-marker', function (nodeToHide) {
            groupMarkersWithin(nodeToHide.bounds, nodeToHide.point);
        });
    }

    function renderOnBoundsChange(xyPoints) {
        Backbone.Events.on('bounds-change', function (bounds) {
            resetGroupMarkerCache();

            _.each(markers, function (marker) {
                marker.setOpacity(1.0);
                marker.setMap(app.map);
            });

            renderQuadtree(
                createQuadTree(xyPoints, bounds)
            );

        });
    }

    function updateModelWithProjectedCoordinates(model) {
        var point = convertLatLngToXy(model.attributes.location);

        model.set('xCoord', point.x);
        model.set('yCoord', point.y);

        return point;
    }

    function init() {
        Backbone.Events.on('map-loaded', function () {
            mapLoaded.resolve();
        });

        listenToHideMarkerEvent();

        $.when(mapLoaded, loaded).done(function () {
            var xyPoints = [],
                modelIndex,
                model;

            for (modelIndex = 0; modelIndex < collection.length; modelIndex += 1) {
                model = collection.models[modelIndex];

                xyPoints.push(updateModelWithProjectedCoordinates(model));
                renderMarker(model);
            }

            renderOnBoundsChange(xyPoints);

            renderQuadtree(
                createQuadTree(xyPoints, app.map.getBounds())
            );
        });
    }

    init();
}(app));

//# sourceMappingURL=quadtree.js.map