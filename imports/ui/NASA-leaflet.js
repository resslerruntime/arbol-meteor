import * as L from "leaflet";
import * as d3 from "d3";
import * as Qs from "qs";
import * as axios from "axios";
import './body.js';

////////////////////////////////////////////
// NASA API CALL
////////////////////////////////////////////

//TODO this should only call if datepicker isn't default values
prepareNasaCall = function (){
  let smv = $('#date-start').datepicker('getDate').getMonth() + 1
    ,sm = `${smv}`     // start month
    ,syv = $('#date-start').datepicker('getDate').getFullYear() - 30
    ,sy = `${syv}`; // start year
  let emv = $('#date-end').datepicker('getDate').getMonth() + 1
    ,em = `${emv}` // end month, +2 to account for the entire month by putting the end date as the 1st of the next month
    ,eyv = $('#date-end').datepicker('getDate').getFullYear() - 1
    ,ey = `${eyv}`; // end year
  while(sm.length < 2) sm = "0" + sm;
  while(em.length < 2) em = "0" + em;

  //call NASA 
  let startDate = {
    month: smv
    ,year: syv
    ,mmddyyyy:`${sm}/01/${sy}`
  };
  let endDate = {
    month: emv
    ,year: eyv
    ,mmddyyyy:`${em}/01/${ey}`
  }; 

  //   //call NASA 
  // let startDate = {
  //   month: "6"
  //   ,year: "2007"
  //   ,mmddyyyy:`02/01/2005`
  // };
  // let endDate = {
  //   month: "7"
  //   ,year: "2007"
  //   ,mmddyyyy:`06/01/2008`
  // };

  //get area that was selected
  // let coords = [[40.55,-83.1],[40.8,-83.1],[40.8,-82.85],[40.55,-82.85]];
  // let coords = [[40.55,-83.1],[45,-83.1],[45,-80],[40.55,-80]];
  let coords = [[2.65,32.1],[2.9,32.1],[2.9,32.35],[2.65,32.35]];
  if(selectedBounds) coords = leafletToNasaCoords(selectedBounds);
  console.log("stringify",coords,stringifyCoords(coords));

  // callTestDay(startDate,endDate,"[[2.6,32.75],[2.85,32.75],[2.85,33],[2.6,33]]");
  // callTestMonth(startDate,endDate,"[[2.6,32.75],[2.85,32.75],[2.85,33],[2.6,33]]");
  callNASA(startDate,endDate,stringifyCoords(coords));
}

let latestId = "";
let checkStatus;

//Follow reasonable convention and take location with (lat, lon) ordering.
callNASA = function (startDate,endDate,location){
  $("#error-msg").fadeOut(500);
  $("#error-msg2").fadeOut(500);
  $("#chart-loader").fadeIn(1000);
  console.log("nasa:",startDate.mmddyyyy,endDate.mmddyyyy,location)
  //reset call parameters
  window.clearInterval(checkStatus);

  //submit initial data request
  Meteor.call("submitDataRequestNASA",startDate.mmddyyyy,endDate.mmddyyyy,location,function(error, results) {
    if(typeof results != 'undefined'){
      console.log("data request NASA",results,results.content)
      let id = eval(results.content)[0];
      latestId = id;
      checkStatus = setInterval(function(){
        console.log("getDataRequestProgressNASA",id)
        //check status of data request
        Meteor.call("getDataRequestProgressNASA",id,function(error, results) {
          console.log("progress NASA",id,results)
          let status = parseFloat(eval(results.content)[0]);
          if(status === 100){
            window.clearInterval(checkStatus);
            if(id === latestId){
              console.log("nasa latest id", latestId)
              console.log("getDataFromRequestNASA",id)
              //when data is ready get data
              Meteor.call("getDataFromRequestNASA",id,function(error, results) {
                submittedDataRequest = false;
                let d = JSON.parse(results.content)
                if(d.data.length !== 0){
                  
                  let obj = yearlyNASAVals(d.data,startDate,endDate);
                  updateMonths(obj);
                  calcPct(obj);
                  $(".chart-loader-div").removeClass("chart-loader");
                  $("#chart-loader").fadeOut(500);  
                }else{
                  console.log("No data returned")
                  $("#chart-loader").fadeOut(500);
                  $("#error-msg2").fadeIn(1000);
                }            
              });
            }
          }
        });
      }, 5000);
    }else{
      console.log("NASA server not responding: ",error.message)
      $("#chart-loader").fadeOut(500);
      $("#error-msg").fadeIn(1000);
    }
  });
}


