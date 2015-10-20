function renderSunburst(data, year) {

    var hierarchy = {
        key: "World",
        values: d3.nest()
            .key(function(d) { return d.continent; })
            .key(function(d) { return d.region; })
            .key(function(d) { return d.country; })
            .rollup(function(leaves) {
                return leaves[0][year];
            })
            .entries(data)
    };


    var partition = d3.layout.partition()
        .children(function(d) {
            return Array.isArray(d.values) ?
                d.values : null;
        })
        .value(function(d) {
            return d.values;
        });

    var arc = d3.svg.arc()
        .startAngle(function(d) {
            return Math.max(0,
                Math.min(2 * Math.PI, x(d.x)));
        })
        .endAngle(function(d) {
            return Math.max(0,
                Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
        .innerRadius(function(d) {
            return Math.max(0, y(d.y));
        })
        .outerRadius(function(d) {
            return Math.max(0, y(d.y + d.dy));
        });

    // Add a container for the tooltip.
    var tooltip = svg.append("text")
        .attr("font-size", 12)
        .attr("fill", "#FFF")
        .attr("fill-opacity", 0)
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + 0 + "," + (12 + height/2)  +")")
        .style("pointer-events", "none");

    // Add the title.
    svg.append("text")
        .attr("font-size", 16)
        .attr("fill", "#FFF")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + 0 + "," + (-10 -height/2)  +")")
        .text("Coffee Production by Country in thousand 60kg bags");

    function click(d) {
        path.transition()
            .duration(750)
            .attrTween("d", arcTween(d));
        mouseout();
    };

    function mouseover(d) {
        tooltip.text(d.key + ": " +
            d.value + " thousand 60kg bag" +
            (d.value > 1 ? "s" : ""))
            .transition()
            .attr("fill-opacity", 1);
    };

    function mouseout() {
        tooltip.transition()
            .attr("fill-opacity", 0);
    };

    function arcTween(d) {
        var xd = d3.interpolate(x.domain(),
                    [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(),
                    [d.y, 1]),
            yr = d3.interpolate(y.range(),
                    [d.y ? 20 : 0, radius]);
        return function(d, i) {
            return i ?
                function(t) {
                    return arc(d);
                } :
                function(t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
        };
    };

    // Bind data
    var path = svg.selectAll("path").data(partition.nodes(hierarchy));

    // Enter
    path.enter().append("path")
        .attr("stroke", "bar")
        .attr("fill-rule", "evenodd");

    // Update
    path
        .attr("d", arc)
        .attr("stroke", "#FFF")
        .attr("fill-rule", "evenodd")
        .attr("fill", color)
        .on("click", click)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    // Exit
    path.exit().remove();
}

var color = function(d) {
    var colors;

    if (!d.parent) {
        colors = d3.scale.category10().domain(d3.range(0,10));
        d.color = "#22180d";
    } else if (d.children) {
        var startColor = d3.hcl(d.color).darker();
        var endColor   = d3.hcl(d.color).brighter();

        // Create the scale
        colors = d3.scale.linear()
                .interpolate(d3.interpolateHcl)
                .range([
                    startColor.toString(),
                    endColor.toString()
                ])
                .domain([0,d.children.length+1]);

    }

    if (d.children) {
        d.children.map(function(child, i) {
            return {value: child.value, idx: i};
        }).sort(function(a,b) {
            return b.value - a.value
        }).forEach(function(child, i) {
            d.children[child.idx].color = colors(i);
        });
    }

    return d.color;
};