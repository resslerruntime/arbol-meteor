import * as d3 from "d3";
import './threshold.js'

////////////////////////////////////////////
// svg chart
////////////////////////////////////////////

var svg, width, height, margin = {top: 40, right: 50, bottom: 45, left: 50};
var dataExtents, svgStart, svgEnd;
var multiYrAvg;

//n = number of years in chart
drawMonths = function (n){
  svg = d3.select("svg#chart");
  width = +svg.attr("width") - margin.left - margin.right;
  height = +svg.attr("height") - margin.top - margin.bottom;

  var data = [];
  for(let i = 0; i < n; i++){
    data.push(0);
  }
  multiYrAvg = 0;
  dataExtents = d3.extent(data, function(d){return d;});

  svgStart = new Date(2017-n, 5, 1);
  svgEnd = new Date(2017, 8, 1);
  var x = d3.scaleTime()
      .rangeRound([0, width])
      .domain([svgStart,svgEnd]);
  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);
  var ymm = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]*25.4]);

  let g = svg.append("g")
    .attr("transform",`translate(${margin.left}+${margin.top})`);

  //yaxis
  g.append("g")
    .call(d3.axisLeft(y).ticks(4))
    .attr("class","yaxis")
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -35)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .attr("font-size","15px")
    .text("Total Precipitation (inches)");

  g.append("g")
    .call(d3.axisRight(ymm).ticks(4))
    .attr("class","yaxis-mm")
    .attr("transform",`translate(${width},0)`)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(90)")
    .attr("y", -50)
    .attr("x", 200)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .attr("font-size","15px")
    .text("Total Precipitation (mm)");

  //draw bars
  let barWidth = width*0.5/n;
  g.append("g")
    .attr("class","bars")
    .selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("class","bars")
    .attr("y",d => y(d))
    .attr("x",(d,i) => x(new Date(2018 - n + i, 0, 1)) - barWidth/2)
    .attr("width",barWidth)
    .attr("height",d => height - y(d) + 1)
    .attr("fill","#b5ffc0")
    .attr("stroke","green")
    .attr("stroke-width","4")
    .attr("stroke-dasharray", d => `${barWidth},${barWidth}`)
    .attr("opacity",1e-6);

  //xaxis
  g.append("g")
    .call(d3.axisBottom(x).ticks(9))
    .attr("class","xaxis")
    .attr("transform", `translate(0,${height})`)
    .append("text")
    .attr("fill", "#000")
    .attr("y", 40)
    .attr("x", width/2 )
    .attr("text-anchor", "middle")
    .attr("font-size","15px")
    .text("Year");

  g.append("line")
    .attr("class","multiYrAvg")
    .attr("y1",function(d){return y(multiYrAvg);})
    .attr("y2",function(d){return y(multiYrAvg);})
    .attr("x1",width*0.025)
    .attr("x2",width*0.975)
    .attr("stroke","black")
    .attr("stroke-width",4)
    .attr("stroke-dasharray","12, 8")
    .attr("opacity",1e-6);

  //title
  g.append("text")
    .attr("class","title")
    .attr("fill", "#000")
    .attr("y", -15)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .attr("font-size","16px")
    .attr("font-family","sans-serif")
    .attr("text-decoration","underline");

  defaultMonths();
}

function defaultMonths(){
  //select something as default
  // let d1 = new Date().getTime();
  // let d2 = new Date().getTime() + 1000*3600*24*30; //add a month
  // $('#start-date')[0].value = new Date(d1).toISOString().substring(0,7);
  // $('#end-date')[0].value = new Date(d2).toISOString().substring(0,7);
  // let s = +$('#start-date')[0].value.split("-")[1];
  // let e = +$('#end-date')[0].value.split("-")[1];
  // MONTHCODE = e;
  // DURATIONCODE = e - s + 1;
}

