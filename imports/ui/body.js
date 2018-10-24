import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import * as d3 from "d3";
import topojson from "topojson";
import BN from 'bn.js';
import './body.html';
import './createProtection.html';

Router.route('/tutorial');
Router.route('/', {
  template: 'main-page',
  onAfterAction:function(){
    console.log("router onAfterAction")
    let onHTML = setInterval(function(){
      console.log("check for loaded HTML")
      //check if html is loaded
      let el = $("#map");
      if(typeof el !== "undefined"){
        initMainPage();
        window.clearInterval(onHTML);
      }
    }, 100);
  }
});

////////////////////////////////////////////
// FUNCTIONS RELATED TO WEB3 PAGE STARTUP
////////////////////////////////////////////

//used for asynchronous web3 calls
const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );

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

function threshText(rel,pct,avg){
  return threshRelationObj[rel].text + threshPercentObj[pct].text + threshAverageObj[avg].text;
}

function threshValPPTH(pct,avg){
  return 10000 + threshPercentObj[pct].val * threshAverageObj[avg].val * 10000;
}

function threshValsToText(above,num){
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

const locationObj = {
      // NOAA codes:
      // Corn                   = 261
      // Cotton                 = 265
      // Hard Red Winter Wheat  = 255
      // Corn and Soybean       = 260
      // Soybean                = 262
      // Spring Wheat           = 250
      // Winter Wheat           = 256
      "us-corn-belt":{text:"US Corn Belt",noaaCode:"261",col:"#47B98E"}
      ,"us-soy-belt":{text:"US Soy Belt",noaaCode:"262",col:"#DBB2B2"}
      ,"us-redwinter-belt":{text:"US Red Winter Wheat Belt",noaaCode:"255",col:"#49F2A9"}
    };

function locationText(num){
  for (var prop in locationObj) {
    let el = locationObj[prop];
    if(num === el.noaaCode) return el.text;
  }
  return "?";
}

//table entry constructor open protections
//event ProposalOffered(uint indexed WITID, uint aboveID, uint belowID, uint indexed weiContributing,  uint indexed weiAsking, address evaluator, uint thresholdPPTTH, bytes32 location, uint start, uint end, bool makeStale);
function Entry(r,owner){
  let a = r.args;
  let location = locationText(bytes32ToNumString(a.location));
  let ask = a.weiAsking.toNumber();
  let propose = a.weiContributing.toNumber();
  let id = a.WITID.toNumber();

  //update for if the contract is for offered for sale or for funding
  let totalPayout = `${clipNum(toEth(propose) + toEth(ask))} Eth`;
  let b = `${toEth(ask)}`;
  let b1 = `<button type='button' class='action buyit tableBtn' value='${toEth(ask)},${a.WITID.toNumber()}'>Pay <span class="green-text">${clipNum(toEth(ask))} Eth</span> to accept</button>`;
  //if no user is logged in
  if(user[0] === -1){
    b1 = `<button type='button' class='tableBtn' value='${toEth(ask)},${a.WITID.toNumber()}'><span class="green-text">${clipNum(toEth(ask))} Eth</span></button>`;
  }
  //if the current use is the owner of the proposal don't give them the option to purchase the proposal
  if(owner === user[0]){
    b = "1e99";
    b1 = `<button type='button' class='tableBtn'>You are the owner of this proposal</button>`;
  }

  //get threshold text
  let above = a.WITID.toNumber() === a.belowID.toNumber();
  if(owner === user[0]) above = a.WITID.toNumber() !== a.belowID.toNumber();
  let thresh = threshValsToText(above,a.thresholdPPTTH.toNumber());

  //create the object
  this.id = id;
  this.type = "bodyRow";
  this.column = [
      {type:"text",key:location,name:location}
      ,{type:"text",key:thresh,name:thresh}
      ,{type:"text",key:"NOAA Rainfall",name:"NOAA Rainfall"}
      ,{type:"num",key:a.start.toNumber()*1000,name:dateText(a.start.toNumber()*1000)}
      ,{type:"num",key:a.end.toNumber()*1000,name:dateText(a.end.toNumber()*1000)}
      ,{type:"num",key:totalPayout,name:totalPayout}
      ,{type:"num",key:b,name:b1}
    ];
}

//table entry constructor my protections
//bool if you proposed the protection = true, if you accepted the protection = false
function MyEntry(r,a,id,bool){
  //is this entry an acceptance, an open proposal, or an accepted proposal
  let acceptance = r.args !== a;
  let acceptedProposal = false;
  if(!acceptance){
    if(acceptedList.indexOf(id) !== -1) acceptedProposal = true;
  }

  let ask = a.weiAsking.toNumber();
  let propose = a.weiContributing.toNumber();
  let location = locationText(bytes32ToNumString(a.location));

  //total payouts
  let totalPayout = `${clipNum(toEth(propose) + toEth(ask))} Eth`;

  //your contribution
  let v;
  if(acceptance) v = toEth(ask);
  else v = toEth(propose);
  let yourContr = `${clipNum(v)} Eth`;

  //status
  let now = new Date().getTime();
  let start = new Date(a.start.toNumber()*1000).getTime();
  let end = new Date(a.end.toNumber()*1000).getTime();
  let status = "";
  let b = "";
  let b1 = "";

  if(acceptance || acceptedProposal){
    //acceptances and accepted proposals
    if(now < start){
      status = "Partnered, waiting to start";
      b1 = "Waiting"; //`<button type='button' class='action cancelit tableBtn'> Cancel and redeem <span class="green-text">${yourContr}</span></button>`;
    }
    if(now >= start && now <= end){
      status = "In term";
      b = "Waiting";
      b1 = "Waiting";
    }
    if(now > end){
      status = "Waiting for evaluation";
      b = "Evaluate"
      b1 = `<button type='button' class='action evaluateit tableBtn' value=${id}> Evaluate and complete </button>`;
    }
  }else{
    //not accepted proposal
    if(now < start) status = "Waiting for partner";
    if(now >= start) status = "Stale";
    b = "";
    b1 = `<button type='button' class='action cancelit tableBtn'> Cancel and redeem <span class="green-text">${yourContr}</span></button>`;
  }

  //get threshold text
  let thresh;
  if(acceptance) thresh = threshValsToText(a.WITID.toNumber() === a.belowID.toNumber(),a.thresholdPPTTH.toNumber());
  else thresh = threshValsToText(a.WITID.toNumber() !== a.belowID.toNumber(),a.thresholdPPTTH.toNumber());

  //create the object
  this.id = r.args.WITID.toNumber();
  this.type = "bodyRow";
  //if you change the number or order of columns, you have to update the evaluation listener
  this.column = [
      {type:"text",key:location,name:location}
      ,{type:"text",key:thresh,name:thresh}
      ,{type:"text",key:"NOAA Rainfall",name:"NOAA Rainfall"}
      ,{type:"num",key:a.start.toNumber()*1000,name:dateText(a.start.toNumber()*1000)}
      ,{type:"num",key:a.end.toNumber()*1000,name:dateText(a.end.toNumber()*1000)}
      ,{type:"num",key:yourContr,name:yourContr}
      ,{type:"num",key:totalPayout,name:totalPayout}
      ,{type:"text",key:status,name:status}
      ,{type:"text",key:b,name:b1}
    ];
}

var user = [-1];
var pastUser = [-2];
var arbolAddress, arbolContract, arbolInstance;
var witAddress, witContract, witInstance;
var noaaAddress;

//TODO can we really rely on the acceptance events always firing before the proposal events and therefore creating a useful acceptedList
var acceptedList = [];

//data variables for NOAA calls
let NOAACODE = -1;
let MONTHCODE = -1;
let DURATIONCODE = -1;

function initMainPage(){
  if (Meteor.isClient) {
    Meteor.startup(async function() {
      console.log('Meteor.startup, width: ',screen.width);

      //instantiate some interface elements
      $('.close-click').click(() => $('#demo-popup').slideUp(200));
      $("#popup-text").click(() => {
        var copyText = document.getElementById("seed-phrase");
        copyText.select();
        document.execCommand("copy");
        // TODO why doesn't this work, JQUERY-UI is installed
        // $("#seed-phrase").bounce({
        //     interval: 100,
        //     distance: 20,
        //     times: 5
        // });
      });
      //start drawing svg
      drawUSA();
      drawMonths();

      //TODO check for mobile redirect
      if(screen.width <= 699) {
        // document.location = "mobile.html";
      }
      //check for Chrome browser
      if(!isChrome()){
        //display screen to exhort for use of chrome
        $("#not-chrome").show();
        $("#header").hide();
        $("#web3-onload").hide();
        $("#footer").addClass("not-chrome-footer");
      }else{
        $("#user").show();
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();
                // Acccounts now exposed

                //show relevant content depending on whether web3 is loaded or not
                $("#web3-onload").removeClass("disabled-div");

                // check for subsequent account activity, lockout screen if no metamask user is signed in
                setInterval(manageAccounts, 1000);
            } catch (error) {
              console.log('Web3 injection was declined by user')
            }
        }
        // Legacy dapp browsers...
        else if (typeof web3 !== 'undefined') {
          console.log("web3 from current provider: ", web3.currentProvider.constructor.name)
          // Use Mist/MetaMask's provider
          web3 = new Web3(web3.currentProvider);

          //show relevant content depending on whether web3 is loaded or not
          $("#web3-onload").removeClass("disabled-div");

          // check for subsequent account activity, lockout screen if no metamask user is signed in
          setInterval(manageAccounts, 1000);
        } else {
          console.log('No web3? You should consider trying MetaMask!')

          //show relevant content depending on whether web3 is available or not
          $('#no-web3').show();
        }
      }
    });
  }
}

