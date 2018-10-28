import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';


Meteor.startup(() => {
  // code to run on server at startup
  Meteor.methods({
    glanceNOAA: function (regionCode,month,duration) {
      let url = `https://www.ncdc.noaa.gov/cag/regional/time-series/mugl.xml?parameter=pcp&timescale=${duration}&region=${parseInt(regionCode)}&month=${month}&begyear=2007&endyear=2017&base_prd=true&firstbaseyear=1901&lastbaseyear=2000`;
      console.log("month:",month,"duration:",duration,"region code:",regionCode,"url",url)
      this.unblock();
      return HTTP.call("GET",url);
    }
    // NASA api documentation: https://climateserv.readthedocs.io/en/latest/api.html
    ,getParameterTypesNASA: function(){
      //"[[0, "max", "Max"], [1, "min", "Min"], [2, "median", "Median"], [3, "range", "Range"], [4, "sum", "Sum"], [5, "avg", "Average"], [6, "download", "Download"]]"
      let url = `https://climateserv.servirglobal.net/chirps/getParameterTypes/`;
      this.unblock();
      return HTTP.call("GET",url);
    }
    ,submitDataRequestNASA: function(begintime,endtime,coords){
      // 'datatype'      // (int), the unique datatype number for the dataset which this request operates on
      // 'begintime'     // (string), startDate for processing interval, format ("MM/DD/YYYY")
      // 'endtime'       // (string), endDate for processing interval, format ("MM/DD/YYYY")
      // 'intervaltype'  // (int), enumerated value that represents which type of time interval to process (daily, monthly, etc) (This enumeration is currently hardcoded in the mark up language of the current client).
      // 'operationtype' // (int), enumerated value that represents which type of statistical operation to perform on the dataset, see api call 'getParameterTypes/' for the list of currently available types.
      // // Either 'geometry' by itself or these other two params together, 'layerid' and 'featureids' are required
      // 'geometry'(optional)// (object), the geometry that is defined by the user on the current client
      // 'layerid'(optional) // the layerid that is selected by the by the user on the current client
      // 'featureids'(optional)  // the featureids as selected by the user on the current client
      // 'isZip_CurrentDataType'(optional) // (string), Leaving this blank converts to 'False' on the server.  Sending anything through equates to a 'True' value on the server.  This lets the server know that this is a job to zip up and return a full dataset.

      let url = `https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=${begintime}&endtime=${endtime}&intervaltype=1&operationtype=4&isZip_CurrentDataType=false&geometry={"type":"Polygon","coordinates":[${coords}]}`;
      this.unblock();
      return HTTP.call("GET",url);
    }
    ,getDataRequestProgressNASA: function(id){
      let url = `https://climateserv.servirglobal.net/chirps/getDataRequestProgress/?id=${id}`;
      this.unblock();
      return HTTP.call("GET",url);
    }
    ,getDataFromRequestNASA: function(id){
      let url = `https://climateserv.servirglobal.net/chirps/getDataFromRequest/?id=${id}`;
      this.unblock();
      return HTTP.call("GET",url);
    }
  });
});
