// on select change
// change data 
//then exit and remove
// then enter and append (or vice versa; see below)
// use keys with a key function in global scope as in d3-24
// then .data(data, key)
//      .enter() [for example]

// order best practice in general: enter, update, exit (per Merritt) but you can do a different order
// if it makes sense for a particular graphic


// GLOBAL VARIABLES

var data;
var d3;

var w = 600;
var h = 500;
var padding = 50;

var key = function(d) {
  return d.geo_id;
}



// GET THE DATA
d3.csv("police_killings_state.csv", function(dataset) {
  data = dataset;
  buildIt();
});

// GIVEN STATE INITIALS, CREATE SCATTER PLOT WITH THE DATA FOR THAT STATE
function buildIt() {
  var stateInitials = "OR"; // initialize plot with OR as default state
  var stateData = data.filter(function(killing) {
    return killing.state === stateInitials;
  });
  
  var svg = d3.select(".plot").append("svg").attr("width", w).attr("height", h);
  
  
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
    .data(stateData, key)
    .enter()
    .append("g")
    .attr("class", "container")
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
    .attr("cy", function (d) {return yScale(parseFloat(d.pov))})
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
  
  var selector = d3.select(".control").append("select").attr("id", "selector").style("width", "10rem");
    selector.append("option").attr("label", "AL").attr("value", "AL");
    selector.append("option").attr("label", "CT").attr("value", "CT");
    selector.append("option").attr("label", "KY").attr("value", "KY");
    selector.append("option").attr("label", "LA").attr("value", "LA");
    selector.append("option").attr("label", "OK").attr("value", "OK");
    selector.append("option").attr("label", "OR").attr("value", "OR").attr("selected", "true");
    selector.append("option").attr("label", "SC").attr("value", "SC");
    selector.append("option").attr("label", "UT").attr("value", "UT");
  
  
  // SELECT EVENT LISTENER
  // on select of a new state
  // remove current state data 
  // and replace with selected state data
  
  d3.select("#selector").on("change", function() {
    stateInitials = document.querySelector("#selector").value;
    stateData = data.filter(function(killing) {
      return killing.state === stateInitials;
    });

    group = svg.selectAll(".container")
      .data(stateData);

    // ADD SELECTED STATE DATA
    group.enter()
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
      })
      .merge(group)
      .transition();

      // Add a dot to the group
      dots = group
        .append("circle")
        .transition()
        .attr("cx", function (d) {return xScale(d.age)})
        .attr("cy", function (d) {return yScale(parseFloat(d.pov))})
        .attr("r", function (d) {return 5})
        .attr("fill", function (d) {return "darkblue"})
        .style("opacity", function (d) {return 0.6});
    
    // REMOVE OLD DOTS
    group = svg.selectAll(".container")
      .data(stateData, key);

    group.exit()
      .transition()
      .attr("cx", w)
      .remove();
  })    

}