async function manageAccounts(){
  try{
    user = await promisify(cb => web3.eth.getAccounts(cb));
    if(typeof user[0] === "undefined") user = [-1];
    console.log(`currentUser: ${user[0]}`, `last check: ${pastUser[0]}`,`user changed? ${user[0] !== pastUser[0]}`)
    if(user[0] !== pastUser[0]){
      console.log("_-_-_- CHANGE IN USER _-_-_-")
      //reset and reload everything for new user
      // $("#web3-onload").addClass("disabled-div");
      $('#open-pager-btns').hide();
      $('#my-pager-btns').hide();
      resetSessionVars();
      resetGlobalVariables();
      let s;
      if(user[0] !== -1){
        $('#user-hash').html(user[0]);
        $('#user-hash').removeClass('red-text');
        $('#user-hash').addClass('green-text');

        $('#my-wrapper').removeClass('loading');
        $('#my-loader').hide();

        updateBalance();
      } else {
        $('#user-hash').html("No current user- log into MetaMask");
        $('#user-hash').addClass('red-text');
        $('#user-hash').removeClass('green-text');

        $('#my-loader').show();
        $('#my-wrapper').addClass('loading');

        updateBalance();
      }
      loadData();
    }
    pastUser = user;
  } catch (error) {
    console.log(error)
  }
}

//begin the process of loading all the data
function loadData(){
  console.log("fn: loadData")
  //check for network use correct deployed addresses
  web3.version.getNetwork((err, netId) => {
    switch (netId) {
      case "1":
        $("#network-name").html("Mainnet");
        $("#network-name").addClass("red-text");
        console.log('This is mainnet')
        break
      case "2":
        $("#network-name").html("Deprecated Morden");
        $("#network-name").addClass("red-text");
        console.log('This is the deprecated Morden test network.')
        break
      case "3":
        $("#network-name").html("Ropsten");
        $("#network-name").addClass("red-text");
        console.log('This is the ropsten test network.')
        break
      case "4":
        $("#network-name").html("Rinkeby");
        $("#network-name").removeClass("red-text");
        $("#network-name").addClass("green-text");
        console.log('This is the Rinkeby test network.')
        witAddress  = "0x8ac71ef838699f2ebe03b00adb1a726aa2153afa";
        arbolAddress = "0x23b14dd217771f3d9988676df4301cca773853ca";
        noaaAddress = "0x598ca8a1da8f889a244a6031126fa6bd71acc292";

        break
      case "42":
        $("#network-name").html("Kovan");
        $("#network-name").addClass("red-text");
        console.log('This is the Kovan test network.')
        break
      default:
        $("#network-name").html("Unkown");
        $("#network-name").addClass("red-text");
        console.log('This is an unknown network.')
        //ganache-cli
        witAddress  = "0x0a143bdf026eabaf95d3e88abb88169674db92f5";
        arbolAddress = "0x5dc1e82631a4be896333f38a8214554326c11796";
        noaaAddress = "0x7cb50610e7e107b09acf3fbb8724c6df3f3e1c1d";
        //ganache gui
    }
    arbolContract = web3.eth.contract(ARBOLABI);
    arbolInstance = arbolContract.at(arbolAddress);
    witContract = web3.eth.contract(WITABI);
    witInstance = witContract.at(witAddress);

/*

//Ben's happy place. Do not disturb.
    noaaContract = web3.eth.contract(NOAAABI);
    noaaInstance = noaaContract.at(noaaAddress);

  let sentNOAAPrecipAggregateOraclizeComputation = noaaInstance.sentNOAAPrecipAggregateOraclizeComputation({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    console.log("sentNOAAPrecipAggregateOraclizeComputation: ", result)
  });

  let gotNOAAPrecipAggregateCallback = noaaInstance.gotNOAAPrecipAggregateCallback({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    console.log("gotNOAAPrecipAggregateCallback: ", result)
  });

  */

    //populate lists
    latestProposals();
    latestAcceptances();
    latestEvaluations();
  })
}

function resetGlobalVariables(){
  opPagination = 0;
  myPagination = 0;
  acceptedList = [];
  if(watchLatestProposal !== -1) watchLatestProposal.stopWatching();
  if(watchLatestAcceptance !== -1) watchLatestAcceptance.stopWatching();
  if(watchLatestEvaluation !== -1) watchLatestEvaluation.stopWatching();
}

//get all proposals, add new entries as they are created
var watchLatestProposal = -1;
function latestProposals(){
  console.log("fn: latestProposals");
  watchLatestProposal = witInstance.ProposalOffered({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    console.log(result)
    updateBalance();
    let id = result.args.WITID.toNumber();
    console.log("===> latest: 'offered', id:",id);
    addToken(result);
    $('#open-loader').hide();
    $('#open-wrapper').removeClass('loading');
  });
}

//get all acceptances, add new acceptances to myProposals as they are created and remove from open proposals
var watchLatestAcceptance = -1;
function latestAcceptances(){
  console.log("fn: latestAcceptance");
  //do something as new proposal is accepted
  watchLatestAcceptance = witInstance.ProposalAccepted({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    console.log(result)
    updateBalance();
    let id = result.args.WITID.toNumber();
    console.log("===> latest: 'accepted', id:",id)
    addAcceptance(result);
  });
}

