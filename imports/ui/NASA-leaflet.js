import * as L from "leaflet";
import './body.js';

////////////////////////////////////////////
// NASA API CALL
////////////////////////////////////////////

let submittedDataRequest = false;
let checkStatus;

callNASA = function (startDate,endDate,location){
  $("#error-msg").fadeOut(500);
  $("#chart-loader").fadeIn(1000);
  console.log("nasa:",startDate.mmddyyyy,endDate.mmddyyyy)
  //reset call parameters
  submittedDataRequest = false;
  window.clearInterval(checkStatus);

  //submit initial data request
  // Meteor.call("submitDataRequestNASA","04/01/2008","06/30/2018",stringifyCoords([]),function(error, results) {
  Meteor.call("submitDataRequestNASA",startDate.mmddyyyy,endDate.mmddyyyy,stringifyCoords([]),function(error, results) {
    if(typeof results != 'undefined'){
      console.log("data request NASA",results,results.content)
      let id = eval(results.content)[0];
      checkStatus = setInterval(function(){
        console.log("getDataRequestProgressNASA",id)
        //check status of data request
        Meteor.call("getDataRequestProgressNASA",id,function(error, results) {
          console.log("progress NASA",results)
          let status = parseFloat(eval(results.content)[0]);
          if(status === 100 && !submittedDataRequest){
            submittedDataRequest = true;
            window.clearInterval(checkStatus);
            console.log("getDataFromRequestNASA",id)
            //when data is ready get data
            Meteor.call("getDataFromRequestNASA",id,function(error, results) {
              submittedDataRequest = false;
              let d = JSON.parse(results.content)
              console.log("data NASA",d)
              let obj = yearlyNASAVals(d.data,startDate,endDate);
              updateMonths(obj);
              calcTenYrP(obj);
              $(".chart-loader-div").removeClass("chart-loader");
              $("#chart-loader").fadeOut(500);              
            });
          }
        });
      }, 2000);
    }else{
      console.log("NASA server not responding: ",error.message)
      $("#chart-loader").fadeOut(500);
      $("#error-msg").fadeIn(1000);
    }
  });
}

function stringifyCoords (aa){
  let a = [[21.5,-3.1],[21.5,-6.4],[26.2,-5.4],[26.1,-2.6]];
  let s = "[";
  a.map(d => s += `[${d[0]},${d[1]}],`);
  s = s.substring(0, s.length - 1);
  s += "]";
  return s;
}

var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan"];
function yearlyNASAVals (a,startDate,endDate){
  console.log("yearly NASA",startDate,endDate)
  //we get all monthly values for the entire period of duration
  //we only want a single yearly value for duration
  let data = [], sum = 0, sumAll = 0, inRange = false;
  let al = a.length;
  for(let i = 0; i < al; i++){
    let date = a[i].date.split("/");
    //check if current date is between range
    if(parseInt(startDate.month) === parseInt(date[0])){
      inRange = true;
    } 
    if(inRange){
      sum += a[i].value.sum;
      sumAll += a[i].value.sum;
    } 
    if(parseInt(endDate.month) === parseInt(date[0])){
      data.push(sum);
      sum = 0;
      inRange = false;
    }
  } 
  console.log("nasa data",data)
  return {start:startDate.year,data:data,avg:sumAll/data.length,title:`Total Precipitation: ${months[parseInt(startDate.month)-1]} to ${months[parseInt(endDate.month)-1]}`};
}

////////////////////////////////////////////
// leaflet map
////////////////////////////////////////////

//find the proper way to make sure that the HTML is fully loaded before leaflet tries to attach the map
var waitForLeaflet = setInterval(function(){
  let leafletDiv = document.getElementById("leaflet-map");
  if(leafletDiv){
    window.clearInterval(waitForLeaflet);
    var mymap = L.map('leaflet-map').setView([40.712, -74.227], 5);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 15,
      minZoom: 1,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(mymap);
  }
},1000)


// var mymap = L.map('leaflet-map').setView([40.712, -74.227], 5);

// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
//   maxZoom: 15,
//   minZoom: 1,
//   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
//     '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//     'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//   id: 'mapbox.streets'
// }).addTo(mymap);

// //variables
// let currentBounds;
// let selectedBounds;
// let presentSelection = false;

// //outof bounds
// let northPole = L.rectangle([[50, -360], [90, 360]], {color:"white",opacity:0.5}).addTo(mymap);
// let southPole = L.rectangle([[-50, -360], [-90, 360]], {color:"white",opacity:0.5}).addTo(mymap);

// //define shape to be displayed with d3
// let rect = L.rectangle([[0, 0], [0.25, 0.25]], {color:"blue", className: "mouse"}).addTo(mymap);
// let viewSVG = d3.selectAll("svg").append("path")
//   .attr("class","view")
//   .attr("d", "M333 317L333 309L339 309L339 317z")
//   .attr("fill", "none")
//   .attr("fill-opacity",0.1)
//   .attr("stroke", "none")
//   .attr("stroke-weight",2);

// function mouseMove(e) {
//   console.log("mouseMove")
//   let step = 0.05;
//   if(rect) mymap.removeLayer(rect);
//   let f = Math.floor(e.latlng.lat/step), g = Math.floor(e.latlng.lng/step);
//   let lat = f*step, lng = g*step;
//   currentBounds = [[lat, lng], [lat+0.25, lng+0.25]];
//   //draw dummy rectangle for new location
//   rect = L.rectangle(currentBounds, {className: "mouse"}).addTo(mymap);
// }

// function mouseClick(e){
//   let d = getPath("mouse");
//   if(presentSelection){
//     console.log("already selected")
//     viewSVG.transition()
//       .attr("d",d)
//       .attr("fill","green")
//       .attr("stroke","green");
//   }else{
//     console.log("no selection")
//     viewSVG.attr("d",d)
//       .transition()
//       .attr("fill","green")
//       .attr("stroke","green");
//   }
//   console.log(currentBounds)
//   selectedBounds = currentBounds;
//   presentSelection = true;
// }

// function mouseZoom(e){
//   //redraw objects so that they are the right size once zoomed
//   if(selectedBounds){
//     let dummy = L.rectangle(selectedBounds, {fill: "none", stroke:"none", className: "dummy"}).addTo(mymap);
//     let d = getPath("dummy");
//     if(d === "M0 0"){
//       presentSelection = false;
//       //object has been automatically removed
//       viewSVG.attr("fill","none")
//         .attr("stroke","none");
//       mymap.removeLayer(dummy);
//     }else{
//       presentSelection = true;
//       //redraw selected object to new size
//       viewSVG.attr("d",d)
//       .attr("fill","green")
//       .attr("stroke","green");
//       mymap.removeLayer(dummy);
//     }
//     console.log(presentSelection)
//   }
// }

// function getPath (className){
//   var path = document.getElementsByClassName(className);
//   console.log(className,path,path[0].getAttribute("d"))
//   return path[0].getAttribute("d");
// }

// mymap.on('zoom', mouseZoom)
// mymap.on('mousemove', mouseMove);
// mymap.on('click', mouseClick);

