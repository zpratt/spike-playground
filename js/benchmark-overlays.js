(function (app, root) {
    'use strict';

    var host = Backbone.history.location.hostname,
        data = '/locations.json',
        dataLoaded,
        endPointUrl = host === 'localhost' ? data : '/spike-playground' + data,
        mapLoaded = new $.Deferred(),

        View = Backbone.View.extend({
            className: 'bb-view',

            template: function (data) {
                return root.dist.vanillaOverlay(data);
            },

            initialize: function () {
                this.render();

                this.listenTo(this.model, 'change:name', this.render);
                this.listenTo(this.model, 'change:id', this.render);
                this.listenTo(this.model, 'change:start', this.render);
                this.listenTo(this.model, 'change:percent_done', this.render);
                this.listenTo(this.model, 'change:location', this.render);
            },

            render: function () {
                this.el.innerHTML = this.template(this.model.attributes);
            }
        });

    function newView(element, model) {
        var view = new View({model: model});

        element.appendChild(view.el);

        return view;
    }

    function init() {
        var collection = new Backbone.Collection();
        dataLoaded = collection.fetch({url: endPointUrl});

        Backbone.Events.on('map-loaded', function (map) {
            mapLoaded.resolve(map);
        });

        mapLoaded.done(function (map) {
            dataLoaded.done(function () {
                //console.time('build markers');
                collection.each(function (model) {
                    var element = document.createElement('div'),
                        vanillaOverlay = new app.VanillaOverlay(element, model.get('location'));

                    vanillaOverlay.setMap(map);
                    newView(element, model);

                    element.style.display = 'block';
                });
                //console.timeEnd('build markers');
            });
        });
    }

    init();
}(app, this));