//get all evaluations
var watchLatestEvaluation = -1;
function latestEvaluations(){
  console.log("fn: latestEvaluation")
  //do something as new evaluation is accepted
  watchLatestEvaluation = witInstance.WITEvaluated({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    updateBalance();
    console.log("===> latest: 'evaluated'")
    console.log(result)
    //update status in "my protections pages"
    //go through list, change status update page
    let list = Session.get("myProtectionsData");
    let index = findIndex(list,el => el.id == result.args.WITID);
    if(index != -1){
      let outcome = "";
      let payout = toEth(result.args.weiPayout.toNumber());
      if(true) outcome = `You received <span class="green-text">${payout}</span>`
      else outcome = "You did not receive the payout";
      console.log("col",list,index,list[index])
      list[index].column[7].key = "Evaluation";
      list[index].column[7].name = "Evaluation complete";
      list[index].column[8].key = "Evaluated";
      list[index].column[8].name = outcome;
      Session.set("openProtectionsData",list);
    }
  })
}

//add token to list
async function addToken(result){
  try{
    let id = result.args.WITID;
    let owner = await promisify(cb => witInstance.ownerOf(id, cb));

    //add to open protections
    if(acceptedList.indexOf(id.toNumber()) === -1){
      //TODO reinstate date filter
      //only show entries whose starting dates haven't passed
      // if(new Date(result.args.start.toNumber()) - new Date() > 0){
      if(true){
        let list = Session.get("openProtectionsData");
        console.log("===> proposal offered, id:",id.toNumber());
        list.push(new Entry(result,owner));
        console.log("all tokens",list.length,list,acceptedList.length,acceptedList)
        list = sortArray(list,Session.get("sortIndex"),Session.get("descending"));
        Session.set("openProtectionsData",list);

        //if more than ten items turn on pagination
        //set max pagination
        let tblRow = tableRows();
        if(list.length > tblRow){
          $("#open-pager-btns").show();
          $("#open-max").html(Math.ceil(list.length/tblRow));
          $("#open-current").html(1);
        }

        //show paginated items
        let pageList = paginateData(list,opPagination);
        if(pageList.length > 0){
          Session.set("openProtectionsPaginatedData",pageList);
        }else{
          if(opPagination > 0) opPagination -= 1;
        }
      }
    }

    //add to my protections
    console.log("my entry", owner, user[0], result)
    if(owner === user[0]){
      let list = Session.get("myProtectionsData");
      list.push(new MyEntry(result,result.args,id.toNumber(),true));
      list = sortArray(list,Session.get("mySortIndex"),Session.get("descending"));
      Session.set("myProtectionsData",list);

      //if more than ten items turn on pagination
      let tblRow = tableRows();
      if(list.length > tblRow){
        $("#my-pager-btns").show();
        $("#my-max").html(Math.ceil(list.length/tblRow));
        $("#my-current").html(1);
      }

      //show paginated items
      let pageList = paginateData(list,myPagination);
      if(pageList.length > 0){
        Session.set("myProtectionsPaginatedData",pageList);
      }else{
        if(myPagination > 0) myPagination -= 1;
      }
    }
  }catch(error){
    console.log(error);
  }
}

function removeToken(id){
  // console.log("removeToken")
  //add to open protections
  let list = Session.get("openProtectionsData");
  if(list.length > 0){
    let index = findIndex(list,el => el.id == id);
    list.splice(index,1);
    // list = sortArray(list,Session.get("sortIndex"),Session.get("descending"));
    Session.set("openProtectionsData",list);

    //if more than ten items turn on pagination
    if(list.length <= tableRows()){
      $("#open-pager-btns").hide();
    }

    //show paginated items
    let pageList = paginateData(list,opPagination);
    if(pageList.length > 0){
      Session.set("openProtectionsPaginatedData",pageList);
    }else{
      if(opPagination > 0) opPagination -= 1;
    }
  }
}

function findIndex(array,cb){
  let l = array.length;
  while(l--){
    if(cb(array[l])) return l;
  }
  return -1;
}

//add acceptance to my protections
async function addAcceptance(result){
  // console.log("fn: addAcceptance")
  try{
    let outerResult = result;
    let idpObj = result.args.WITID;
    let idp = idpObj.toNumber();

    let idObj = result.args.aboveID;
    if(idp === result.args.aboveID.toNumber()) idObj = result.args.belowID;
    let id = idObj.toNumber();

    console.log("===> proposal accepted, id:", id);
    //prevent previous tokens from being added to list
    acceptedList.push(idp);
    //if they are already shown remove them
    removeToken(idp);

    //these next 3 lines just resort the my protections table but I am not sure they are required for anything
    let updateList = Session.get("myProtectionsData");
    updateList = sortArray(updateList,Session.get("mySortIndex"),Session.get("descending"));
    Session.set("myProtectionsData",updateList);

    //if they were your proposals update your "my protections"
    let owner = await promisify(cb => witInstance.ownerOf(idObj, cb));
    if(owner === user[0]){
      //hide the loading
      $('#my-loader').hide();
      $('#my-wrapper').removeClass('loading');

      //get contract information for associated proposal
      witInstance.ProposalOffered({WITID:idpObj},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
        console.log("===> proposal accepted details retrieved, id:",id)
        let list = Session.get("myProtectionsData");
        list.push(new MyEntry(outerResult,result.args,id,false));
        list = sortArray(list,Session.get("mySortIndex"),Session.get("descending"));
        Session.set("myProtectionsData",list);

        //if more than ten items turn on pagination
        if(list.length > tableRows()){
          $("#my-pager-btns").show();
        }

        //show paginated items
        let pageList = paginateData(list,myPagination);
        if(pageList.length > 0){
          Session.set("myProtectionsPaginatedData",pageList);
        }else{
          if(myPagination > 0) myPagination -= 1;
        }
      });
    }
  } catch (error) {
    console.log(error)
  }
}

//conversion
function toEth(n){
  return n/Math.pow(10,18);
}

function toWei(n){
  return n*Math.pow(10,18);
}

// num = a.start.toNumber()
let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function dateText(iso){
  let d1 = new Date(iso).toISOString().substring(0,7);
  let a = d1.split("-");
  let n = parseInt(a[1]) - 1;
  return months[n] + " " + a[0];
}

function dateNum(text){
  let a = text.split(" ");
  let lm = months.length;
  let n = 0;
  while(lm--){
    if(months[lm] === a[0]) n = lm;
  }
  return parseInt(a[1]) + n/12;
}

async function updateBalance(){
  if(user[0] === -1){
    $('#user-balance').html("0.000");
    $('#user-balance').removeClass('green-text');
    $('#user-balance').addClass('red-text');
  } else {
    web3.eth.getBalance(user[0],function (error, result) {
      if (!error) {
        var e = toEth(result.plus(21).toString(10));
        if(e === 0){
          $('#user-balance').html("0.000");
          $('#user-balance').removeClass('green-text');
          $('#user-balance').addClass('red-text');
        }else{
          $('#user-balance').html(clipNum(e));
          $('#user-balance').removeClass('red-text');
          $('#user-balance').addClass('green-text');
        }
      } else {
        console.error(error);
      }
    });
  }
}

