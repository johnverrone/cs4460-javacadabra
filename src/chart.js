var margin = {top: 30, right: 10, bottom: 20, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2;

var x = d3.scale.linear().range([0, 2 * Math.PI]);
var y = d3.scale.sqrt().range([0, radius]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");

var partition = d3.layout.partition()
    .children(d => Array.isArray(d.values) ? d.values : null)
    .value(d => d.value);

var arc = d3.svg.arc()
    .startAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x))))
    .endAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))))
    .innerRadius(d => Math.max(0, y(d.y)))
    .outerRadius(d => Math.max(0, y(d.y + d.dy)));

var sunburst1 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" +
            (margin.left + width  / 2) + "," +
            (margin.top  + height / 2) + ")");

//function yearChange() {
//    var sliderValue = document.getElementById("yearRange").value;
//    var yearBeg = '19';
//    var yearEnd = '90';
//    var year2End = '91';
//    if (sliderValue < 9) {
//        yearBeg = '19';
//        yearEnd = '9' + sliderValue;
//        year2End = '9' + (parseFloat(sliderValue) + 1);
//    } else if (sliderValue == 9) {
//        yearBeg = '19';
//        yearEnd = '99';
//        year2End = '00';
//    } else if (sliderValue < 19) {
//        yearBeg = 20;
//        yearEnd = '0' + sliderValue % 10;
//        year2End = '0' + (parseFloat(sliderValue % 10) + 1);
//    } else if (sliderValue == 19) {
//        yearBeg = '20';
//        yearEnd = '09';
//        year2End = '10';
//    } else {
//        yearBeg = '20';
//        yearEnd = '1' + (parseFloat(sliderValue) % 10);
//        year2End = '1' + (parseFloat(sliderValue) % 10 + 1);
//    }
//    year = yearBeg + yearEnd + '/' + year2End;
//    document.getElementById('slideValue').innerHTML = year;
//    d3.csv("data/total_production.csv", type, render1);
//    d3.csv("data/domestic_consumption.csv", type, render2);
//}

function render1(data) {
    data = data.filter(isGoodData);
    renderSunburst(data, sunburst1);
}

//function render2(data) {
//    data = data.filter(isGoodData);
//    renderSunburst(data, sunburst2, year);
//}

d3.csv("data/total_production.csv", type, render1);
//d3.csv("data/domestic_consumption.csv", sunburstType, render2);

function renderSunburst(data, svg) {

    var hierarchy = {
        key: "World",
        values: d3.nest()
            .key(d => d.year)
            .key(d => d.continent)
            .key(d => d.region)
            .key(d => d.country)
//            .rollup(leaves => leaves[0][0])
            .entries(data)
    };

    console.log(hierarchy);
    var year = hierarchy.values[0];


//    // Add a container for the tooltip.
//    var tooltip = svg.append("text")
//        .attr("font-size", 12)
//        .attr("fill", "#FFF")
//        .attr("fill-opacity", 0)
//        .attr("text-anchor", "middle")
//        .attr("transform", `translate(0, ${(12 + height/2)})`)
//        .style("pointer-events", "none");
//
//    // Add the title.
//    svg.append("text")
//        .attr("font-size", 16)
//        .attr("fill", "#FFF")
//        .attr("text-anchor", "middle")
//        .attr("transform", `translate(0, ${(-10 -height/2)})`)
//        .text("Coffee Production by Country in thousand 60kg bags");
//
//    function click(d) {
//        path.transition()
//            .duration(750)
//            .attrTween("d", arcTween(d));
//        mouseout();
//    };
//
//    function mouseover(d) {
//        tooltip.text(d.key + ": " +
//            d.value + " thousand 60kg bag" +
//            (d.value > 1 ? "s" : ""))
//            .transition()
//            .attr("fill-opacity", 1);
//    };
//
//    function mouseout() {
//        tooltip.transition()
//            .attr("fill-opacity", 0);
//    };
//
//    function arcTween(d) {
//        var xd = d3.interpolate(x.domain(),
//                    [d.x, d.x + d.dx]),
//            yd = d3.interpolate(y.domain(),
//                    [d.y, 1]),
//            yr = d3.interpolate(y.range(),
//                    [d.y ? 20 : 0, radius]);
//        return function(d, i) {
//            return i ?
//                function(t) {
//                    return arc(d);
//                } :
//                function(t) {
//                    x.domain(xd(t));
//                    y.domain(yd(t)).range(yr(t));
//                    return arc(d);
//                };
//        };
//    };
//
    // Bind data
    var path = svg.selectAll("path").data(partition.nodes(year));
    console.log(year);

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
        .attr("fill", color);
//        .on("click", click)
//        .on("mouseover", mouseover)
//        .on("mouseout", mouseout);

    // Exit
    path.exit().remove();
}

var color = function(d) {
    var colors;

    if (!d.parent) {
        colors = d3.scale.category10().domain(d3.range(0,10));
        d.color = "#222222";
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