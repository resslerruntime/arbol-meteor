import * as w3 from "web3";

//used for asynchronous web3 calls
promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
        })
    );

//check if browser is google Chrome
isChrome = function (){
  //https://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome/13348618#13348618
  // please note,
  // that IE11 now returns undefined again for window.chrome
  // and new Opera 30 outputs true for window.chrome
  // but needs to check if window.opr is not undefined
  // and new IE Edge outputs to true now for window.chrome
  // and if not iOS Chrome check
  // so use the below updated condition
  var isChromium = window.chrome;
  var winNav = window.navigator;
  var vendorName = winNav.vendor;
  var isOpera = typeof window.opr !== "undefined";
  var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
  var isIOSChrome = winNav.userAgent.match("CriOS");

  if (isIOSChrome) {
     // is Google Chrome on IOS
     return true;
  } else if(isChromium !== null && typeof isChromium !== "undefined" && vendorName === "Google Inc." && isOpera === false && isIEedge === false) {
     // is Google Chrome
     return true;
  } else {
     // not Google Chrome
     return false;
  }
}

//conversion
toEth = function (n){
  let ns = `${n}`;
  let i = ns.indexOf("e+");
  console.log("toEth",n,ns.indexOf("e+"))

  if(i === -1) return w3.utils.fromWei(`${n}`);
  else return n/1e18;
}

toWei = n => w3.utils.toWei(`${n}`);

// give number three decimals
clipNum = function (n){
  n = Math.round(n*1000)/1000;
  if(n < 0.001){
    return "<0.001";
  }else{
    //find out how many digits before zero and how many after
    let s = `${n}`, a = s.split(".");
    if(a.length === 1){
      return s += ".000";
    }else{
      while(a[1].length < 3) a[1] += "0";
      return a[0] + "." + a[1];
    }
  }
}