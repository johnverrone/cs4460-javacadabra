var margin = {top: 30, right: 10, bottom: 20, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2;

var sunburstX = d3.scale.linear().range([0, 2 * Math.PI]);
var sunburstY = d3.scale.sqrt().range([0, radius]);

var partition = d3.layout.partition()
    .children(d => Array.isArray(d.values) ? d.values : null)
    .value(d => d.value);

var arc = d3.svg.arc()
    .startAngle(d => Math.max(0, Math.min(2 * Math.PI, sunburstX(d.x))))
    .endAngle(d => Math.max(0, Math.min(2 * Math.PI, sunburstX(d.x + d.dx))))
    .innerRadius(d => Math.max(0, sunburstY(d.y)))
    .outerRadius(d => Math.max(0, sunburstY(d.y + d.dy)));

var sunburst1 = d3.select("#sunburst").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" +
            (margin.left + width  / 2) + "," +
            (margin.top  + height / 2) + ")");

var tooltip2 = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var year = 0;

d3.csv("data/total_production.csv", type, renderSunburst);

function renderSunburst(error, data) {
    if (error) throw error;

    var hierarchy = {
        key: "World",
        values: d3.nest()
            .key(d => d.year)
            .key(d => d.continent)
            .key(d => d.region)
            .entries(data)
    };

    // Add a container for the tooltip.
    var tooltip = sunburst1.append("text")
        .attr("font-size", 12)
        .attr("fill", "#FFF")
        .attr("fill-opacity", 0)
        .attr("text-anchor", "middle")
        .attr("transform", `translate(0, ${(12 + height/2)})`)
        .style("pointer-events", "none");

    // Add the title.
    sunburst1.append("text")
        .attr("font-size", 16)
        .attr("fill", "#FFF")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(0, ${(-10 -height/2)})`)
        .text("Coffee Production by Country");

    // Add the year.
    var yearLabel = sunburst1.append("text")
        .attr("font-size", 40)
        .attr("fill", "#FFF")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0, 10)")
        .text(hierarchy.values[year].key);

    function click(d) {
        path.transition()
            .duration(750)
            .attrTween("d", arcTween(d));
        mouseout();
    };

    function mouseover(d) {
        tooltip2.transition()
            .duration(200)
            .style("opacity", .85);

//        var leftPos = d3.event.pageX < window.innerWidth / 2 ? "337px" : "1085px";

        tooltip2.html("<strong>" + d.key + "</strong><br/>" + (d.depth == 2 ? d.parent.key + "<br/>": "") + (d.depth == 3 ? d.parent.parent.key + " (" + d.parent.key + ")<br/>": "") + "<span class='tooltip-label'>" + numberWithCommas(d.value * 1000) + "</span><br/>60kg bags of coffee")
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    };

    function mouseout() {
        tooltip.transition()
            .attr("fill-opacity", 0);

        tooltip2.transition()
           .duration(500)
           .style("opacity", 0);
    };

    function mousemove() {
        tooltip2.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function arcTween(d) {
        var xd = d3.interpolate(sunburstX.domain(),
                    [d.x, d.x + d.dx]),
            yd = d3.interpolate(sunburstY.domain(),
                    [d.y, 1]),
            yr = d3.interpolate(sunburstY.range(),
                    [d.y ? 20 : 0, radius]);
        return function(d, i) {
            return i ?
                function(t) {
                    return arc(d);
                } :
                function(t) {
                    sunburstX.domain(xd(t));
                    sunburstY.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
        };
    };

    // Bind data
    var path = sunburst1.selectAll("path").data(partition.nodes(hierarchy.values[year]));

    // Enter
    path.enter().append("path")
        .attr("stroke", "bar")
        .attr("fill-rule", "evenodd");

    // Update
    path
        .attr("d", arc)
        .attr("data-key", d => d.key)
        .attr("stroke", "#FFF")
        .attr("fill-rule", "evenodd")
        .attr("fill", colorSunburst)
        .on("click", click)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);

    // Exit
    path.exit().remove();
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var colorSunburst = function(d) {
    var colors;

    if (!d.parent) {
        colors = d3.scale.category10().domain(d3.range(0,10));
        d.color = "transparent";
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