updateMonths = function (o){
  svg = d3.select("svg#chart");
  width = +svg.attr("width") - margin.left - margin.right;

  dataExtents = d3.extent(o.data, function(d){return d;});
  multiYrAvg = o.avg;

  svgStart = new Date(o.start-1, 5, 1);
  svgEnd = new Date(o.start+o.years-1, 8, 1);
  var x = d3.scaleTime()
      .rangeRound([0, width])
      .domain([svgStart,svgEnd]);
  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);
  var ymm = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]*25.4]);

  //title
  d3.selectAll("text.title")
    .text(o.title);

  //yaxis
  d3.selectAll("g.yaxis")
    .transition().duration(1000)
    .call(d3.axisLeft(y).ticks(4));

  d3.selectAll("g.yaxis-mm")
    .transition().duration(1000)
    .call(d3.axisRight(ymm).ticks(4));

  //draw bars
  let rel = $("#threshold-relation")[0].value;
  let pct = $("#threshold-percent")[0].value;
  let avg = $("#threshold-average")[0].value;
  let ro = threshObj(rel);
  let n = threshValFraction(pct, avg);

  let barWidth = width*0.5/o.years;
  d3.selectAll("g.bars")
    .selectAll("rect")
    .data(o.data)
    .transition().duration(1000)
    .attr("y",d => y(d))
    .attr("height",d => height - y(d) + 1)
    .attr("fill",d => d >= o.avg*n ? ro.caFill : ro.cbFill)
    .attr("stroke",d => d >= o.avg*n ? ro.caStroke : ro.cbStroke)
    .attr("stroke-dasharray",d => `${barWidth + height - y(d) + 1},${barWidth}`)
    .attr("opacity",1);

  //xaxis
  d3.selectAll("g.xaxis")
    .transition().duration(1000)
    .call(d3.axisBottom(x).ticks(9));

  d3.selectAll("line.multiYrAvg")
    .transition().duration(1000)
    .attr("y1",function(d){return y(o.avg);})
    .attr("y2",function(d){return y(o.avg);})
    .attr("opacity",1);
}

changeThreshold = function (){
  let rel = $("#threshold-relation")[0].value;
  let pct = $("#threshold-percent")[0].value;
  let avg = $("#threshold-average")[0].value;

  let ro = threshObj(rel);
  let n = threshValFraction(pct, avg);

  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);

  d3.selectAll("g.bars")
    .selectAll("rect")
    .transition().duration(1000)
    .attr("fill", d => d >= multiYrAvg*n ? ro.caFill : ro.cbFill)
    .attr("stroke", d => d >= multiYrAvg*n ? ro.caStroke : ro.cbStroke);

  d3.selectAll("line.multiYrAvg")
    .transition().duration(1000)
    .attr("y1",function(d){return y(multiYrAvg*n);})
    .attr("y2",function(d){return y(multiYrAvg*n);});
}

var pData;
calcPct = function (o = pData){
  console.log("calcPct",o)
  pData = o;
  //go through data object and decide how many
  //times in the past 10 years met the threshold
  let rel = $("#threshold-relation")[0].value;
  let pct = $("#threshold-percent")[0].value;
  let avg = $("#threshold-average")[0].value;
  let rov = threshVal(rel);
  let n = threshValFraction(pct, avg);

  let l = pData.data.length;
  let sum = 0;
  for(let i = 0; i < l; i++){
    pData.data[i] >= pData.avg*n ? sum += 1 : sum += 0;
  }
  //sum * 10 is probability
  let finalPct = Math.round(sum*100/o.years);
  if(!rov) finalPct = 100 - finalPct;
  $("#ten-yr-prob").html(`<span id="pct-span" data-tenYrProb="${finalPct}"> ~${finalPct}% </span> chance of payout`);

  if(finalPct <= 30 || finalPct >= 70){
    if(finalPct <= 30) $('#pct-span').addClass('low-text');
    if(finalPct >= 70) $('#pct-span').addClass('high-text');
  }else{
    $('#pct-span').removeClass('low-text');
    $('#pct-span').removeClass('high-text');
  }
}

clearChart = function (n){
  svg = d3.select("svg#chart");
  margin = {top: 20, right: 50, bottom: 45, left: 50};
  width = +svg.attr("width") - margin.left - margin.right;

  let data = [];
  for(let i = 0; i < n; i++){
    data.push(0);
  }
  let o = {start:2008,data:data,avg:0};
  dataExtents = d3.extent(o.data, function(d){return d;});
  multiYrAvg = o.avg;
  let y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);
  let ymm = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]*25.4]);

  //yaxis
  d3.selectAll("g.yaxis")
    .transition().duration(1000)
    .call(d3.axisLeft(y).ticks(4));

  d3.selectAll("g.yaxis-mm")
    .transition().duration(1000)
    .call(d3.axisRight(ymm).ticks(4));

  //draw bars
  let barWidth = width*0.5/10;
  d3.selectAll("g.bars")
    .selectAll("rect")
    .data(o.data)
    .transition().duration(1000)
    .attr("y",d => y(d))
    .attr("height",d => height - y(d) + 1)
    .attr("stroke-dasharray", d => `${barWidth},${barWidth}`)
    .attr("opacity",1e-6);
  //d3.selectAll("line.multiYrAvg")
  //  .transition().duration(1000)
  //  .attr("y1",function(d){return y(o.avg);})
  //  .attr("y2",function(d){return y(o.avg);})
  //  .attr("opacity",1e-6);
}