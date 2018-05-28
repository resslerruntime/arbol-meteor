import { Template } from 'meteor/templating';
import * as d3 from "d3";
import topojson from "topojson";
import BN from 'bn.js';
import './body.html';

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
var threshObj = {
  "above-average":{text:"> Average",above:true,val:1,caStroke:"green",caFill:"#b5ffc0",cbStroke:"red",cbFill:"#fcc8b0"}
  ,"above-average-10pct":{text:"> 10% Above Avg",above:true,val:1.1,caStroke:"green",caFill:"#b5ffc0",cbStroke:"red",cbFill:"#fcc8b0"}
  ,"below-average":{text:"< Average",above:false,val:1,caStroke:"red",caFill:"#fcc8b0",cbStroke:"green",cbFill:"#b5ffc0"}
  ,"below-average-10pct":{text:"< 10% Below Avg",above:false,val:0.9,caStroke:"red",caFill:"#fcc8b0",cbStroke:"green",cbFill:"#b5ffc0"}
};
var locationObj = {
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

function thresholdText(num){
  for (var prop in threshObj) {
    let el = threshObj[prop];
    if(parseInt(num)/10000 === el.val) return el.text;
  }
  return "?";
}

//table entry constructor open protections
//event ProposalOffered(uint indexed WITID, uint aboveID, uint belowID, uint indexed weiContributing,  uint indexed weiAsking, address evaluator, uint thresholdPPTTH, bytes32 location, uint start, uint end, bool makeStale);
function Entry(r,owner){
  let a = r.args;
  let l = r.transactionHash.length;
  let s = r.transactionHash.substring(0,8) + "..." + r.transactionHash.substring(l-8,l);
  let d1 = new Date(a.start.c[0]).toISOString().substring(0,7);
  let d2 = new Date(a.end.c[0]).toISOString().substring(0,7);
  let ask = a.weiAsking.toNumber();
  let propose = a.weiContributing.toNumber();
  let id = a.WITID.toNumber();

  //update for if the contract is for offered for sale or for funding
  let sellerContr, buyerContr;
  let b= "", b1 ="";
  let v = toEth(ask)+","+a.WITID.toNumber();
  if(propose > ask){
    sellerContr = toEth(propose);
    buyerContr = toEth(ask);
    b = "Buy";
    b1 = "<button type='button' class='buyit' value='" + v + "'> buy </button>";
  }
  if(propose < ask){
    sellerContr = toEth(ask);
    buyerContr = toEth(propose);
    b = "Sell";
    b1 = "<button type='button' class='sellit' value='" + v + "'> sell </button>";
  }
  //if the current use is the owner of the proposal don't give them the option to purchase the proposal
  if(owner === user[0]){
    b = "Owner";
    b1 = `<button type='button' onClick='alert("You are the owner of this proposal.")'> owner </button>`;
  }

  //get threshold text
  let thresh = thresholdText(a.thresholdPPM.toNumber());
  if(a.WITID.toNumber() === a.belowID.toNumber() && a.thresholdPPM.toNumber() === 10000){
    thresh = threshObj["below-average"].text;
  }

  //create the object
  this.id = a.WITID;
  this.type = "bodyRow";
  this.column = [
       {type:"num",name:id}
      ,{type:"text",name:s}
      ,{type:"text",name:d1}
      ,{type:"text",name:d2}
      ,{type:"num",name:buyerContr}
      ,{type:"num",name:sellerContr}
      ,{type:"text",name:locationText(bytes32ToNumString(a.location))}
      ,{type:"text",name:"Rainfall"}
      ,{type:"text",name:thresh}
      ,{type:"button",name:b,button:b1}
    ];
}

//table entry constructor my protections
//bool if you proposed the protection = true, if you accepted the protection = false
function MyEntry(r,a,id,bool){
  // console.log("fn: MyEntry",id)
  let l = r.transactionHash.length;
  let s = r.transactionHash.substring(0,8) + "..." + r.transactionHash.substring(l-8,l);
  let d1 = new Date(a.start.c[0]).toISOString().substring(0,7);
  let d2 = new Date(a.end.c[0]).toISOString().substring(0,7);
  let ask = a.weiAsking.toNumber();
  let propose = a.weiContributing.toNumber();

  //update for if the contract is offered for sale or for funding
  let sellerContr, buyerContr;
  if(propose < ask){
    sellerContr = toEth(ask);
    buyerContr = toEth(propose);
  }
  if(propose > ask){
    sellerContr = toEth(propose);
    buyerContr = toEth(ask);
  }

  let o;
  if(bool){
    if(propose < ask) o = "you are the <strong>buyer</strong>";
    if(propose > ask) o = "you are the <strong>seller</strong>";
  }else{
    if(propose < ask) o = "you are the <strong>seller</strong>";
    if(propose > ask) o = "you are the <strong>buyer</strong>";
  }

  let status = "";
  let now = new Date().getTime();
  let start = new Date(a.start.c[0]).getTime();
  let end = new Date(a.end.c[0]).getTime();
  let b = "";
  let b1 = "<button type='button' class='action cancelit'> Cancel and Redeem </button>";

  //TODO add in "make stale = false" functionality
  if(r.args !== a){
    if(now < start) status = "Partnered, Waiting to Start";
    if(now >= start && now <= end){
      status = "In Term";
      b1 = "Waiting...";
    }
    if(now > end){
      status = "Waiting for Evaluation";
      b1 = `<button type='button' class='action evaluateit' value=${id}> Evaluate and Complete </button>`;
    }
  }else{
    if(now < start) status = "Open";
    if(now >= start) status = "Stale";
  }

  //get threshold text
  let thresh = thresholdText(a.thresholdPPM.toNumber());
  if(a.WITID.toNumber() === a.belowID.toNumber() && a.thresholdPPM.toNumber() === 10000){
    thresh = threshObj["below-average"].text;
  }

  //create the object
  this.type = "bodyRow";
  this.column = [
       {type:"num",name:id}
      ,{type:"text",name:s}
      ,{type:"text",name:o}
      ,{type:"text",name:d1}
      ,{type:"text",name:d2}
      ,{type:"num",name:buyerContr}
      ,{type:"num",name:sellerContr}
      ,{type:"text",name:locationText(bytes32ToNumString(a.location))}
      ,{type:"text",name:"Rainfall"}
      ,{type:"text",name:thresh}
      ,{type:"text",name:status}
      ,{type:"button",name:b,button:b1}
    ];
}

var user = [-1];
var pastUser = [-2];
var arbolAddress, arbolContract, arbolInstance;
var witAddress, witContract, witInstance;
var noaaAddress;

var acceptedList = [];

//data variables for NOAA calls
let NOAACODE = -1;
let MONTHCODE = -1;
let DURATIONCODE = -1;

if (Meteor.isClient) {
  Meteor.startup(async function() {
    console.log('Meteor.startup');
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.log("web3 from current provider: ", web3.currentProvider.constructor.name)
      // Use Mist/MetaMask's provider
      web3 = new Web3(web3.currentProvider);

      //show relevant content depending on wether web3 is loaded or not
      $('#web3-waiting').hide();
      $("#user").show();
      $("#web3-onload").removeClass("disabled-div");
      Session.set("activeUser","current user:");

      // check for subsequent account activity, lockout screen if no metamask user is signed in
      setInterval(async function(){
        try{
          user = await promisify(cb => web3.eth.getAccounts(cb));
          if(typeof user[0] === "undefined") user = [-1];
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
               s = "current user: " + user[0];
               Session.set("activeUser",s);
               $('#red-text').hide();
               $('#my-wrapper').removeClass('loading');
               $('#my-loader').hide();
            } else {
              s = "current user:";
              Session.set("activeUser",s);
              $('#red-text').show();
              $('#my-loader').show();
              $('#my-wrapper').addClass('loading');
            }
            loadData();
          }
          pastUser = user;
        } catch (error) {
          console.log(error)
        }
      }, 1000);

      //start drawing svg
      drawUSA();
      drawMonths();
    } else {
      console.log('No web3? You should consider trying MetaMask!')
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
      //show relevant content depending on wether web3 is available or not
      $('#web3-waiting').hide();
      $('#no-web3').show();
    }
  });
}

