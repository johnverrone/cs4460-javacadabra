var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var lineX = d3.scale.ordinal().rangePoints([0, width]);
var lineY = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(lineX).orient("bottom");
var yAxis = d3.svg.axis().scale(lineY).orient("left");

var nest = d3.nest()
    .key(d => d.country)
    .key(d => d.year)
    .rollup(leaves => d3.sum(leaves, d => d.value));

var line = d3.svg.line()
    .x(function(d) { return lineX(d.key); })
    .y(function(d) { return lineY(d.values); });

var container = d3.select("#linechart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var lineSvg = container.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("data/total_production.csv", type, renderLineChart);

function renderLineChart(error, data) {
    if (error) throw error;

    var layers = nest.entries(data);

    var all_years = data.map(d => d.year);

    lineX.domain(all_years);
    lineY.domain([0, 150000]);

    container.on("mousemove", mousemove);

    // from http://bl.ocks.org/mbostock/3902569
    var focus = lineSvg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "red")
        .attr("width", 4)
        .attr("height", height);

    function mousemove() {
        var x = (d3.mouse(this)[0] - margin.left);
        console.log(x);
        // find the closest lineX value
        var range = lineX.range();
        var current = range[0];
        var currentIndex = 0;
        for (var i = 0; i < range.length; i++) {
            if (Math.abs(x - range[i]) < Math.abs(x - current)) {
                currentIndex = i;
                current = range[i];
            }
        }
        console.log(current);
        changeYear(currentIndex);
        focus.attr("x", current - 2);
    }
    // Axes
    lineSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    lineSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Bind data
    var line_layer = lineSvg.selectAll(".line")
        .data(layers);

    // Enter
    line_layer.enter().append("path")
        .attr("class", "line");

    // Update
    line_layer
        .attr("data-key", d => d.key)
        .attr("d", d => line(d.values));

    // Exit
    line_layer.exit().remove();

}