import './body.js';
import * as d3 from "d3";
import topojson from "topojson";

////////////////////////////////////////////
// NOAA API CALL
////////////////////////////////////////////

let currentHTTP = 0;

callNOAA = function (){
  $("#NOAA-msg").fadeOut(500);
  $("#chart-loader").fadeIn(1000);
  currentHTTP += 1;
  let check = currentHTTP;
  if(NOAACODE !== -1 && MONTHCODE !== -1 && DURATIONCODE !== -1){
    console.log("fn: callNOAA",NOAACODE,MONTHCODE,DURATIONCODE)
    Meteor.call("glanceNOAA",NOAACODE,MONTHCODE,DURATIONCODE,function(error, results) {
      console.log(results)
      if(results === undefined){
        console.log("NOAA call failed, try again, returned undefined")
        $("#chart-loader").fadeOut(500);
        $("#NOAA-msg").fadeIn(1000);
      }else{
        let obj = parseData(results);
        console.log("NOAA results",results,obj)
        if(false){
          //TODO if obj returned = -99 then show error
          console.log("NOAA call failed, try again, returned data = -99")
          $("#chart-loader").fadeOut(500);
          $("#NOAA-msg").fadeIn(1000);
        }else{
          //if a new NOAA call is made before previous one has returned, block the returned info from updating the chart
          if(check === currentHTTP){
            upDateMonths(obj);
            calcTenYrP(obj);
            $(".chart-loader-div").removeClass("chart-loader");
            $("#chart-loader").fadeOut(500);
          }
        }
      }
    });
  }
}

function parseData (results){
  let string = results.content;
  let title = string.split("title")[1].split(">")[1].split("<")[0];
  title = shortenTitle(title);
  let values = string.split("values");
  let array = values[1].split(/\n/g);
  let la = array.length;
  let a2 = [];
  while(la--){
    let n = array[la].split(",");
    if(n.length === 3 && a2.length < 10) a2.push(n);
  }
  let a3 = a2.map(d => parseFloat(d[1]));
  let sum = a3.reduce((a,c) => a + c);
  return {start:parseInt(a2[a2.length-1][0]),data:a3,avg:sum/10,title:title};
}

function shortenTitle (t){
  t = t.replace('Area-Wtd ','')
    .replace('Primary ','');
  t = t.replace('January','Jan')
    .replace('February','Feb')
    .replace('March','Mar')
    .replace('April','Apr')
    .replace('May','May')
    .replace('June','Jun')
    .replace('July','Jul')
    .replace('August','Aug')
    .replace('September','Sep')
    .replace('October','Oct')
    .replace('November','Nov')
    .replace('December','Dec');
  return t;
}

////////////////////////////////////////////
// D3 MAP
////////////////////////////////////////////

let selectedRegion = "none";

drawUSA = async function (){
  let svg = d3.select("#map");
  let width = +svg.attr("width");
  let height = +svg.attr("height");
  let path = d3.geoPath();
  console.log("svg",svg)

  try{
    let us = await d3.json("USA.json");

    let g = svg.selectAll("g#outline")
      .attr("transform", "scale(" + width/1000 + ")");

    g.append("path")
      .attr("fill", "#efefef")
      .attr("stroke", "black")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width",2)
      .attr("d", path(topojson.feature(us, us.objects.nation)));

    g.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

    let ra = ["us-corn-belt","us-soy-belt","us-redwinter-belt"]
      ,ral = ra.length;
    while(ral--){
      var reg = ra[ral];
      d3.selectAll(`path.${reg}`)
        .attr("stroke-width",5)
        .attr("stroke-miterlimit","1")
        .attr("stroke",locationObj[reg].col)
        .attr("fill",locationObj[reg].col)
        .attr("fill-opacity",1e-6);
        // .attr("stroke-dasharray", "20,5");
    }

    svg.selectAll("g#areas")
      .selectAll("path.ag-areas")
      .on("mouseover",handleMOver)
      .on("mouseout",handleMOut)
      .on("click", handleClick);

      changeRegion("us-corn-belt");
      $('#location').trigger('input');

    function handleMOver(){
      let v = +d3.select(this).attr("value");
      let region = d3.select(this).attr("class").split(" ")[1];
      if(region !== selectedRegion){
        d3.selectAll(`path.${region}`)
          .attr("fill",locationObj[region].col)
          .attr("fill-opacity",1);
      }
    }

    function handleMOut(){
      let v = +d3.select(this).attr("value");
      let region = d3.select(this).attr("class").split(" ")[1];
      if(region !== selectedRegion){
        d3.selectAll(`path.${region}`)
          // .attr("fill","none")
          .attr("fill-opacity",1e-6);
      }
    }

    function handleClick() {
      let v = +d3.select(this).attr("value");
      let region = d3.select(this).attr("class").split(" ")[1];
      //manage the coloration change
      if(region !== selectedRegion){
        // update the form
        $('#location').val(region);
        //make previous region go blank
        d3.selectAll(`path.${selectedRegion}`)
          // .attr("fill","none")
          .attr("fill-opacity",1e-6);

        selectedRegion = region;
        NOAACODE = locationObj[selectedRegion].noaaCode;
        // callNOAA();
        d3.selectAll(`path.${selectedRegion}`)
          .attr("fill","yellow")
          .attr("fill-opacity",1);
      }else{
        //update the form
        $('#location').val("none");
        //update map
        d3.selectAll(`path.${selectedRegion}`)
          .attr("fill",locationObj[selectedRegion].col)
          .attr("fill-opacity",1);

        currentHTTP += 1;
        clearChart();
        $("#ten-yr-prob").html("");
        selectedRegion = "none";
        NOAACODE = -1;
        if(NOAACODE !== -1 && MONTHCODE !== -1 && DURATIONCODE !== -1) $("#chart-loader").fadeOut(1000);
      }
    }

  }catch(error){
    console.log("Error retrieving USA topoJSON data: ",error);
  }
}

changeRegion = function (region){
  if(region !== selectedRegion){
    // update the form
    $('#location').val(region);

    //make previous region go blank
    d3.selectAll(`path.${selectedRegion}`)
      .attr("fill","none");

    selectedRegion = region;
    NOAACODE = locationObj[selectedRegion].noaaCode;
    // callNOAA();
    d3.selectAll(`path.${selectedRegion}`)
      .attr("fill","yellow")
      .attr("fill-opacity",1);
  }
}