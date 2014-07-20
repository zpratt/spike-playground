(function (app) {

    function createSvg(element, width, height) {
        return d3.select(element).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    }

    function graph(element, data) {
        var width = 100,
            height = 100,
            radius = Math.min(width, height) / 2,

            color,
            arc,
            pie,
            svg,
            g;

        color = d3.scale.ordinal()
            .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

        arc = d3.svg.arc()
            .outerRadius(radius - 60)
            .innerRadius(radius - 70);

        pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.percent_done;
            });

        svg = createSvg(element, width, height);

        g = svg.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', arc)
            .style('fill', function(d) {
                var value = d.data.percent_done;

                return color(value);
            });

        g.append('text')
            .attr('transform', function(d) {
                return 'translate(' + arc.centroid(d) + ')';
            })
            .attr('dy', '.35em')
            .style('text-anchor', 'middle');
    }

    app.ns(app, 'donut', {
        graph: graph
    });

}(app));