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

//conversion
toEth = function (n){
  return n/Math.pow(10,18);
}

toWei = function (n){
  return n*Math.pow(10,18);
}

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