// GLOBAL VARIABLES
var data;
var d3;

var w = 300;
var h = 250;
var padding = 50;

// GET THE DATA
d3.csv("police_killings_state.csv", function(dataset) {
  data = dataset;
  buildIt();
});

// GIVEN STATE INITIALS, CREATE SCATTER PLOT WITH THE DATA FOR THAT STATE
function makeStatePlot(stateInitials) {
  
  var stateData = data.filter(function(killing) {
    return killing.state === stateInitials.toUpperCase();
  });
  var stateClass = "." + stateInitials.toLowerCase().toString();
  var svg = d3.select(stateClass).append("svg").attr("width", w).attr("height", h);
  
  
  // SCALES
  var xScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {return d.age})])
    .range([padding, w - padding])
    .nice();
  var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {return parseFloat(d.pov)})])
    .range([h - padding, padding])
    .nice();
  
  // SET AXES
  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(5);
  var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(5)
  
  // DOTS
  // Create a group with interactivity
  var group = svg.selectAll("g")
    .data(stateData)
    .enter()
    .append("g")
    .on("mouseover", function (d) {
      d3.select(this)
        .select("circle")
        .attr("r", 8)
        .attr("fill", "indianred");
      svg.append("text")
        .attr("id", "tooltip")
        .text(function () {
          return d.name + ": " + d.month + " " + d.day;
        })
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", 15)
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("fill", "darkblue");
      })
    .on("mouseout", function (d) {
      d3.select(this)
        .select("circle")
        .attr("r", 5)
        .attr("fill", "darkblue")
      d3.select("#tooltip").remove();
    });
  
    
  // Add a dot to the group
  var dots = group
    .append("circle")
    .attr("cx", function (d) {return xScale(d.age)})
    .attr("cy", function (d) {return yScale(d.pov)})
    .attr("r", function (d) {return 5})
    .attr("fill", function (d) {return "darkblue"})
    .style("opacity", function (d) {return 0.6});
  
  // RENDER AXES
  // x-axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);
  
  // x-axis label
  svg.append("text")
    .attr("x", w / 2)
    .attr("y", h - 10)
    .attr("font-size", "14px")
    .style("text-anchor", "middle")
    .text("Age");
  
  // y-axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis); 
  
  // y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x",0 - (h / 2))
    .attr("dy", "1em")
    .attr("font-size", "14px")
    .style("text-anchor", "middle")
    .text("% Poverty of Census Tract");
}

function buildIt() {
  // create a stateInitials array
  var stateInitials = [];
  // go through each line of data (forEach)
  data.forEach(function(killing){
    // if that killing's state is not yet in the stateInitials array
    if (stateInitials.indexOf(killing.state)===-1) {
      // add the state initials to stateInitials
      stateInitials.push(killing.state);
    }
  })

  // then, make a state plot for each set of state initials in the stateInitials array
   stateInitials.forEach(function(state) {
    makeStatePlot(state);
  })
   
  
}
  

    
    












