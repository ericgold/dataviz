var data;
var d3;

// var w = parseInt(d3.select('main').style('width'), 10);
// var h = w / 3;
var w = 1000;
var h = 500;
var padding = 75;
//var bottomPadding = 60;

var formatTime = d3.timeFormat("%b %d, %Y");

var rowConverter = function (d) {
  return {
    pollster: d.pollster,
    enddate: new Date(d.enddate),
    approve: parseFloat(d.approve),
    disapprove: parseFloat(d.disapprove),
    samplesize: parseFloat(d.samplesize)
  }
}

d3.csv("trump-approval-oct-17-reduced-oneper.csv", rowConverter, function(dataset) {
  data = dataset;
  buildIt();
});

function buildIt() {
  // create SVG
  var svg = d3.select("main").append("svg").attr("width", w).attr("height", h);
  
  // set SCALES
  var xScale = d3.scaleTime()
    .domain([d3.min(data, function (d) {return d.enddate}),d3.max(data, function (d) {return d.enddate})])
    .rangeRound([padding, w - padding]);
  var yScale = d3.scaleLinear()
    .domain([0, 100])
    .rangeRound([h - padding, padding]);
  var xAxis = d3.axisBottom()
    .scale(xScale)
    .tickFormat(formatTime);
  var yAxis = d3.axisLeft()
    .scale(yScale);
  
  // define LINES
  var lineApprove = d3.line()
    .x(function (d) { return xScale(d.enddate); })
    .y(function (d) { return yScale(d.approve); });
  
  var lineDisapprove = d3.line()
    .x(function (d) { return xScale(d.enddate); })
    .y(function (d) { return yScale(d.disapprove); });
  
  var lineFifty = d3.line()
    .x(function (d) { return xScale(d.enddate); })
    .y(function (d) { return yScale(50); })
  
  // define AREA BETWEEN LINES
  var approvalGap = d3.area()
    .x(function (d) { return xScale(d.enddate); })
    .y0(function (d) { return yScale(d.disapprove); })
    .y1(function (d) { return yScale(d.approve); });
  
  // add AREA BETWEEN LINES
  svg.append("path")
    .datum(data)
    .attr("class", "area middle")
    .attr("d", approvalGap)
    .attr("fill", "lightblue");
  
  // define AREA UNDER APPROVAL LINE
  var approvalArea = d3.area()
    .x(function (d) { return xScale(d.enddate); })
    .y0(function (d) { return yScale(0); })
    .y1(function (d) { return yScale(d.approve); })
  
  // add AREA UNDER APPROVAL LINE
  svg.append("path")
    .datum(data)
    .attr("class", "area approve")
    .attr("d", approvalArea)
    .attr("fill", "plum");
  
  // add LINES (after areas so they show up)
  svg.append("path")
    .datum(data)
    .attr("class", "line disapprove")
    .attr("d", lineDisapprove);
  
  svg.append("path")
    .datum(data)
    .attr("class", "line approve")
    .attr("d", lineApprove);
  
  svg.append("path")
    .datum(data)
    .attr("class", "line fifty")
    .attr("d", lineFifty)
  
  // add invisible interactive groups to disapproval line
   var disapprovalGroup = svg.selectAll("g.disapprove")
    .data(data)
    .enter()
    .append("g")
    .on("mouseover", function (d) {
      d3.select(this)
        .select("circle")
        .attr("fill-opacity", "1");
      svg.append("text")
        .attr("id", "tooltip")
        .text(function () {
          return "Pollster: " + d.pollster + " | Sample Size: " + d.samplesize + " | Disapprove: " + d.disapprove + "%";
        })
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", 100)
        .attr("font-family", "sans-serif")
        .attr("font-size", "18px") 
        .attr("fill", "blue")
      })
    .on("mouseout", function (d) {
      d3.select(this)
        .select("circle")
        .attr("fill-opacity", "0")
      d3.select("#tooltip").remove();
    });
  
    
  // Add a dot to each invisible interactive group on disapproval line
  var disapprovalDots = disapprovalGroup
    .append("circle")
    .attr("cx", function (d) {return xScale(d.enddate)})
    .attr("cy", function (d) {return yScale(d.disapprove)})
    .attr("r", function (d) {return 10})
    .attr("fill", "blue")
    .attr("fill-opacity", function (d) {return "0"})
  
  // add invisible interactive groups to approval line
   var approvalGroup = svg.selectAll("g.approve")
    .data(data)
    .enter()
    .append("g")
    .on("mouseover", function (d) {
      d3.select(this)
        .select("circle")
        .attr("fill-opacity", "1");
      svg.append("text")
        .attr("id", "tooltip")
        .text(function () {
          return "Pollster: " + d.pollster + " | Sample Size: " + d.samplesize + " | Approve: " + d.approve + "%";
          
        })
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", 100)
        .attr("font-family", "sans-serif")
        .attr("font-size", "18px") 
        .attr("fill", "red")
      })
    .on("mouseout", function (d) {
      d3.select(this)
        .select("circle")
        .attr("fill-opacity", "0")
      d3.select("#tooltip").remove();
    });
  
   // Add a dot to each invisible interactive group on disapproval line
   var approvalDots = approvalGroup
    .append("circle")
    .attr("cx", function (d) {return xScale(d.enddate)})
    .attr("cy", function (d) {return yScale(d.approve)})
    .attr("r", function (d) {return 10})
    .attr("fill", "red")
    .attr("fill-opacity", function (d) {return "0"})
    
  
  // add AXES
  svg.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "axis y")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);
  
  // add AXES LABELS
  svg.selectAll(".axis.x text")
    .attr("text-anchor","end")
    .attr("transform","rotate(-65) translate(0,0)");
  
  // y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x",0 - (h / 2))
    .attr("dy", "2em")
    .attr("font-size", "14px")
    .style("text-anchor", "middle")
    .text("Approval (red) | Disapproval (blue)");
}