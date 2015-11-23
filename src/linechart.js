var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");

var area = d3.svg.area()
    .interpolate("cardinal")
    .x(d => x(d.key))
    .y0(d => y(d.y0))
    .y1(d => y(d.y0 + d.y));

var stack = d3.layout.stack()
    .values(d => d.values)
    .x(d => d.key)
    .y(d => d.values);

var nest = d3.nest()
    .key(d => d.continent)
    .key(d => d.year)
    .rollup(leaves => d3.sum(leaves, d => d.value));

var color = d3.scale.ordinal()
    .domain(["Africa", "South America", "North America", "Oceania", "Asia"])
    .range(["#27ae60", "#f39c12" , "#e74c3c", "#3498db", "#2c3e50"]);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/total_production.csv", type, renderAreaChart);

function renderAreaChart(error, data) {
    if (error) throw error;

    var layers = stack(nest.entries(data));

    var all_years = data.map(d => d.year);

    x.domain(all_years);
    y.domain([0, d3.max(layers.map(d => d.values.map(f => f.y0 + f.y )).reduce((a,b) => a.concat(b) ))]);

    // Axes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Bind data
    var area_layer = svg.selectAll(".layer")
        .data(layers);

    // Enter
    area_layer.enter().append("path")
        .attr("class", "layer");

    // Update
    area_layer
        .attr("data-key", d => d.key)
        .attr("d", d => area(d.values))
        .attr("fill", d => color(d.key));

    // Exit
    area_layer.exit().remove();

}