let checkStatus2;
callTestMonth = function (startDate,endDate,location){
  //submit initial data request
  Meteor.call("testMonth",startDate.mmddyyyy,endDate.mmddyyyy,location,function(error, results) {
    if(typeof results != 'undefined'){
      let id = eval(results.content)[0];
      checkStatus2 = setInterval(function(){
        //check status of data request
        Meteor.call("getDataRequestProgressNASA",id,function(error, results) {
          let status = parseFloat(eval(results.content)[0]);
          if(status === 100){
            window.clearInterval(checkStatus2);
            //when data is ready get data
            Meteor.call("getDataFromRequestNASA",id,function(error, results) {
              let d = JSON.parse(results.content);
              if(d.data.length !== 0){
                console.log("testMonth",d.data) 
              }else{
                console.log("No data returned")
              }            
            });
          }
        });
      }, 2000);
    }else{
      console.log("NASA server not responding: ",error.message);
    }
  });
}

let checkStatus3;
callTestDay = function (startDate,endDate,location){
  //submit initial data request
  Meteor.call("testDay",startDate.mmddyyyy,endDate.mmddyyyy,location,function(error, results) {
    if(typeof results != 'undefined'){
      let id = eval(results.content)[0];
      checkStatus3 = setInterval(function(){
        //check status of data request
        Meteor.call("getDataRequestProgressNASA",id,function(error, results) {
          let status = parseFloat(eval(results.content)[0]);
          if(status === 100){
            window.clearInterval(checkStatus3);
            //when data is ready get data
            Meteor.call("getDataFromRequestNASA",id,function(error, results) {
              let d = JSON.parse(results.content);
              if(d.data.length !== 0){
                console.log("testDay",d.data) 
              }else{
                console.log("No data returned")
              }            
            });
          }
        });
      }, 2000);
    }else{
      console.log("NASA server not responding: ",error.message);
    }
  });
}

function makeContainer(startDate,endDate){
  var years = [];
  let sdm = parseInt(startDate.month), edm = parseInt(endDate.month);
  let sy = parseInt(startDate.year), ey = sy;
  for(var i = 0; i < 30; i++){
  // while(ey <= parseInt(endDate.year)){
    let ey = sdm <= edm ? sy : sy+1;
    // let st = new Date(sy, sdm-1, 1);
    // let et = new Date(ey, edm-1, 1);

    years.push({
      startYear: sy
      ,startMonth: sdm
      // ,startDate: st
      // ,startTimestamp: Math.floor(st.getTime()/1000)
      ,endYear: ey
      ,endMonth: edm
      // ,endDate: et
      // ,endTimestamp: Math.floor(et.getTime()/1000)
      ,objs: []
      ,val: 0
    });
    //increment start year
    sy += 1;
  // }
  }
  return years;
}

function parseData(data){
  let a = [];
  let l = data.length;
  for(var i = 0; i < l; i++){
    let d = data[i].date.split("/");
    a.push({month:parseInt(d[0]),year:parseInt(d[1]),val:data[i].value.sum})
  }
  return a;
}

function checkRange(a,c){
  let b = false;
  if(a.year >= c.startYear && a.year <= c.endYear){
    if(c.startMonth < c.endMonth){
      if(a.month >= c.startMonth && a.month <= c.endMonth) b = true;
    } else if(c.endMonth < c.startMonth){
      if(a.month >= c.startMonth && a.year === c.startYear) b = true;
      if(a.month <= c.endMonth && a.year === c.endYear) b = true;
    } else if(c.startMonth === c.endMonth){
      if(a.month === c.startMonth) b = true; 
    }
  }else{
    b = false;
  }
  return b;
}

var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan"];
function yearlyNASAVals (a,startDate,endDate){
  console.log("yearly NASA",a,startDate,endDate)
  let con = makeContainer(startDate,endDate);
  let arr = parseData(a);
  let al = arr.length, cl = con.length;
  for(let i = 0; i < al; i++){
    for(let j = 0; j < cl; j++){
      if(checkRange(arr[i],con[j])){
        con[j].objs.push(arr[i])
      }
    }
  } 

  let data = [], sumAll = 0;
  for(let k = 0; k < cl; k++){
    let cll = con[k].objs.length;
    let sum = 0;
    for(let n = 0; n < cll; n++){
      sum += con[k].objs[n].val;
    }
    data.push(sum);
    con[k].val = sum;
    sumAll += sum;
  }

  console.log("nasa data",con,data)
  return {years:30,start:startDate.year,data:data,avg:sumAll/data.length,title:`Total Precipitation: ${months[parseInt(startDate.month)-1]} to ${months[parseInt(endDate.month)-1]}`};
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
var waitForLeaflet = setInterval(function(){
  let leafletDiv = document.getElementById("mapdiv");
  if(leafletDiv){
    window.clearInterval(waitForLeaflet);
    regionmap = L.map('mapdiv').setView([2.65,32.1], 5);
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
      let step = 0.05;
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
      prepareNasaCall();
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










