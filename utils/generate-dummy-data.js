(function () {
    var fs = require('fs'),
        _ = require('lodash'),
        faker = require('faker'),

        stringType = '<string>',
        intType = '<integer>',
        latLngType = '<lat_lng>',

        numberOfLocationsToCreate = 100,

        locationSkeleton = {
            name: '<string>',
            id: '<integer>',
            start: '2014/07/19 21:00:00',
            percent_done: '10',
            location: latLngType
        },
        outputData = [];

    function randomLatLng() {
        var randomLat = _.random(39.1, 42.1),
            randomLng = _.random(88.1, 90.1);

        return {
            lat: randomLat,
            lng: randomLng - randomLng * 2
        };
    }

    _.times(numberOfLocationsToCreate, function () {
        var location = _.clone(locationSkeleton);

        _.each(location, function (value, key) {
            if (value == stringType) {
                location[key] = faker.Name.lastName();
            }

            if (value == intType) {
                location[key] = faker.Helpers.randomNumber(numberOfLocationsToCreate * 10);
            }

            if (value == latLngType) {
                location[key] = randomLatLng();
            }
        });

        outputData.push(location);
    });

    fs.writeFileSync('locations.json', JSON.stringify(outputData));
}());