// give number three decimals
function clipNum(n){
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

//check if browser is google Chrome
function isChrome(){
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

//number of rows in the sortable tables
function tableRows(){
  //TODO decide how many rows based on available area
  return 15;
}

////////////////////////////////////////////
// FUNCTIONS RELATED TO VORONOI ANIMATION
////////////////////////////////////////////

// function voronoiAnimation(){
//
//   let c = ["#446633","#44AA33","#338833","#227733","#448822","#448855","#447733","#337733","#888844"];
//
//   var width = 725,
//       height = 250,
//       color_qtd = 9;
//   var vertices = d3.range(300).map(function(d) {
//     // return [Math.min(Math.tan(Math.random()*Math.PI/2)/50,1)* width, Math.random() * height];
//     return [Math.min(Math.random()**2,1)*width, Math.random() * height];
//   });
//   var voronoi = d3.voronoi();
//   var svg = d3.select("#arbol-text");
//   var path = svg.append("g").selectAll("path");
//   redraw();
//
//   function redraw() {
//     path = path.data(voronoi.polygons(vertices), polygon);
//     path.exit().remove();
//     path.enter().append("path")
//         .attr("clip-path","url(#arbol-clip)")
//         .attr("fill", function(d, i) { return c[i%color_qtd];})
//         .attr("stroke","none")
//         .attr("d", polygon);
//     path.order();
//   }
//
//   function polygon(d) {
//     return "M" + d.join("L") + "Z";
//   }
// }

////////////////////////////////////////////
// FUNCTIONS RELATED TO THE TAB LAYOUT
////////////////////////////////////////////

Template.tabs.events({
  'click .click-tab': function(e){
    $('html, body').animate({
      scrollTop: $('#arbol-wrapper').height()
    }, 500);
      if(e.currentTarget.id === "open-tab"){
      $("#open-protections").show();
      $("#create-protection").hide();
      $("#your-protections").hide();
    }
    if(e.currentTarget.id === "create-tab"){
      $("#open-protections").hide();
      $("#create-protection").show();
      $("#your-protections").hide();
    }
    if(e.currentTarget.id === "your-tab"){
      $("#open-protections").hide();
      $("#create-protection").hide();
      $("#your-protections").show();
    }
  }
});

Template.arrow.events({
  'click .arrow-border': function(e){
    $('html, body').animate({
      scrollTop: $('#arbol-wrapper').height()
    }, 500);
  }
});

////////////////////////////////////////////
// FUNCTIONS RELATED TO SORTABLE TABLES
////////////////////////////////////////////

function resetSessionVars(){
  Session.set("filterCriteria",{});
  Session.set("openProtectionsData",[]);
  Session.set("myProtectionsData",[]);
  Session.set("openProtectionsPaginatedData",[]);
  Session.set("myProtectionsPaginatedData",[]);
  Session.set("sortIndex",0);
  Session.set("descending",true);
  Session.set("mySortIndex",0);
  Session.set("myDescending",true);
}

Template.sortableRows.helpers({
  isEqual: function (a, b) {
  return a === b;
  }
});

Template.sortableRows.events({
  'click .buyit': function(e){
    if(user[0] === -1){
      alert("Please login to MetaMask buy a proposal.");
    } else {
      if(typeof e.target.value === 'undefined') acceptProposal(e.target.parentElement.value);
      else acceptProposal(e.target.value);
    }
  },
  'click .evaluateit': function(e){
    evaluateWIT(e.target.value);
  },
  'click .cancelit': function(e){
    alert("coming soon");
  }
});

async function acceptProposal(v){
  let vals = v.split(",");
  let ethAsk = vals[0]
  let id = vals[1];

  try {
    console.log("====> new WIT acceptance");
    console.log("ethAsk", ethAsk);
    console.log("proposal token ID", id);

    //TODO don't let user accept their own proposal
    await promisify(cb => witInstance.createWITAcceptance(id,{from: user[0], value:toWei(ethAsk)},cb));
  } catch (error) {
    console.log(error)
  }
}

//evaluate WIT once its period h gas elapsed
async function evaluateWIT(id){
  try {
    let idodd = parseInt(id);
    if(id/2 === Math.round(id/2)) idodd = parseInt(id) - 1;
    console.log("=================> new WIT evaluation");
    console.log("token ID", id, idodd, user[0]);
    await promisify(cb => witInstance.evaluate(idodd,"",{from: user[0]},cb));
  } catch (error) {
    console.log(error)
  }
}

Template.headerRow.events({
  'mouseenter th': function(e){
    $(e.target).addClass('hover');
  },
  'mouseleave th': function(e){
    $(e.target).removeClass('hover');
  },
  'click th': function(e,template){
    var t = e.target;
    $(t).fadeIn(100).fadeOut(100).fadeIn(100); //.fadeOut(100).fadeIn(100);
    //sort the json based on the header
    let array = [];
    let colIndex = 0;
    if(t.parentElement.parentElement.parentElement.id === "openProtections"){
      let d = Session.get("descending");
      array = Session.get("openProtectionsData");
      //sort array based on the click header
      if(t.innerText === "LOCATION") colIndex = 0;
      if(t.innerText === "THRESHOLD") colIndex = 1;
      if(t.innerText === "INDEX") colIndex = 2;
      if(t.innerText === "START") colIndex = 3;
      if(t.innerText === "END") colIndex = 4;
      if(t.innerText === "TOTAL PAYOUT") colIndex = 5;
      if(t.innerText === "PRICE") colIndex = 6;
      Session.set("sortIndex",colIndex);
      //set variable to new sorted array
      let list = sortArray(array,colIndex,d);
      Session.set("openProtectionsData",list);
      opPagination = 0;
      let pageList = paginateData(list,0);
      Session.set("openProtectionsPaginatedData",pageList);
      Session.set("descending",!d);
    }
    if(t.parentElement.parentElement.parentElement.id === "myProtections"){
      let d = Session.get("myDescending");
      array = Session.get("myProtectionsData");
      //sort array based on the click header
      if(t.innerText === "LOCATION") colIndex = 0;
      if(t.innerText === "THRESHOLD") colIndex = 1;
      if(t.innerText === "INDEX") colIndex = 2;
      if(t.innerText === "START") colIndex = 3;
      if(t.innerText === "END") colIndex = 4;
      if(t.innerText === "YOUR CONTRIBUTION") colIndex = 5;
      if(t.innerText === "TOTAL PAYOUT") colIndex = 6;
      if(t.innerText === "STATUS") colIndex = 7;
      if(t.innerText === "ACTION") colIndex = 8;
      Session.set("mySortIndex",colIndex);
      //set variable to new sorted array
      let list = sortArray(array,colIndex,d);
      Session.set("myProtectionsData",list);
      myPagination = 0;
      let pageList = paginateData(list,0);
      Session.set("myProtectionsPaginatedData",pageList);
      Session.set("myDescending",!d);
    }
  }
});

function sortArray(array,i,d){
  let sortedArray = _.sortBy(array,function(obj){
    let cell = obj.column[i], key;
    if(cell.type === "num") return key = parseFloat(cell.key);
    if(cell.type === "text") return key = cell.key;
  });
  if(d) sortedArray.reverse();
  return sortedArray;
}

////////////////////////////////////////////
// FUNCTIONS RELATED TO PAGINATION
////////////////////////////////////////////

//TODO grey out back and forward button as appropriate
// Paginate through all the data
var opPagination = 0;
Template.openPagination.events({
  'click #open-forward'(e){
    opPagination += 1;
    let list = Session.get("openProtectionsData");
    let pageList = paginateData(list,opPagination);
    if(pageList.length > 0) Session.set("openProtectionsPaginatedData",pageList);
    else if(opPagination > 0) opPagination -= 1;
    $("#open-current").html(opPagination+1);
  },
  'click #open-back'(e){
    if(opPagination > 0) opPagination -= 1;
    let fullList = Session.get("openProtectionsData");
    let pageList = paginateData(fullList,opPagination);
    Session.set("openProtectionsPaginatedData",pageList);
    $("#open-current").html(opPagination+1);
  }
});

var myPagination = 0;
Template.myPagination.events({
  'click #my-forward'(e){
    myPagination += 1;
    let fv = $('#first-token-filter').val();
    let list = Session.get("myProtectionsData");
    let pageList = paginateData(list,myPagination);
    if(pageList.length > 0) Session.set("myProtectionsPaginatedData",pageList);
    else if(myPagination > 0) myPagination -= 1;
    $("#my-current").html(myPagination+1);
  },
  'click #my-back'(e){
    if(myPagination > 0) myPagination -= 1;
    let fullList = Session.get("myProtectionsData");
    let pageList = paginateData(fullList,myPagination);
    Session.set("myProtectionsPaginatedData",pageList);
    $("#my-current").html(myPagination+1);
  }
});

//break all entries into list of x entries
function paginateData (array,index) {
  let bin = tableRows();
  let l = array.length;
  if(l < index*bin){
    return [];
  }else{
    if(l <= (index+1)*bin){
      return array.slice(index*bin,l);
    }
    if(l > (index+1)*bin){
      return array.slice(index*bin,(index+1)*bin);
    }
  }
}

////////////////////////////////////////////
// FUNCTIONS RELATED TO "OPEN PROTECTIONS"
////////////////////////////////////////////

// populate open protections table
Template.openProtectionsTable.helpers({
  headerData: function() {
    return [
      {
        type: "headerRow"
        ,column: [
          {name:"Location"}
          ,{name:"Threshold"}
          ,{name:"Index"}
          ,{name:"Start"}
          ,{name:"End"}
          ,{name:"Total Payout"}
          ,{name:"Price"}
        ]
      }
    ];
  },
  bodyData: function(){
    return Session.get("openProtectionsPaginatedData");
  }
});

////////////////////////////////////////////
// FUNCTIONS RELATED TO "CREATE A PROTECTION"
////////////////////////////////////////////

Template.formNewProtection.onCreated(function () {
  // declare and set reactive variable that indicates the form step
  this.createWITstep = new ReactiveVar();
  this.createWITstep.set(1);
  this.createWITdata = new ReactiveVar();
  this.createWITdata.set({
    'weatherIndex':'Rainfall',
    'locationType':'Weather Stations',
    'locationRegion':'US Corn Belt',
    'month-start':null,
    'year-start':null,
    'month-end':null,
    'year-end':null,
    'threshold-relation':null,
    'threshold-percent':null,
    'threshold-average':null,
    'your-contrib':0,
    'total-contrib':0
  });
  console.log('Current Create WIT step = '+this.createWITstep.get());
  console.log('Current Create WIT data = '+this.createWITdata.get());
});
Template.formNewProtection.onRendered(function(){
  // show the first step
  $("#createwit .step").eq(0).addClass('showing');
  // disable the previous button since this is the first step
  $("#createwit-prev button").attr('disabled','disabled');
  // hide the submit button since this is the first step
  $("#createwit-submit").hide();
  // datepicker
  $('[data-toggle="datepicker"]').datepicker({
    format: 'mm/yyyy',
    startDate: '01/2017',
    endDate: '12/2020'
  });
});

Template.formNewProtection.helpers({
  step() {
    return Template.instance().createWITstep.get();
  },
  data(key) {
    return Template.instance().createWITdata.get()[key];
  }
});
// Dealing with submittal of form
Template.formNewProtection.events({
  // click action for previous button
  'click #createwit-prev button'(event){
    event.preventDefault();
    self = Template.instance();
    // decrement the step number
    self.createWITstep.set(self.createWITstep.get() - 1);
    console.log('Current Create WIT step = '+self.createWITstep.get());
    // show the correct step
    $("#createwit .step.showing").removeClass('showing');
    $("#createwit .step").eq((self.createWITstep.get() - 1)).addClass('showing');
    // if this is the first step, disable the previous button
    if (self.createWITstep.get() < 2) {
      $("#createwit-prev button").attr('disabled','disabled');
      $("#createwit-next").show();
      $("#createwit-submit").hide();
    }
    // if this is the last step, hide the next button and show the confirm button
    else if (self.createWITstep.get() >= $("#createwit .step").length) {
      $("#createwit-prev button").show().removeAttr('disabled');
      $("#createwit-next").hide();
      $("#createwit-submit").show();
    }
    // otherwise, hide the confirm button, show the next button and enable the previous button
    else {
      $("#createwit-prev button").show().removeAttr('disabled');
      $("#createwit-next").show();
      $("#createwit-submit").hide();
    }
  },
  'click #createwit-next button'(event){
    event.preventDefault();
    self = Template.instance();
    // increment the step button
    self.createWITstep.set(self.createWITstep.get() + 1);
    console.log('Current Create WIT step = '+self.createWITstep.get());
    // show the correct step
    $("#createwit .step.showing").removeClass('showing');
    $("#createwit .step").eq((self.createWITstep.get() - 1)).addClass('showing');
    // if this is the first step, disable the previous button and hide the submit button
    if (self.createWITstep.get() < 2) {
      $("#createwit-prev button").attr('disabled','disabled');
      $("#createwit-next").show();
      $("#createwit-submit").hide();
    }
    // if this is the last step, hide the next button and show the confirm button
    else if (self.createWITstep.get() >= $("#createwit .step").length) {
      $("#createwit-prev button").show().removeAttr('disabled');
      $("#createwit-next").hide();
      $("#createwit-submit").show();
    }
    // otherwise, hide the confirm button, show the next button and enable the previous button
    else {
      $("#createwit-prev button").show().removeAttr('disabled');
      $("#createwit-next").show();
      $("#createwit-submit").hide();
    }
  },
  'click #createwit-cancel button'(event){
    event.preventDefault();
    // reset the step to 1
    self = Template.instance();
    self.createWITstep.set(1);
    // show the correct step
    $("#createwit .step.showing").removeClass('showing');
    $("#createwit .step").eq(0).addClass('showing');
    // since we are resetting to the first step, disable the previous button and hide the submit button
    $("#createwit-prev button").attr('disabled','disabled');
    $("#createwit-next").show();
    $("#createwit-submit").hide();
    // borrowed from button action for app menu buttons, scroll to top of page
    $('html, body').animate({
      scrollTop: $('#arbol-wrapper').height()
    }, 500);
    // reset the showing/hiding of tabs to default state
    $("#open-protections").show();
    $("#create-protection").hide();
    $("#your-protections").hide();
  },
  'input [name="weatherIndex"]'(event){
    self = Template.instance();
    selfdata = self.createWITdata.get();
    selfdata.weatherIndex = $('[name="weatherIndex"]:checked').val();
    self.createWITdata.set(selfdata);
  },
  'input [name="locationType"]'(event){
    self = Template.instance();
    selfdata = self.createWITdata.get();
    selfdata.locationType = $('[name="locationType"]:checked').val();
    self.createWITdata.set(selfdata);
  },
  'input [data-toggle="datepicker"]'(event){
    console.log('datepicker value = ' + event.currentTarget.value);
    if ($(event.currentTarget).attr('id') == "date-start") {
      // get selected date
      let limitStart = $(event.currentTarget).datepicker('getDate');
      // add 11 months
      let limitEnd = limitStart;
      limitEnd.setMonth(limitEnd.getMonth() + 11);
      // use these dates to constrain the selection for the end date
      let limitStart_year = limitStart.getFullYear();
      let limitStart_month = (limitStart.getMonth() < 10) ? '0' + limitStart.getMonth() : limitStart.getMonth();
      let limitEnd_year = limitEnd.getFullYear();
      let limitEnd_month = (limitEnd.getMonth() < 10) ? '0' + limitEnd.getMonth() : limitEnd.getMonth();
      $('#date-end').datepicker({
        startDate: limitStart_month + '/' + limitStart_year,
        endDate: limitEnd_month + '/' + limitEnd_year
      });
    }
  },
  'input .date-input'(event){
    let d = capDate2(event.currentTarget);
    // should probably make a choice here about either running these checks in the capDate2 function or just running theme here and using capDate2 to create the date object
    if(d.s*d.sy*d.e*d.ey > 0){ // runnning duplicate check from the capDate2 function
      if(d.ed-d.sd < 0.91 && d.sd <= d.ed){ // running duplicate check from the capDate2 function
        MONTHCODE = d.e;
        DURATIONCODE = Math.round((d.ed - d.sd)*12 + 1)%12;
        callNOAA();
      }
      // need else statement here with error message about improper date selections
    }
    self = Template.instance();
    selfdata = self.createWITdata.get();
    targetid = $(event.currentTarget).attr('id');
    selfdata[targetid] = $(event.currentTarget).find('option:selected').text();
    self.createWITdata.set(selfdata);
  },
  'input #your-contrib'(event){
    capVal(event.currentTarget);
    $("#your-contrib").removeClass("missing-info");
    self = Template.instance();
    selfdata = self.createWITdata.get();
    targetid = $(event.currentTarget).attr('id');
    selfdata[targetid] = event.currentTarget.value;
    self.createWITdata.set(selfdata);
  },
  'input #total-contrib'(event){
    $("#total-contrib").removeClass("missing-info");
    self = Template.instance();
    selfdata = self.createWITdata.get();
    targetid = $(event.currentTarget).attr('id');
    selfdata[targetid] = event.currentTarget.value;
    self.createWITdata.set(selfdata);
  },
  'input #threshold'(event) {
    changeThreshold();
    calcTenYrP();
    self = Template.instance();
    selfdata = self.createWITdata.get();
    fields = $(event.currentTarget).find('select');
    for (x=0;x<fields.length;x++) {
      fieldid = fields.eq(x).attr('id');
      selfdata[fieldid] = fields.eq(x).find('option:selected').text();
    }
    self.createWITdata.set(selfdata);
  },
  'input #location'(event) {
    changeRegion(event.currentTarget.value);
    $("#location").removeClass("missing-info");
    self = Template.instance();
    selfdata = self.createWITdata.get();
    selfdata.locationRegion = $(event.currentTarget).find('option:selected').text();
    self.createWITdata.set(selfdata);
  },
  'click .ag-areas'(event) {
    self = Template.instance();
    selfdata = self.createWITdata.get();
    targetclasses = $(event.currentTarget).attr('class').split(/\s+/);
    for (x=0;x<targetclasses.length;x++) {
      if ($('option[value="'+targetclasses[x]+'"]').length > 0) {
        selfdata.locationRegion = $('option[value="'+targetclasses[x]+'"]').text();
        self.createWITdata.set(selfdata);
      }
    }
  },
  'submit .new-protection'(event) {
    if (user[0] === -1){
      alert("Please login to MetaMask to create a proposal.");
      return false;
    }
    else {
      event.preventDefault();
      const target = event.currentTarget;
      const yourContr = parseFloat(target[0].value);
      const totalPayout = parseFloat(target[1].value);
      const location = target[2].value;
      const thresholdRelation = target[3].value;
      const thresholdPercent = target[4].value;
      const thresholdAverage = target[5].value;
      let sm = target[6].value;
      const sy = target[7].value;
      let em = target[8].value;
      const ey = target[9].value;
      if(sm.length === 1) sm = "0" + sm;
      if(em.length === 1) em = "0" + em;
      const startDate = `${sy}-${sm}`;
      const endDate = `${ey}-${em}`;
      const index = "Precipitation";

      //check if info is missing
      if(startDate === "" || endDate === "" || parseFloat(yourContr) === 0 || parseFloat(totalPayout) === 0 || location === "" || index === "" || thresholdRelation === "" || thresholdPercent === "" || thresholdAverage === ""){
        var s = "Please complete missing elements: \n";
        if(parseFloat(yourContr) === 0){
          s += "  Your Contribution \n";
          $("#your-contrib").addClass("missing-info");
        }
        if(parseFloat(totalPayout) === 0){
          s += "  Total Payout \n";
          $("#total-contrib").addClass("missing-info");
        }
        if(location === ""){
          s += "  Location \n";
          $("#location").addClass("missing-info");
        }
        if(thresholdRelation === "" || thresholdPercent === "" || thresholdAverage === ""){
          s += "  Threshold \n";
          $("#threshold").addClass("missing-info");
        }
        if(startDate === ""){
          s += "  Start Date \n";
          $("#start-input").addClass("missing-info");
        }
        if(endDate === ""){
          s += "  End Date \n";
          $("#end-input").addClass("missing-info");
        }
        alert(s);
      }
      else {
        //ask for confirmation
        const confirmed = confirm ( "Please confirm your selection: \n\n"
          + "  Your Contribution (Eth): " + yourContr + "\n"
          + "  Total Payout (Eth): " + totalPayout + "\n"
          + "  Location: " + locationObj[location].text + "\n"
          + "  Threshold: " + threshText(thresholdRelation,thresholdPercent,thresholdAverage) + "\n"
          + "  Start Date: " + startDate + "\n"
          + "  End Date: " + endDate + "\n"
        );

        if (confirmed) {
          //call back that clears the form
          var clearForm = function(){
            //clear form if succesful
            target[0].value = 0;
            target[1].value = 0;
            target[2].value = "";
            target[3].value = "";
            target[4].value = "";
            target[5].value = "";
            target[6].value = "";
            target[7].value = "";
            $('#end-date')[0].min = "";
            $('#start-date')[0].max = "";
            $('#total-contrib')[0].min = 0;
            //unselect region, reset text value
            clearChart();
            $("#ten-yr-prob").html("");
            $('#location').val("none");
            d3.selectAll(`path.${selectedRegion}`)
              .attr("fill","none");
            selectedRegion = "none";
            NOAACODE = -1;
            MONTHCODE = -1;
            DURATIONCODE = -1;
          }

          //submit info
          createProposal(startDate,endDate,yourContr,totalPayout,location,index,thresholdRelation,thresholdPercent,thresholdAverage,clearForm);
        }
        else {
          //let user continue to edit
        }
      }
    }
  }
});

async function createProposal(startDate,endDate,yourContr,totalPayout,location,index,thresholdRelation,thresholdPercent,thresholdAverage,clearForm){
  console.log("createProposal")
  const d1 = (new Date(startDate)).getTime()/1000; //convert to UNIX timestamp
  let dd2 = new Date(endDate);
  dd2.setDate(dd2.getDate() + 15);
  const d2 = dd2.getTime()/1000; //convert to UNIX timestamp

  let ethPropose = toWei(yourContr);
  let ethAsk = toWei(totalPayout - yourContr);
  let above = threshRelationObj[thresholdRelation].val;
  let numPPTH = threshValPPTH(thresholdPercent,thresholdAverage);
  let location32 = numStringToBytes32(locationObj[location].noaaCode);
  let makeStale = false; //TODO for deployment makeStale should be true in default
  console.log(ethPropose, ethAsk, above, noaaAddress, numPPTH, location32, d1, d2, makeStale);

  try {
    await promisify(cb => witInstance.createWITProposal(ethPropose, ethAsk, above, noaaAddress, numPPTH, location32, d1, d2, makeStale, {value: ethPropose, from:user[0]}, cb));
    clearForm();
  } catch (error) {
    console.log(error)
  }
}

// Big Number
function numStringToBytes32(num) {
   var bn = new BN(num).toTwos(256);
   return padToBytes32(bn.toString(16));
}

function bytes32ToNumString(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new BN(bytes32str, 16).fromTwos(256);
    return bn.toString();
}

function padToBytes32(n) {
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}

// this function can be removed and replaced with a date picker
function capDate(target){
  //change properties of the other date picker so that incorrect values can't be chosen
  var date = target.value;
  var id = target.id;
  var now = new Date().toISOString().substring(0,7);
  $('#start-date')[0].min = now;
  //if start is changed first, then put min on end Date
  if(id === 'start-date'){
    if(date !== "") $('#end-date')[0].min = date;
  }
  if(id === 'end-date'){
    if(date !== "") $('#start-date')[0].max = date;
  }
}

function capDate2(target){
  let s = +$('#month-start')[0].value
    ,sy = +$('#year-start')[0].value
    ,sd = sy + s/12;
  let e = +$('#month-end')[0].value
    ,ey = +$('#year-end')[0].value
    ,ed = ey + e/12;

  console.log('s = '+s);
  console.log('sy = '+sy);
  console.log('sd = '+sd);
  console.log('e = '+e);
  console.log('ey = '+ey);
  console.log('ed = '+ed);
  console.log('s*sy*e*ey = ' + s*sy*e*ey);
  console.log('ed-sd = ' + (ed - sd));

  if (s*sy*e*ey > 0) { // checks that all 4 date fields have a value
    if(ed-sd >= 0.9 || sd > ed) { // check if duration is more than 11 months OR if the start date is greater than the end date
      if(target.id === "month-start" || target.id === "year-start"){
        $('#start-input').addClass("missing-info");
        $('#end-input').removeClass("missing-info");
      }
      if(target.id === "month-end" || target.id === "year-end"){
        $('#start-input').removeClass("missing-info");
        $('#end-input').addClass("missing-info");
      }
    }
    if(ed-sd < 1 && sd < ed){
      $('#start-input').removeClass("missing-info");
      $('#end-input').removeClass("missing-info");
    }
    // //if start date is after end date
    // if(sd >= ed){
    //   if(target.id === "month-start" || target.id === "year-start"){
    //     ey = sy;
    //     ed = ey + e/12;
    //     //only change month if necessary
    //     if(sd >= ed){
    //       e = s;
    //       ed = sd;
    //     }
    //     $('#month-end')[0].value = e;
    //     $('#year-end')[0].value = ey;
    //     //TODO animate to indicate change to user
    //   }
    //   if(target.id === "month-end" || target.id === "year-end"){
    //     sy = ey;
    //     sd = sy + s/12;
    //     //only change month if necessary
    //     if(sd >= ed){
    //       s = e;
    //       sd = ed;
    //     }
    //     $('#month-start')[0].value = s;
    //     $('#year-start')[0].value = sy;
    //     //TODO animate to indicate change to user
    //   }
    // }
  }
  return {s:s,sy:sy,sd:sd,e:e,ey:ey,ed:ed};
}

function capVal(target){
  //change properties of the other date picker so that incorrect values can't be chosen
  var num = parseFloat(target.value);
  var step = parseFloat($('#your-contrib')[0].step);
  let next = clipNum(num + step);
  $('#total-contrib')[0].min = next;

  let tot = parseFloat($('#total-contrib')[0].value);
  if(num >= tot) $('#total-contrib')[0].value = next;
}

////////////////////////////////////////////
// FUNCTIONS RELATED TO "MY PROTECTIONS"
////////////////////////////////////////////

// populate open protections table
Template.myProtectionsTable.helpers({
  headerData: function() {
    return [
      {
        type: "headerRow"
        ,column: [
          {name:"Location"}
          ,{name:"Threshold"}
          ,{name:"Index"}
          ,{name:"Start"}
          ,{name:"End"}
          ,{name:"Your Contribution"}
          ,{name:"Total Payout"}
          ,{name:"Status"}
          ,{name:"Action"}
        ]
      }
    ];
  },
  bodyData: function(){
    return Session.get("myProtectionsPaginatedData");
  }
});

////////////////////////////////////////////
// JAVASCRIPT FOR D3
////////////////////////////////////////////

let selectedRegion = "none";
let currentHTTP = 0;

async function drawUSA(){
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
        callNOAA();
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

function changeRegion(region){
  if(region !== selectedRegion){
    // update the form
    $('#location').val(region);

    //make previous region go blank
    d3.selectAll(`path.${selectedRegion}`)
      .attr("fill","none");

    selectedRegion = region;
    NOAACODE = locationObj[selectedRegion].noaaCode;
    callNOAA();
    d3.selectAll(`path.${selectedRegion}`)
      .attr("fill","yellow")
      .attr("fill-opacity",1);
  }
}

function callNOAA(){
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
      // }else if(results.data === null){
      //   console.log("NOAA call failed, try again, returned data = null")
      //   $("#chart-loader").fadeOut(500);
      //   $("#NOAA-msg").fadeIn(1000);
      }else{
        console.log("NOAA results",results)
        let obj = parseData(results);
        //if a new NOAA call is made before previous one has returned, block the returned info from updating the chart
        if(check === currentHTTP){
          upDateMonths(obj);
          calcTenYrP(obj);
          // $(".chart-loader-div").removeClass("chart-loader");
          $("#chart-loader").fadeOut(500);
        }

      }
    });
  }
}

