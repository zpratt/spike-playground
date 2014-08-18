(function (app) {
    'use strict';

    function createPathWith(projection) {
        return d3.geo.path()
            .projection(projection);
    }

    function SvgBoundary(element, dimensions) {
        this.element = element;
        this.height = dimensions.height;
        this.width = dimensions.width;
    }

    _.extend(SvgBoundary.prototype, {
        render: function (feature, projection) {
            var fragment = document.createDocumentFragment(),
                path = createPathWith(projection),
                svg = d3.select(fragment).append('svg');

            svg
                .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
                .selectAll('path')
                .data(feature.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', 'url(#diagonalHatch)');

            this.element.appendChild(fragment);

            return svg;
        }
    });

    app.ns(app, 'SvgBoundary', SvgBoundary);

}(app));
