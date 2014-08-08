(function(global) {
    'use strict';

    function ns (parent_ns, ns_string, extent) {
        var ns_parts = ns_string.split('.'),
            hlq = 'app',
            parent = parent_ns,
            i;

        if (ns_parts[0] === hlq) {
            ns_parts = ns_parts.slice(0);
        }

        for (i = 0; i < ns_parts.length; i += 1) {
            if (parent[ns_parts[i]] === undefined) {
                if (extent) {
                    parent[ns_parts[i]] = extent;
                } else {
                    parent[ns_parts[i]] = {};
                }
            }

            parent = parent[ns_parts[i]];
        }

        return parent;
    }

    function bindNS (parent_ns, ns_string, extent) {
        ns.apply(this, [parent_ns, ns_string, extent]);
    }

    global.app = {
        ns: ns,
        bindNS: bindNS
    };

}(this));
;function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(40.01144663490021, -90.22767623046876),
        zoom: 7
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
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
google.maps.event.addDomListener(window, 'load', initialize);;(function (app) {
    app.ns(app, 'IowaGeoJson', function () {
        return [
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Dallas","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.8166,41.8638],[-93.7892,41.5133],[-93.8221,41.5078],[-94.2438,41.5023],[-94.2438,41.6009],[-94.2821,41.6009],[-94.2821,41.8638],[-94.1617,41.8638],[-93.8166,41.8638]]]]}}
            ]},
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Polk","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.7728,41.8638],[-93.6961,41.8638],[-93.3456,41.8638],[-93.3292,41.5078],[-93.3292,41.4914],[-93.7071,41.5133],[-93.7892,41.5133],[-93.8166,41.8638],[-93.7728,41.8638]]]]}}
            ]},
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Warren","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.7071,41.5133],[-93.3292,41.4914],[-93.3292,41.1627],[-93.5592,41.1627],[-93.6742,41.1627],[-93.7892,41.1627],[-93.7892,41.5133],[-93.7071,41.5133]]]]}}
            ]},
            {"type":"FeatureCollection","properties":{"kind":"state","state":"IA"},"features":[
                {"type":"Feature","properties":{"kind":"county","name":"Madison","state":"IA"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-93.8221,41.5078],[-93.7892,41.5133],[-93.7892,41.1627],[-94.0138,41.1573],[-94.2438,41.1573],[-94.2438,41.5023],[-93.8221,41.5078]]]]}}
            ]}
        ];
    });
}(app));;(function (app) {
    app.ns(app, 'AnswersModel', Backbone.Model.extend({
        initialize: function () {  }
    }));
}(app));;(function (app) {
    app.ns(app, 'AnswerCollection', Backbone.Collection.extend({
        model: app.AnswersModel,

        initialize: function () {
            this.loaded = $.Deferred();
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
}(app));;(function (app) {
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

//# sourceMappingURL=quadtree.js.map