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
    ,glanceNASA: function(){
      let url = `https://climateserv.servirglobal.net/chirps/getParameterTypes/`;
      this.unblock();
      return HTTP.call("GET",url);
    }
  });
});