var svg, width, height, margin = {top: 40, right: 50, bottom: 45, left: 50};
var dataExtents, svgStart, svgEnd;
var tenYrAvg;

function drawMonths(){
  svg = d3.select("svg#chart");
  width = +svg.attr("width") - margin.left - margin.right;
  height = +svg.attr("height") - margin.top - margin.bottom;

  var data = [0,0,0,0,0,0,0,0,0,0];
  tenYrAvg = 0;
  dataExtents = d3.extent(data, function(d){return d;});

  svgStart = new Date(2007, 5, 1);
  svgEnd = new Date(2017, 8, 1);
  var x = d3.scaleTime()
      .rangeRound([0, width])
      .domain([svgStart,svgEnd]);
  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);
  var ymm = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]*25.4]);

  let g = svg.append("g")
    .attr("transform",`translate(${margin.left}+${margin.top})`);

  //yaxis
  g.append("g")
    .call(d3.axisLeft(y).ticks(4))
    .attr("class","yaxis")
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -35)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .attr("font-size","15px")
    .text("Total Precipitation (inches)");

  g.append("g")
    .call(d3.axisRight(ymm).ticks(4))
    .attr("class","yaxis-mm")
    .attr("transform",`translate(${width},0)`)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(90)")
    .attr("y", -50)
    .attr("x", 200)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .attr("font-size","15px")
    .text("Total Precipitation (mm)");

  //draw bars
  let barWidth = width*0.5/10;
  g.append("g")
    .attr("class","bars")
    .selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("class","bars")
    .attr("y",d => y(d))
    .attr("x",(d,i) => x(new Date(2008 + i, 0, 1)) - barWidth/2)
    .attr("width",barWidth)
    .attr("height",d => height - y(d) + 1)
    .attr("fill","#b5ffc0")
    .attr("stroke","green")
    .attr("stroke-width","4")
    .attr("stroke-dasharray", d => `${barWidth},${barWidth}`)
    .attr("opacity",1e-6);

  //xaxis
  g.append("g")
    .call(d3.axisBottom(x).ticks(9))
    .attr("class","xaxis")
    .attr("transform", `translate(0,${height})`)
    .append("text")
    .attr("fill", "#000")
    .attr("y", 40)
    .attr("x", width/2 )
    .attr("text-anchor", "middle")
    .attr("font-size","15px")
    .text("Year");

  g.append("line")
    .attr("class","tenYrAvg")
    .attr("y1",function(d){return y(tenYrAvg);})
    .attr("y2",function(d){return y(tenYrAvg);})
    .attr("x1",width*0.025)
    .attr("x2",width*0.975)
    .attr("stroke","black")
    .attr("stroke-width",4)
    .attr("stroke-dasharray","12, 8")
    .attr("opacity",1e-6);

  //title
  g.append("text")
    .attr("class","title")
    .attr("fill", "#000")
    .attr("y", -15)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .attr("font-size","16px")
    .attr("font-family","sans-serif")
    .attr("text-decoration","underline");

  defaultMonths();
}

