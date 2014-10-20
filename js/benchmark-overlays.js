(function (app, root) {
    'use strict';

    var mapLoaded = new $.Deferred(),

        View = Backbone.View.extend({
            className: 'bb-view',

            template: function (data) {
                return root.dist.vanillaOverlay(data);
            },

            initialize: function () {
                this.render();
            },

            render: function () {
                this.el.innerHTML = this.template(this.model.attributes);
            }
        });

    function randomLatLng() {
        var randomLat = _.random(39.1, 42.1),
            randomLng = _.random(87.1, 100.1);

        return {
            lat: randomLat,
            lng: randomLng - randomLng * 2
        };
    }

    function newView(element, model) {
        return new View({el: element, model: model});
    }

    function init() {
        var collection = new Backbone.Collection();

        _.times(1000, function () {
            var point = randomLatLng(),
                model = new Backbone.Model({point: point, name: 'john doe'});

            collection.add(model);
        });

        Backbone.Events.on('map-loaded', function (map) {
            mapLoaded.resolve(map);
        });

        mapLoaded.done(function (map) {
            var elements = [];

            collection.each(function (model) {
                var element = document.createElement('div'),
                    vanillaOverlay = new app.VanillaOverlay(element, model.get('point'));

                elements.push(element);
                vanillaOverlay.setMap(map);
                newView(element, model);
            });

            //_.each(elements, function (element) {
            //    element.style.display = 'block';
            //});
        });
    }

    init();
}(app, this));
