import * as L from "leaflet";
import * as d3 from "d3";
import './body.js';


////////////////////////////////////////////
// NASA API CALL
////////////////////////////////////////////

prepareIpfsCall = function(){

  // let smv = $('#date-start').datepicker('getDate').getMonth() + 1
  //   ,sm = `${smv}`     // start month
  //   ,syv = $('#date-start').datepicker('getDate').getFullYear() - 30
  //   ,sy = `${syv}`; // start year
  // let emv = $('#date-end').datepicker('getDate').getMonth() + 1
  //   ,em = `${emv}` // end month, +2 to account for the entire month by putting the end date as the 1st of the next month
  //   ,eyv = $('#date-end').datepicker('getDate').getFullYear() - 1
  //   ,ey = `${eyv}`; // end year

  // //call Ipfs
  // let startDate = {
  //   month: smv
  //   ,year: syv
  //   ,mmddyyyy:`${sm}/01/${sy}`
  // };
  // let endDate = {
  //   month: emv
  //   ,year: eyv
  //   ,mmddyyyy:`${em}/01/${ey}`
  // }; 

  let startDate = $('#date-start').datepicker('getDate');
  let endDate = $('#date-end').datepicker('getDate');

  callIpfs(startDate,endDate,selectedBounds[0],-1);
}

callIpfs = function(startDate,endDate,coord,obj){
    //test IPFS, requires in lat / lon order
    let month = `${startDate.getMonth() + 1}`;
    if(month.length === 1) month = "0" + month;

    //let url = `https://ipfs.io/ipfs/QmXhEGQvQE2DoLvu7mk9MYM771axyKsyzscU8ZL5Ef8a2m/-49.625/-70.125/01`;
    let url = `https://ipfs.io/ipfs/QmS19QiikqtytMsRew1mpuhrJDBW1xzo4fhsBVVvnHezMt/${coord[0] + 0.125}/${coord[1] + 0.125}/${month}`;

    $.ajax({
      type: 'GET',
      crossDomain: true,
      url: url
    }).done(function(data) {
      let d = data.split(" ");
      if(d.length === 0){
        errorizeGraph("IPFS: No data was returned.")
      }
      let newObj = yearlyIpfsVals(d,startDate,endDate);

      if(obj !== -1){
        obj = combineObj(obj,newObj);
      }else{
        obj = newObj;
      }
      console.log("new obj",obj)
      //increment date
      let currentDate = incrementDate(startDate); 
      console.log("start",startDate);
      console.log("current",currentDate);
      console.log("current",endDate);
      console.log(dateIsBefore(currentDate,endDate));
      if(dateIsBefore(currentDate,endDate)){
        callIpfs(currentDate,endDate,coord,obj);
      }else{
        console.log("IPFS OBJ",obj)
        console.log("=============")
        updateMonths(obj);
        calcPct(obj);
        $(".chart-loader-div").removeClass("chart-loader");
        $("#chart-loader").fadeOut(500);      
      }
    }).fail(function(){
      errorizeGraph("IPFS: Call failed.")
    });
}

var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan"];
function yearlyIpfsVals (a,startDate,endDate){

  let data = [], l = a.length;
  for(let i = 0; i < l; i++){
    let v = parseFloat(a[i]);
    if(!isNaN(v)) data.push(v);
  }
  let short = data.slice(data.length-30);
  let sumAll = 0;
  short.map(e => sumAll += e);

  return {years:30,start:startDate.getFullYear() - 30,data:short,avg:sumAll/short.length,title:`Total Precipitation: ${months[startDate.getMonth()]} to ${months[endDate.getMonth()]}`};
}

function combineObj (o,p){
  let l = o.data.length;
  for(var i = 0; i < l; i++){
    o.data[i] = o.data[i] + p.data[i];
  }
  o.avg += p.avg;
  return o;
}

function incrementDate(date){
  var d = new Date(date);
  return new Date(d.setMonth(d.getMonth()+1));
}

function dateIsBefore(d,e){
  return new Date(d) < new Date(e); 
}

function errorizeGraph (consoleMessage){
  console.log(consoleMessage);
  $("#chart-loader").fadeOut(500);
  $("#error-msg").fadeIn(1000);
}

////////////////////////////////////////////
// leaflet map
////////////////////////////////////////////

regionmap = false;

// variables
currentBounds = false;
selectedBounds = false;
presentSelection = false;

