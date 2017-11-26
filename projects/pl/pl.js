// GLOBAL VARIABLES
var data;
var series;
var d3;
var w = 1000;
var h = 500;
var padding = 100;
var bandwidth = (1000 - padding) / 20;
var cities = [];
var colors = ["brown", "darkcyan"];

var rowConverter = function (d, i) {
  return {
    city: d.city,
    force: parseInt(d.police_force_size),
    percentIn: parseFloat(d.all),
    forceIn: Math.round(parseInt(d.police_force_size) * d.all),
    forceOut: Math.round(parseInt(d.police_force_size) - (parseInt(d.police_force_size) * parseFloat(d.all))),
    key: i // add a key equal to the initial index
  }
}

var stack = d3.stack()
  .keys(["forceOut", "forceIn"])
  .order(d3.stackOrderDescending);

// GET THE DATA
d3.csv("police-locals-top-20.csv", rowConverter, function(dataset) {
  data = dataset;
  buildIt();
});

// BUILD the SVG
function buildIt() {
  series = stack(data); 
  data.forEach(function(d) { cities.push(d.city) });
  var local = d3.select(".controls").append("button").attr("id", "local").text("% local");
  var forceSize = d3.select(".controls").append("button").attr("id", "force-size").text("force size");
  
  var svg = d3.select(".plot").append("svg").attr("width", w).attr("height", h);
  
    // SCALES
  var xScale = d3.scaleBand()
    .domain(cities)
    .range([padding, w - padding])
    .paddingInner(0.25);
  
  var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {return d.forceIn + d.forceOut})])
    .range([h - padding, padding])
  
  // SET AXES
  var xAxis = d3.axisBottom()
    .scale(xScale)
  var yAxis = d3.axisLeft()
    .scale(yScale)
  
  // CREATE BARS
  var groups = svg.selectAll("g")
    .data(series)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("fill", function (d,i) {
      return colors[i];
  })
  
  var bars = groups.selectAll("rect")
    .data(function (d) { return d; })
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d,i) {
      return xScale(d.data.city);
    })
    .attr("y", function (d) {
      return yScale(d[1]);
    })
    .attr("height", function (d) {
      return yScale(d[0]) - yScale(d[1]);
    })
    .attr("width", xScale.bandwidth())
    .on("mouseover", function (d, i) {
      var tooltip = svg.append("g")
        .attr("id", "tooltip");
      var tooltipCity = tooltip
          .append("text")
          .text(function () {
            return d.data.city;
          })
          .attr("text-anchor", "start")
          .attr("x", w / 2 - 100)
          .attr("y", 115)
          .attr("font-family", "sans-serif")
          .attr("font-size", "28px") 
          .attr("fill", "darkcyan");
      var tooltipTotal = tooltip
          .append("text")
          .text(function () {
            return d.data.force.toLocaleString() + " total";
          })
          .attr("text-anchor", "start")
          .attr("x", w / 2 - 100)
          .attr("y", 150)
          .attr("font-family", "sans-serif")
          .attr("font-size", "28px") 
          .attr("fill", "darkcyan");
      var toolTipLocal = tooltip
          .append("text")
          .text(function () {
            return ((d.data.percentIn)*100).toFixed(2) + "% local"; 
          })
          .attr("text-anchor", "start")
          .attr("x", w / 2 - 100)
          .attr("y", 185)
          .attr("font-family", "sans-serif")
          .attr("font-size", "28px") 
          .attr("fill", "darkcyan")
        })
      .on("mouseout", function (d, i) {
        d3.select("#tooltip").remove();
      });    
  
  // RENDER AXES
  // x-axis
  svg.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);
  
  // x-axis label
  svg.append("text")
    .attr("x", (w / 2) - 50)
    .attr("y", h - 5)
    .attr("class", "axis x")
    .attr("font-size", "18px")
    .style("text-anchor", "middle")
    .text("City");
  
  svg.selectAll(".axis.x text")
    .attr("text-anchor","end")
    .attr("font-size", "12px")
    .attr("transform","rotate(-65) translate(0,0)");
  
  // y-axis
  svg.append("g")
    .attr("class", "axis y")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis); 
  
  // y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0 - (h / 2))
    .attr("dy", "1em")
    .attr("font-size", "18px")
    .style("text-anchor", "middle")
    .text("Size of Police Force");
  
 
 
  d3.select("#local").on("click", function () {
    sortBars("local");
  });
  
  d3.select("#force-size").on("click", function () {
    sortBars("force");
  });
  
  function sortBars(sortMetric) {
    var sortOrder = sortMetric;
    
    svg.selectAll(".bar")
      .sort(function (a,b) {
      if (sortOrder === "local") {
        return d3.descending(a.data.percentIn, b.data.percentIn);
      } else {
        return d3.ascending(a.data.key, b.data.key);
      }
    })
    .transition(sortBars)
    .duration(500)
    .attr("x", function (d, i) {
      return xScale(i);
    })
    .attr("y", function (d) {
      return yScale(d[1]);
    })
    .attr("height", function (d) {
      return yScale(d[0]) - yScale(d[1]);
    })
    .attr("width", xScale.bandwidth())
  }
}
