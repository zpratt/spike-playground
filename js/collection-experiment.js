(function (app) {
    var PetModel = Backbone.Model.extend({
            parse: function (res) {
                var activity = $.getJSON('/dummy-data.json');

                activity.done(_.bind(function (harvestResponse) {
                    _.each(harvestResponse[0], function (value, key) {
                        this.set('activity-' + key, value);
                    }, this);
                }, this));

                debugger;

                return res;
            }
        }),
        PetCollection = Backbone.Collection.extend({
            url: 'experimental-data.json',

            model: PetModel,

            parse: function (res) {
                return res.pets;
            }
        }),

        collection = new PetCollection();


    collection.fetch();

    app.petCollection = collection;

}(app));
