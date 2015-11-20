var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");

var line = d3.svg.line()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .interpolate("linear");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var partition = d3.layout.partition()
    .children(d => Array.isArray(d.values) ? d.values : null)
    .value(d => d.value);

var color = d3.scale.category10().domain(d3.range(0,10));

d3.csv("data/total_production.csv", type, renderLineChart);

function renderLineChart(error, data) {
    if (error) throw error;

    var hierarchy = {
        key: "World",
        values: d3.nest()
            .key(d => d.year)
            .key(d => d.continent)
            .key(d => d.region)
            .entries(data)
    };

    console.log(data);
    console.log(hierarchy);
    partition.nodes(hierarchy);

    var all_years = data.map(d => d.year);
    var all_production = data.map(d => d.value);

    x.domain(all_years);
    y.domain(d3.extent(all_production));

//    var country_g = svg.selectAll(".country_g")
//        .data(data)
//        .enter().append("g")
//        .attr("class", "country_g");
//
//    var country_line = country_g.append("path")
//        .attr("class", "line")
//        .attr("data-country-id", d => d.country)
//        .attr("d", d => line(d.production))
//        .attr("stroke", d => color(d.continent));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("path")
        .attr("class", "line")
        .attr("d", line(data));
}