(function (app){
    'use strict';

    var SvgFactory = app.SvgBoundaryFactory;

    function renderBoundary(boundary, element, dimensions) {
        var boundarySvg,

            projection = SvgFactory.getMercatorProjection(boundary, dimensions);

        boundarySvg = SvgFactory.create(boundary, element, dimensions, projection);

        return boundarySvg;
    }

    function renderList(counties) {
        var container = document.querySelector('#main-container ul'),
            height = 50,
            width = 50;

        _.each(counties, function (county) {
            var listItem = document.createElement('li'),
                element = document.createDocumentFragment();

            $(listItem).css('height', height);
            $(listItem).css('width', width);
            listItem.className = 'polygon';

            renderBoundary(county, element, {
                height: height,
                width: width
            });

            listItem.appendChild(element);
            container.appendChild(listItem);
        });
    }

    renderList(app.IowaGeoJson());
}(app));
