import './body.js';

////////////////////////////////////////////
// NASA API CALL
////////////////////////////////////////////

callNASA = function (startDate,endDate,location){
  $("#error-msg").fadeOut(500);
  $("#chart-loader").fadeIn(1000);
  console.log("nasa:",startDate.mmddyyyy,endDate.mmddyyyy)
  // Meteor.call("submitDataRequestNASA","04/01/2008","06/30/2018",stringifyCoords([]),function(error, results) {
  Meteor.call("submitDataRequestNASA",startDate.mmddyyyy,endDate.mmddyyyy,stringifyCoords([]),function(error, results) {
    if(typeof results != 'undefined'){
      console.log("data request NASA",results,results.content)
      let id = eval(results.content)[0];
      let checkStatus = setInterval(function(){
        console.log("getDataRequestProgressNASA",id)
        Meteor.call("getDataRequestProgressNASA",id,function(error, results) {
          console.log("progress NASA",results)
          let status = parseFloat(eval(results.content)[0]);
          if(status === 100){
            window.clearInterval(checkStatus);
            console.log("getDataFromRequestNASA",id)
            Meteor.call("getDataFromRequestNASA",id,function(error, results) {
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
      }, 5000);
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