//begin the process of loading all the data
function loadData(){
  console.log("fn: loadData")
  //check for network use correct deployed addresses
  web3.version.getNetwork((err, netId) => {
    console.log("netID",netId)
    switch (netId) {
      case "1":
        console.log('This is mainnet')
        break
      case "2":
        console.log('This is the deprecated Morden test network.')
        break
      case "3":
        console.log('This is the ropsten test network.')
        break
      case "4":
        console.log('This is the Rinkeby test network.')
        // witAddress  = "0xc7452fa89d06effce274410c9a47f3257dd3b4e9";
        // arbolAddress = "0x6b1eb69a46cdb5b58f98cf89c027abc403ef8ef4";
        // noaaAddress = "0x1ff5b606f10e15afef9f4e76ca03533bd2aa8217";
        witAddress  = "0xcf101416e4e572ef1500808ffc25c062f555c605";
        arbolAddress = "0xe3d980eb41a78178adc99d3d520b5c7fe05f17d8";
        noaaAddress = "0xf226b67aa2bcbe28380188f78d3e69012c249f53";

        break
      case "42":
        console.log('This is the Kovan test network.')
        break
      default:
        console.log('This is an unknown network.')
        //ganache-cli
        witAddress  = "0x96ef5ac933b4a16e68651f03fdc0cd4cb2b80204";
        arbolAddress = "0x390e418f238841bae8b7525b14111c2b9bc30452";
        //ganache gui
    }
    arbolContract = web3.eth.contract(ARBOLABI);
    arbolInstance = arbolContract.at(arbolAddress);
    witContract = web3.eth.contract(WITABI);
    witInstance = witContract.at(witAddress);

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

//TODO only add token if it hasn't been accepted
//get all proposals, add new entries as they are created
var watchLatestProposal = -1;
function latestProposals(){
  console.log("fn: latestProposals");
  watchLatestProposal = witInstance.ProposalOffered({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
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
    console.log("===> latest: 'accepted'")
    addAcceptance(result);
  });
}

//get all evaluations
var watchLatestEvaluation = -1;
function latestEvaluations(){
  console.log("fn: latestEvauation")
  //do something as new evaluation is accepted
  watchLatestEvaluation = witInstance.WITEvaluated({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    console.log("===> latest: 'evaluated'")
    console.log(result)
    //update status in "my protections pages"
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
      // if(new Date(result.args.start.c[0]) - new Date() > 0){
      if(true){
        let list = Session.get("openProtectionsData");
        console.log("===> proposal offered, id:",id.toNumber())
        list.push(new Entry(result,owner));
        list = sortArray(list,Session.get("sortIndex"),Session.get("descending"));
        Session.set("openProtectionsData",list);

        //if more than ten items turn on pagination
        if(list.length > 10){
          $("#open-pager-btns").show();
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
    if(owner === user[0]){
      let list = Session.get("myProtectionsData");
      list.push(new MyEntry(result,result.args,id.toNumber(),true));
      list = sortArray(list,Session.get("mySortIndex"),Session.get("descending"));
      list = updateStatus(list,id.toNumber());
      Session.set("myProtectionsData",list);

      //if more than ten items turn on pagination
      if(list.length > 10){
        $("#my-pager-btns").show();
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
  //add to open protections
  let list = Session.get("openProtectionsData");
  let index = findIndex(list,function(el){return el.column[0].name === id;})
  list.splice(index,1);
  list = sortArray(list,Session.get("sortIndex"),Session.get("descending"));
  Session.set("openProtectionsData",list);

  //if more than ten items turn on pagination
  if(list.length <= 10){
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

function updateStatus(list,id){
  //only update status for those that are accepted
  if(acceptedList.indexOf(id) !== -1){
    let index = findIndex(list,function(el){return el.column[0].name === id;});
    if(index !== -1){
      let el = list[index].column;

      let status = "";
      let now = new Date().getTime();
      let start = new Date(el[3].name).getTime();
      let end = new Date(el[4].name).getTime();
      let b1 = "<button type='button' class='action cancelit'> Cancel and Redeem </button>";

      if(now < start) status = "Partnered, Waiting to Start";
      if(now >= start && now <= end){
        status = "In Term";
        b1 = "Waiting...";
      }
      if(now > end){
        status = "Waiting for Evaluation";
        b1 = "<button type='button' class='action evaluateit'> Evaluate and Complete </button>";
      }

      el[10].name = status;
      el[11].button = b1;
    }
  }
  return list;
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
  console.log("fn: addAcceptance")
  try{
    let outerResult = result;
    let idpObj = result.args.WITID;
    let idp = idpObj.toNumber();

    let idObj = result.args.aboveID;
    if(idp === result.args.aboveID.toNumber()) idObj = result.args.belowID;
    let id = idObj.toNumber();

    console.log("===> proposal accepted, id:", id);
    console.log(result)

    //prevent previous tokens from being added to list
    acceptedList.push(idp);
    //if they are already shown remove them
    removeToken(idp);
    //if they were your proposals update your "my protections"
    updateStatus(idp);

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
        if(list.length > 10){
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

////////////////////////////////////////////
// ACTIVE USER
////////////////////////////////////////////
Session.set("activeUser","");

// populate open protections table
Template.user.helpers({
  activeUser: function(){
    return [{name: Session.get("activeUser")}];
  }
});

////////////////////////////////////////////
// FUNCTIONS RELATED TO THE TAB LAYOUT
////////////////////////////////////////////

//instantiate tab layout
ReactiveTabs.createInterface({
  template: 'basicTabs',
  onChange: function (slug, template) {
    // This callback runs every time a tab changes.
    // The `template` instance is unique per {{#basicTabs}} block.
    // console.log('[tabs] Tab has changed! Current tab:', slug);
    // console.log('[tabs] Template instance calling onChange:', template);
  }
});

Template.navigation.helpers({
  tabs: function () {
    // Every tab object MUST have a name and a slug!
    return [
      { name: 'Open Protections', slug: 'open' },
      { name: 'Create a Protection', slug: 'create' },
      { name: 'My Protections', slug: 'mine', onRender: function(slug, template) {
        // Make the call to block chain to get information on protections
      }}
    ];
  },
  activeTab: function () {
    // Use this optional helper to reactively set the active tab.
    // All you have to do is return the slug of the tab.

    // You can set this using an Iron Router param if you want--
    // or a Session variable, or any reactive value from anywhere.

    // If you don't provide an active tab, the first one is selected by default.
    // See the `advanced use` section below to learn about dynamic tabs.
    return Session.get('activeTab'); // Returns "people", "places", or "things".
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
    if(user[0] === -1) alert("Please login to MetaMask buy a proposal.");
    else acceptProposal(e.target.value);
  },
  'click .sellit': function(e){
    if(user[0] === -1) alert("Please login to MetaMask sell a proposal.");
    else acceptProposal(e.target.value);
  },
  'click .evaluateit': function(e){
    evaluateProposal(e.target.value);
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
async function evaluateProposal(id){
  try {
    console.log("====> new WIT evaluation");
    console.log("token ID", id,user[0]);
    console.log(witInstance)
    await promisify(cb => witInstance.evaluate(id,"string",{from: user[0]},cb));
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
      if(t.innerText === "TOKEN NUMBER") colIndex = 0;
      if(t.innerText === "TOKEN HASH") colIndex = 1;
      if(t.innerText === "START") colIndex = 2;
      if(t.innerText === "END") colIndex = 3;
      if(t.innerText === "BUYER CONTRIBUTION (ETH)") colIndex = 4;
      if(t.innerText === "SELLER CONTRIBUTION (ETH)") colIndex = 5;
      if(t.innerText === "LOCATION") colIndex = 6;
      if(t.innerText === "INDEX") colIndex = 7;
      if(t.innerText === "THRESHOLD (%)") colIndex = 8;
      if(t.innerText === "BUY/SELL") colIndex = 9;
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
      if(t.innerText === "BLOCK NUMBER") colIndex = 0;
      if(t.innerText === "TOKEN HASH") colIndex = 1;
      if(t.innerText === "OWNERSHIP") colIndex = 2;
      if(t.innerText === "START") colIndex = 3;
      if(t.innerText === "END") colIndex = 4;
      if(t.innerText === "BUYER CONTRIBUTION (ETH)") colIndex = 5;
      if(t.innerText === "SELLER CONTRIBUTION (ETH)") colIndex = 6;
      if(t.innerText === "LOCATION") colIndex = 7;
      if(t.innerText === "INDEX") colIndex = 8;
      if(t.innerText === "THRESHOLD (%)") colIndex = 9;
      if(t.innerText === "THRESHOLD (%)") colIndex = 10;
      if(t.innerText === "ACTION") colIndex = 11;
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
    if(cell.type === "num") return key = parseFloat(cell.name);
    if(cell.type === "text" || cell.type === "button") return key = cell.name;
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
  },
  'click #open-back'(e){
    if(opPagination > 0) opPagination -= 1;
    let fullList = Session.get("openProtectionsData");
    let pageList = paginateData(fullList,opPagination);
    Session.set("openProtectionsPaginatedData",pageList);
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
  },
  'click #my-back'(e){
    if(myPagination > 0) myPagination -= 1;
    let fullList = Session.get("myProtectionsData");
    let pageList = paginateData(fullList,myPagination);
    Session.set("myProtectionsPaginatedData",pageList);
  }
});

var bin = 10;
function paginateData (array,index) {
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
          {name:"Token Number"}
          ,{name:"Token Hash"}
          ,{name:"Start"}
          ,{name:"End"}
          ,{name:"Buyer Contribution (Eth)"}
          ,{name:"Seller Contribution (Eth)"}
          ,{name:"Location"}
          ,{name:"Index"}
          ,{name:"Threshold (%)"}
          ,{name:"BUY/SELL"}
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

// Dealing with submittal of form
Template.formNewProtection.events({
  'input .date-picker'(event) {
    //TODO uncomment capDate
    // capDate(event.currentTarget);
    //update the data that is represented
    let s = +$('#start-date')[0].value.split("-")[1]
      ,sy = +$('#start-date')[0].value.split("-")[0];
    let e = +$('#end-date')[0].value.split("-")[1]
      ,ey = +$('#end-date')[0].value.split("-")[0];

    if(s <= e && sy <= ey){
      MONTHCODE = e;
      DURATIONCODE = e - s + 1;
      callNOAA();
    }
  },
  'input .contribution'(event) {
    capVal(event.currentTarget);
  },
  'input #start-date'(event){
    $("#start-date").removeClass("missing-info");
  },
  'input #end-date'(event){
    $("#end-date").removeClass("missing-info");
  },
  'input #buyer-contrib'(event){
    $("#buyer-contrib").removeClass("missing-info");
  },
  'input #seller-contrib'(event){
    $("#seller-contrib").removeClass("missing-info");
  },
  'input #threshold'(event) {
    changeThreshold(event.currentTarget.value);
    $("#threshold").removeClass("missing-info");
  },
  'submit .new-protection'(event) {
    console.log(user,pastUser)
    if(user[0] === -1){
      alert("Please login to MetaMask to create a proposal.");
      //prevent form from submitting
      return false;
    }else{
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      const target = event.currentTarget;
      const buyerContr = parseFloat(target[2].value);
      const sellerContr = parseFloat(target[3].value);
      const buySell = target[4].checked ? "Buy" : "Sell";
      const startDate = target[5].value;
      const endDate = target[6].value;
      const threshold = target[7].value;
      const location = target[8].value;

      const index = "Precipitation";

      //TODO add red boxes to indicate missing values
      //check if info is missing
      if(startDate === "" || endDate === "" || parseFloat(buyerContr) === 0 || parseFloat(sellerContr) === 0 || location === "" || index === "" || threshold === ""){
        var s = "Please complete missing elements: \n";
        if(startDate === ""){
          s += "  Start Date \n";
          $("#start-date").addClass("missing-info");
        }
        if(endDate === ""){
          s += "  End Date \n";
          $("#end-date").addClass("missing-info");
        }
        if(parseFloat(buyerContr) === 0){
          s += "  Buyer Contribution \n";
          $("#buyer-contrib").addClass("missing-info");
        }
        if(parseFloat(sellerContr) === 0){
          s += "  Seller Contribution \n";
          $("#seller-contrib").addClass("missing-info");
        }
        if(location === ""){
          s += "  Location \n";
        }
        if(index === "") s += "  Index \n";
        if(threshold === ""){
          s += "  Threshold \n";
          $("#threshold").addClass("missing-info");
        }
        alert(s);
      }else{
        //ask for confirmation
        const confirmed = confirm ( "Please confirm your selection: \n\n"
          + "  Start Date: " + startDate + "\n"
          + "  End Date: " + endDate + "\n"
          + "  Buyer Contribution (Eth): " + buyerContr + "\n"
          + "  Seller Contribution (Eth): " + sellerContr + "\n"
          + "  Location: " + locationObj[location].text + "\n"
          + "  Index: " + index + "\n"
          + "  Threshold: " + threshObj[threshold].text + "\n"
          + "  Buy or Sell: " + buySell + "\n"
        );

        if(confirmed){
          //call back that clears the form
          var clearForm = function(){
            //clear form if succesful
            target[2].value = 0;
            target[3].value = 0;
            target[4].value = "";
            target[5].value = "";
            target[6].value = "";
            target[7].value = "";
            target[8].value = "";
            $('#end-date')[0].min = "";
            $('#start-date')[0].max = "";
            $('#seller-contrib')[0].min = 0;
            $('#payout-amt').html(0);
            //unselect region, reset text value
            clearChart();
            $('#selected-region').html("No region selected");
            document.getElementById("location").selectedIndex = -1;
            d3.selectAll(`path.${selectedRegion}`)
              .attr("fill","none");
            selectedRegion = "none";
            NOAACODE = -1;
            MONTHCODE = -1;
            DURATIONCODE = -1;
          }

          //submit info
          createProposal(startDate,endDate,buyerContr,sellerContr,location,index,threshold,buySell,clearForm);
        }else{
          //let user continue to edit
        }
      }
    }
  }
  // ,
  // 'click #createRandom'(e){
  //   let amt1 = Math.round(Math.random()+1);
  //   let amt2 = Math.round(Math.random()+1);
  //   $('#seller-contrib')[0].value = amt1 + amt2;
  //   $('#buyer-contrib')[0].value = amt1;
  //   $('#payout-amt').html(2*amt1 + amt2);
  //
  //   let amt3 = Math.random()*10000000000;
  //   let amt4 = Math.random()*10000000000;
  //   let amt5 = Math.random()*10000000000;
  //   let amt6 = Math.random()*10000000000;
  //   while((amt3 - amt4) > (amt5 - amt6)){
  //     amt5 = Math.random()*10000000000;
  //     amt6 = Math.random()*10000000000;
  //   }
  //   let d1 = new Date().getTime() + amt3 - amt4;
  //   let d2 = new Date().getTime() + amt5 - amt6;
  //   $('#start-date')[0].value = new Date(d1).toISOString().substring(0,7);
  //   $('#end-date')[0].value = new Date(d2).toISOString().substring(0,7);
  //
  //   let a = Math.ceil(Math.random()*2);
  //   let b = Math.ceil(Math.random()*4);
  //   $('#location option').eq(a).prop('selected', true);
  //   $('#selected-region').html("add name");
  //   $('#index option').eq(1).prop('selected', true);
  //   $('#threshold option').eq(b).prop('selected', true);
  //
  //   // Check
  //   let bool = true;
  //   if(Math.random() > 0.5) bool = false;
  //   $('#toggle-buy-sell').prop("checked", bool);
  //
  //   // call NOAA
  //   let s2 = +$('#start-date')[0].value.split("-")[1]
  //     ,sy2 = +$('#start-date')[0].value.split("-")[0];
  //   let e2 = +$('#end-date')[0].value.split("-")[1]
  //     ,ey2 = +$('#end-date')[0].value.split("-")[0];
  //
  //   if(s2 <= e2 && sy2 <= ey2){
  //     MONTHCODE = e2;
  //     DURATIONCODE = e2 - s2 + 1;
  //     NOAACODE = codesNOAA[a];
  //     callNOAA();
  //   }
  // },
});

async function createProposal(startDate,endDate,buyerContr,sellerContr,location,index,threshold,buySell,clearForm){
  const d1 = (new Date(startDate)).getTime();
  let dd2 = new Date(endDate);
  dd2.setDate(dd2.getDate() + 15);
  const d2 = dd2.getTime();
  console.log(startDate,endDate,new Date(startDate),dd2,d1,d2)

  let ethPropose = 0;
  let ethAsk = 0;

  if(buySell === "Buy"){
    ethPropose = toWei(buyerContr);
    ethAsk = toWei(sellerContr);
  }
  if(buySell === "Sell"){
    ethPropose = toWei(sellerContr);
    ethAsk = toWei(buyerContr);
  }

  try {
    console.log("===== CREATE WIT PROPOSAL =====")
    await promisify(cb => witInstance.createWITProposal(ethPropose, ethAsk, threshObj[threshold].above, noaaAddress, threshObj[threshold].val*10000, numStringToBytes32(locationObj[location].noaaCode), d1, d2, true, {value: ethPropose, from:user[0]}, cb));
    clearForm();
  } catch (error) {
    console.log(error)
  }
}

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

function capVal(target){
  //change properties of the other date picker so that incorrect values can't be chosen
  var num = parseFloat(target.value);
  var step = parseFloat($('#buyer-contrib')[0].step);
  var id = target.id;
  if(id === 'buyer-contrib') $('#seller-contrib')[0].min = Math.round((num + step)/step)*step;
  //show total payout
  let v = Math.round((parseFloat($('#seller-contrib')[0].value) + parseFloat($('#buyer-contrib')[0].value))/step)*step;
  $('#payout-amt').html(v);
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
          {name:"Token Number"}
          ,{name:"Token Hash"}
          ,{name:"Ownership"}
          ,{name:"Start"}
          ,{name:"End"}
          ,{name:"Buyer Contribution (Eth)"}
          ,{name:"Seller Contribution (Eth)"}
          ,{name:"Location"}
          ,{name:"Index"}
          ,{name:"Threshold (%)"}
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
  let svg = d3.select("svg#map");
  let width = +svg.attr("width");
  let height = +svg.attr("height");
  let path = d3.geoPath();

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
        .attr("fill","none")
        .attr("stroke-dasharray", "20,5");
        // .attr("stroke","none")
        // .attr("fill",cols[0])
        // .attr("fill-opacity", 0.5);
    }

    svg.selectAll("g#areas")
      .selectAll("path.ag-areas")
      .on("mouseover",handleMOver)
      .on("mouseout",handleMOut)
      .on("click", handleClick);

    defaultLocation();

    function handleMOver(){
      let v = +d3.select(this).attr("value");
      let region = d3.select(this).attr("class").split(" ")[1];
      if(region !== selectedRegion){
        d3.selectAll(`path.${region}`)
          .attr("fill",locationObj[region].col);
      }
    }

    function handleMOut(){
      let v = +d3.select(this).attr("value");
      let region = d3.select(this).attr("class").split(" ")[1];
      if(region !== selectedRegion){
        d3.selectAll(`path.${region}`)
          .attr("fill","none");
      }
    }

    function handleClick() {
      let v = +d3.select(this).attr("value");
      let region = d3.select(this).attr("class").split(" ")[1];
      //manage the coloration change
      if(region !== selectedRegion){
        //update the title
        $('#selected-region').html(locationObj[region].text);
        //update the form
        document.getElementById("location").value = region;
        //make previous region go blank
        d3.selectAll(`path.${selectedRegion}`)
          .attr("fill","none");

        selectedRegion = region;
        NOAACODE = locationObj[selectedRegion].noaaCode;
        callNOAA();
        d3.selectAll(`path.${selectedRegion}`)
          .attr("fill","yellow");
      }else{
        //update the title
        $('#selected-region').html("No region selected");
        //update the form
        let f = document.getElementById("location").selectedIndex = -1;
        d3.selectAll(`path.${selectedRegion}`)
          .attr("fill",locationObj[selectedRegion].col);
        currentHTTP += 1;
        clearChart();
        selectedRegion = "none";
        NOAACODE = -1;
        if(NOAACODE !== -1 && MONTHCODE !== -1 && DURATIONCODE !== -1) $(".chart-loader").fadeOut(1000);
      }
    }

  }catch(error){
    console.log("Error retrieving NOAA data: ",error);
  }
}

function defaultLocation(){
  let region = selectedRegion = "us-corn-belt";
  $('#selected-region').html(locationObj[region].text);
  document.getElementById("location").value = region;
  NOAACODE = locationObj[region].noaaCode;
  d3.selectAll(`path.${region}`)
    .attr("fill","yellow");
  callNOAA();
}

function callNOAA(){
  // $(".chart-loader-div").addClass("chart-loader");
  $(".chart-loader").fadeIn(500);
  currentHTTP += 1;
  let check = currentHTTP;
  if(NOAACODE !== -1 && MONTHCODE !== -1 && DURATIONCODE !== -1){
    console.log(NOAACODE,MONTHCODE,DURATIONCODE)
    Meteor.call("glanceNOAA",NOAACODE,MONTHCODE,DURATIONCODE,function(error, results) {
      let obj = parseData(results);
      if(check === currentHTTP){
        upDateMonths(obj);
        // $(".chart-loader-div").removeClass("chart-loader");
        $(".chart-loader").fadeOut(1000);
      }
    });
  }
}

var svg, margin, width, height;
var dataExtents, svgStart, svgEnd;
var tenYrAvg;

function drawMonths(){
  svg = d3.select("svg#chart");
  margin = {top: 20, right: 50, bottom: 45, left: 50};
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

    defaultMonths();
}

function defaultMonths(){
  //select something as default
  let d1 = new Date().getTime();
  let d2 = new Date().getTime() + 1000*3600*24*30; //add a month
  $('#start-date')[0].value = new Date(d1).toISOString().substring(0,7);
  $('#end-date')[0].value = new Date(d2).toISOString().substring(0,7);
  let s = +$('#start-date')[0].value.split("-")[1];
  let e = +$('#end-date')[0].value.split("-")[1];
  MONTHCODE = e;
  DURATIONCODE = e - s + 1;
}

function upDateMonths(o){
  // console.log(o)
  svg = d3.select("svg#chart");
  margin = {top: 20, right: 50, bottom: 45, left: 50};
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

  //yaxis
  d3.selectAll("g.yaxis")
    .transition().duration(1000)
    .call(d3.axisLeft(y).ticks(4));

  d3.selectAll("g.yaxis-mm")
    .transition().duration(1000)
    .call(d3.axisRight(ymm).ticks(4));

  //draw bars
  let vs = $("#threshold")[0].value;
  if(vs === "") vs = "above-average";
  let to = threshObj[vs];
  let barWidth = width*0.5/10;
  d3.selectAll("g.bars")
    .selectAll("rect")
    .data(o.data)
    .transition().duration(1000)
    .attr("y",d => y(d))
    .attr("height",d => height - y(d) + 1)
    .attr("fill",d => d >= o.avg*to.val ? to.caFill : to.cbFill)
    .attr("stroke",d => d >= o.avg*to.val ? to.caStroke : to.cbStroke)
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

function changeThreshold(vs){
  let o = threshObj[vs];

  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,dataExtents[1]]);

  d3.selectAll("g.bars")
    .selectAll("rect")
    .transition().duration(1000)
    .attr("fill", d => d >= tenYrAvg*o.val ? o.caFill : o.cbFill)
    .attr("stroke", d => d >= tenYrAvg*o.val ? o.caStroke : o.cbStroke);

  d3.selectAll("line.tenYrAvg")
    .transition().duration(1000)
    .attr("y1",function(d){return y(tenYrAvg*o.val);})
    .attr("y2",function(d){return y(tenYrAvg*o.val);});
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

function parseData(results){
  let string = results.content;
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
  return {start:parseInt(a2[a2.length-1][0]),data:a3,avg:sum/10};
}
