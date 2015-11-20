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
    .value(d => d.values);

d3.csv("data/total_production.csv", type, renderLineChart);

function renderLineChart(error, data) {
    if (error) throw error;

    var hierarchy = {
        key: "World",
        values: d3.nest()
            .key(d => d.continent)
            .key(d => d.region)
            .key(d => d.country)
            .entries(data)
    };

    console.log(partition.nodes(hierarchy));

    var minVal = d3.min(data, d => d3.min(d.values));
    var maxVal = d3.max(data, d => d3.max(d.values));
    var yearsArray = new Array;
    for(var o in data[0].values) {
        yearsArray.push(data[0].values[o].year);
    }
    x.domain(yearsArray);
    y.domain([0, hierarchy.value]).nice();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    for(var i = 0; i < data.length; i++) {
        svg.append("path")
            .attr("class", "line")
            .attr("d", line(data[i].values));
    }
}