//find the proper way to make sure that the HTML is fully loaded before leaflet tries to attach the map
console.log("mapDiv",document.getElementById("mapdiv"))
var waitForLeaflet = setInterval(function(){
  console.log("mapDiv",document.getElementById("mapdiv"));
  let leafletDiv = document.getElementById("mapdiv");
  if(leafletDiv){
    window.clearInterval(waitForLeaflet);
    regionmap = L.map('mapdiv').setView([2.65,15], 2);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 15,
      minZoom: 1,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(regionmap);

    // console.log('regionmap is now ' + typeof regionmap);

    //outof bounds
    let northPole = L.rectangle([[50, -360], [90, 360]], {color:"white",opacity:0.5}).addTo(regionmap);
    let southPole = L.rectangle([[-50, -360], [-90, 360]], {color:"white",opacity:0.5}).addTo(regionmap);

    // //define shape to be displayed with d3
    let rect = L.rectangle([[0, 0], [0.25, 0.25]], {color:"blue", className: "mouse"}).addTo(regionmap);
    let viewSVG = d3.selectAll("#mapdiv")
      .selectAll("svg")
      .append("path")
      .attr("d", "M333 317L333 309L339 309L339 317z")
      .attr("fill", "none")
      .attr("fill-opacity",0.1)
      .attr("stroke", "none")
      .attr("stroke-weight",2);

    function mouseMove(e) {
      // console.log("mouseMove")
      let step = 0.25;
      if(rect) regionmap.removeLayer(rect);
      let f = Math.floor(e.latlng.lat/step), g = Math.floor(e.latlng.lng/step);
      let lat = f*step, lng = g*step;
      currentBounds = [[lat, lng], [lat+0.25, lng+0.25]];
      //draw dummy rectangle for new location
      rect = L.rectangle(currentBounds, {className: "mouse"}).addTo(regionmap);
    }

    function mouseClick(e){
      let d = getPath("mouse");
      if(presentSelection){
        // console.log("already selected")
        viewSVG.transition()
          .attr("d",d)
          .attr("fill","green")
          .attr("stroke","green");
      }else{
        // console.log("no selection")
        viewSVG.attr("d",d)
          .transition()
          .attr("fill","green")
          .attr("stroke","green");
      }
      selectedBounds = currentBounds;
      presentSelection = true;

      //call NASA
      prepareIpfsCall();
    }

    function mouseZoom(e){
      //redraw objects so that they are the right size once zoomed
      if(selectedBounds){
        let dummy = L.rectangle(selectedBounds, {fill: "none", stroke:"none", className: "dummy"}).addTo(regionmap);
        let d = getPath("dummy");
        if(d === "M0 0"){
          presentSelection = false;
          //object has been automatically removed
          viewSVG.attr("fill","none")
            .attr("stroke","none");
          regionmap.removeLayer(dummy);
        }else{
          presentSelection = true;
          //redraw selected object to new size
          viewSVG.attr("d",d)
          .attr("fill","green")
          .attr("stroke","green");
          regionmap.removeLayer(dummy);
        }
        // console.log(presentSelection)
      }
    }

    function getPath (className){
      var path = document.getElementsByClassName(className);
      // console.log(className,path,path[0].getAttribute("d"))
      return path[0].getAttribute("d");
    }

    regionmap.on('zoom', mouseZoom)
    regionmap.on('mousemove', mouseMove);
    regionmap.on('click', mouseClick);
  }
},1000);

function stringifyCoords (a){
  let s = "[";
  a.map(d => s += `[${d[0]},${d[1]}],`);
  s = s.substring(0, s.length - 1);
  s += "]";
  return s;
}

//all four corners of square
function leafletToNasaCoords(a){
  return [
    [a[0][0],a[0][1]]
    ,[a[0][0]+0.25,a[0][1]]
    ,[a[0][0]+0.25,a[0][1]+0.25]
    ,[a[0][0],a[0][1]+0.25]
  ];
}

//top left hand corner of lat lon square
//selectedBound is bottom left hand corner
leafletToWitCoords = function (){
  let a = selectedBounds;
  return `${a[0][0]},${a[0][1]}&0.25`;
}

leafletToDisplayCoords = function (){
  let a = selectedBounds;
  return `lat: ${a[0][0]} lon: ${a[0][1]}`
}

//reset leaflet
resetLeaflet = function () {
  regionmap.setZoom(2);
}