function defaultMonths(){
  //select something as default
  // let d1 = new Date().getTime();
  // let d2 = new Date().getTime() + 1000*3600*24*30; //add a month
  // $('#start-date')[0].value = new Date(d1).toISOString().substring(0,7);
  // $('#end-date')[0].value = new Date(d2).toISOString().substring(0,7);
  // let s = +$('#start-date')[0].value.split("-")[1];
  // let e = +$('#end-date')[0].value.split("-")[1];
  // MONTHCODE = e;
  // DURATIONCODE = e - s + 1;
}

function upDateMonths(o){
  svg = d3.select("svg#chart");
  width = +svg.attr("width") - margin.left - margin.right;

  dataExtents = d3.extent(o.data, function(d){return d;});
  tenYrAvg = o.avg;

  svgStart = new Date(o.start-1, 5, 1);
  svgEnd = new Date(o.start+9, 8, 1);
  var x = d3.scaleTime()
      .rangeRound([0, width])
      .domain([svgStart,svgEnd]);
  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);
  var ymm = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]*25.4]);

  //title
  d3.selectAll("text.title")
    .text(o.title);

  //yaxis
  d3.selectAll("g.yaxis")
    .transition().duration(1000)
    .call(d3.axisLeft(y).ticks(4));

  d3.selectAll("g.yaxis-mm")
    .transition().duration(1000)
    .call(d3.axisRight(ymm).ticks(4));

  //draw bars
  let rel = $("#threshold-relation")[0].value;
  let pct = $("#threshold-percent")[0].value;
  let avg = $("#threshold-average")[0].value;
  let ro = threshRelationObj[rel];
  let n = 1 + threshPercentObj[pct].val*threshAverageObj[avg].val;

  let barWidth = width*0.5/10;
  d3.selectAll("g.bars")
    .selectAll("rect")
    .data(o.data)
    .transition().duration(1000)
    .attr("y",d => y(d))
    .attr("height",d => height - y(d) + 1)
    .attr("fill",d => d >= o.avg*n ? ro.caFill : ro.cbFill)
    .attr("stroke",d => d >= o.avg*n ? ro.caStroke : ro.cbStroke)
    .attr("stroke-dasharray",d => `${barWidth + height - y(d) + 1},${barWidth}`)
    .attr("opacity",1);

  //xaxis
  d3.selectAll("g.xaxis")
    .transition().duration(1000)
    .call(d3.axisBottom(x).ticks(9));

  d3.selectAll("line.tenYrAvg")
    .transition().duration(1000)
    .attr("y1",function(d){return y(o.avg);})
    .attr("y2",function(d){return y(o.avg);})
    .attr("opacity",1);
}

