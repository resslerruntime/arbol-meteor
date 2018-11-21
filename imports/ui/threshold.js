//data objects for display
const threshRelationObj = {
  "less":{text:"< ",val:false,caStroke:"red",caFill:"#fcc8b0",cbStroke:"green",cbFill:"#b5ffc0"}
  ,"greater":{text:"> ",val:true,caStroke:"green",caFill:"#b5ffc0",cbStroke:"red",cbFill:"#fcc8b0"}
};
const threshPercentObj = {
  "zero":{text:"",val:0}
  ,"ten":{text:"10% ",val:0.1}
  ,"twenty-five":{text:"25% ",val:0.25}
};
const threshAverageObj = {
  "average":{text: "Average",val:0}
  ,"below-average":{text: "Below Avg",val:-1}
  ,"above-average":{text: "Above Avg",val:1}
};

threshVal = function (rel){
  return threshRelationObj[rel].val;
}

threshObj = function (rel){
  return threshRelationObj[rel];
}

threshText = function (rel,pct,avg){
  return threshRelationObj[rel].text + threshPercentObj[pct].text + threshAverageObj[avg].text;
}

threshValPPTH = function (pct,avg){
  return 10000 + threshPercentObj[pct].val * threshAverageObj[avg].val * 10000;
}

threshValFraction = function (pct,avg){
  return 1 + threshPercentObj[pct].val*threshAverageObj[avg].val;
}

threshValsToText = function (above,num){
  let a = "< ";
  if(above) a = "> ";
  let b = "0% ";
  if(num === 9000 || num === 11000) b = "10% ";
  if(num === 7500 || num === 12500) b = "25% ";
  let c = "Below Avg";
  if(num > 10000) c = "Above Avg";
  if(num === 10000){
    b = "";
    c = "Average";
  }
  return a + b + c;
}