function changeThreshold(){
  let rel = $("#threshold-relation")[0].value;
  let pct = $("#threshold-percent")[0].value;
  let avg = $("#threshold-average")[0].value;
  let ro = threshRelationObj[rel];
  let n = 1 + threshPercentObj[pct].val*threshAverageObj[avg].val;

  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);

  d3.selectAll("g.bars")
    .selectAll("rect")
    .transition().duration(1000)
    .attr("fill", d => d >= tenYrAvg*n ? ro.caFill : ro.cbFill)
    .attr("stroke", d => d >= tenYrAvg*n ? ro.caStroke : ro.cbStroke);

  d3.selectAll("line.tenYrAvg")
    .transition().duration(1000)
    .attr("y1",function(d){return y(tenYrAvg*n);})
    .attr("y2",function(d){return y(tenYrAvg*n);});
}

function clearChart(){
  svg = d3.select("svg#chart");
  margin = {top: 20, right: 50, bottom: 45, left: 50};
  width = +svg.attr("width") - margin.left - margin.right;

  let o = {start:2008,data:[0,0,0,0,0,0,0,0,0,0],avg:0};
  dataExtents = d3.extent(o.data, function(d){return d;});
  tenYrAvg = o.avg;
  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);
  var ymm = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]*25.4]);

  //yaxis
  d3.selectAll("g.yaxis")
    .transition().duration(1000)
    .call(d3.axisLeft(y).ticks(4));

  d3.selectAll("g.yaxis-mm")
    .transition().duration(1000)
    .call(d3.axisRight(ymm).ticks(4));

  //draw bars
  let barWidth = width*0.5/10;
  d3.selectAll("g.bars")
    .selectAll("rect")
    .data(o.data)
    .transition().duration(1000)
    .attr("y",d => y(d))
    .attr("height",d => height - y(d) + 1)
    .attr("stroke-dasharray", d => `${barWidth},${barWidth}`)
    .attr("opacity",1e-6);

  d3.selectAll("line.tenYrAvg")
    .transition().duration(1000)
    .attr("y1",function(d){return y(o.avg);})
    .attr("y2",function(d){return y(o.avg);})
    .attr("opacity",1e-6);
}

var noaaData;
function calcTenYrP(o = noaaData){
  noaaData = o;
  //go through data object and decide how many
  //times in the past 10 years met the threshold
  let rel = $("#threshold-relation")[0].value;
  let pct = $("#threshold-percent")[0].value;
  let avg = $("#threshold-average")[0].value;
  let rov = threshRelationObj[rel].val;
  let n = 1 + threshPercentObj[pct].val*threshAverageObj[avg].val;

  let l = noaaData.data.length;
  let sum = 0;
  while(l--){
    noaaData.data[l] >= noaaData.avg*n ? sum += 1 : sum += 0;
  }
  //sum * 10 is probability
  if(!rov) sum = 10 - sum;
  $("#ten-yr-prob").html(`<span id="pct-span"> ~${sum*10}% </span> chance of payout`);

  if(sum <= 3 || sum >= 7){
    if(sum <= 3) $('#pct-span').addClass('low-text');
    if(sum >= 7) $('#pct-span').addClass('high-text');
  }else{
    $('#pct-span').removeClass('low-text');
    $('#pct-span').removeClass('high-text');
  }
}

function parseData(results){
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

function shortenTitle(t){
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
