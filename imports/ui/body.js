import { Template } from 'meteor/templating';
import * as d3 from "d3";
import topojson from "topojson";
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

//table entry constructor open protections
function Entry(r){
  let a = r.args;
  let l = r.transactionHash.length;
  let s = r.transactionHash.substring(0,8) + "..." + r.transactionHash.substring(l-8,l)
  let d1 = new Date(a.start.c[0]).toISOString().substring(0,10);
  let d2 = new Date(a.end.c[0]).toISOString().substring(0,10);
  let ask = a.weiAsking.toNumber();
  let propose = a.weiContributing.toNumber();

  //update for if the contract is for offered for sale or for funding
  let b, b1;
  let sellerContr, buyerContr;
  let v = toEth(ask)+","+a.tokenID.toNumber();
  if(propose > ask){
    b = "Buy";
    b1 = "<button type='button' class='buyit' value='" + v + "'> buy </button>";
    sellerContr = toEth(propose);
    buyerContr = toEth(ask);
  }
  if(propose < ask){
    b = "Sell";
    b1 = "<button type='button' class='sellit' value='" + v + "'> sell </button>";
    sellerContr = toEth(ask);
    buyerContr = toEth(propose);
  }

  //create the object
  this.id = a.tokenID;
  this.type = "bodyRow";
  this.column = [
       {type:"num",name:a.tokenID.c[0]}
      ,{type:"text",name:s}
      ,{type:"text",name:d1}
      ,{type:"text",name:d2}
      ,{type:"num",name:buyerContr}
      ,{type:"num",name:sellerContr}
      ,{type:"text",name:a.location}
      ,{type:"text",name:a.index}
      ,{type:"num",name:a.threshold}
      ,{type:"button",name:b,button:b1}
    ];
}

//table entry constructor my protections
//bool if you proposed the protection = true, if you accepted the protection = false
function MyEntry(r,a,id,bool){
  // console.log("fn: MyEntry",id)
  let l = r.transactionHash.length;
  let s = r.transactionHash.substring(0,8) + "..." + r.transactionHash.substring(l-8,l);
  let d1 = new Date(a.start.c[0]).toISOString().substring(0,10);
  let d2 = new Date(a.end.c[0]).toISOString().substring(0,10);
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
  let b1 = "<button type='button' class='action'> Cancel and Redeem </button>";

  if(r.args !== a){
    if(now < start) status = "Partnered, Waiting to Start";
    if(now >= start && now <= end){
      status = "In Term";
      b1 = "Waiting...";
    }
    if(now > end){
      status = "Waiting for Evaluation";
      b1 = "<button type='button' class='action'> Evaluate and Complete </button>";
    }
  }else{
    if(now < start) status = "Open";
    if(now >= start) status = "Stale";
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
      ,{type:"text",name:a.location}
      ,{type:"text",name:a.index}
      ,{type:"num",name:a.threshold}
      ,{type:"text",name:status}
      ,{type:"button",name:b,button:b1}
    ];
}

const witAddress  = "0xf25186b5081ff5ce73482ad761db0eb0d25abfbf";
const cropAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";
const testUser    = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
const testUser2   = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

var user;
var pastUser = -1;
var cropContract;
var cropInstance;
var witContract;
var witInstance;

var latestToken = -1;
var lastToken;
var acceptedList = [];

//data variables for NOAA calls
let NOAACODE = 261;
let MONTHCODE = 1;
let DURATIONCODE = 1;

if (Meteor.isClient) {
  Meteor.startup(async function() {
    console.log('Meteor.startup');
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.log("web3 from current provider: ",web3.currentProvider.constructor.name)
      // Use Mist/MetaMask's provider
      web3js = new Web3(web3.currentProvider);

      //show relevant content depending on wether web3 is loaded or not
      $('#web3-waiting').hide();
      $('#web3-onload').show();

      //initialize web3 contracts
      Session.set("activeUser","current user: no current user- log into metamask");
      resetSessionVars();

      // check for subsequent account activity, lockout screen if no metamask user is signed in
      setInterval(async function(){
        try{
          user = await promisify(cb => web3.eth.getAccounts(cb));
          if(user[0] !== pastUser[0]){
            console.log("_-_-_- CHANGE IN USER _-_-_-")
            let s;
            if(user[0]){
               s = "current user: " + user[0];
               Session.set("activeUser",s);
               $("#web3-onload").removeClass("disabled-div");
               loadData();
            } else {
              s = "current user: no current user- log into metamask";
              Session.set("activeUser",s);
              $("#web3-onload").addClass("disabled-div");
              $('.loader').show();
              $('.wrapper').addClass('loading');
              $('#open-pager-btns').hide();
              $('#my-pager-btns').hide();
              resetSessionVars();
              resetGlobalVariables();
            }
          }
          pastUser = user;
        } catch (error) {
          console.log(error)
          alert("User information was not loaded succesfully: " + error.message);
        }
      }, 1000);

      //start drawing svg
      drawUSA();
      drawMonths();
    } else {
      console.log('No web3? You should consider trying MetaMask!')
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
      //show relevant content depending on wether web3 is available or not
      $('#web3-waiting').hide();
      $('#no-web3').show();
    }
    // Now you can start your app & access web3 freely:
  });

  // Template.body.onCreated(function() {
  //   console.log('Template.body.onCreated');
  // });

  // Template.body.helpers({
  //   currentTemplate: function() {
  //     return Session.get('curTemplate');
  //   },
  // });
}

//begin the process of loading all the data
function loadData(){
  //check for network use correct deployed addresses
  web3.version.getNetwork((err, netId) => {
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
        break
      case "42":
        console.log('This is the Kovan test network.')
        break
      default:
        console.log('This is an unknown network.')
    }
  })

  cropContract = web3.eth.contract(CROPABI);
  cropInstance = cropContract.at(cropAddress);
  witContract = web3js.eth.contract(WITABI);
  witInstance = witContract.at(witAddress);

  //populate lists
  latestProposals();
  latestAcceptances();
}

function resetGlobalVariables(){
  opPagination = 0;
  myPagination = 0;
  latestToken = -1;
  lastToken = -1;
  acceptedList = [];
  let fst = $('#first-token-filter');
  let lst = $('#last-token-filter');
  fst.addClass('fresh');
  lst.addClass('fresh');
  watchLatestProposal.stopWatching();
  watchLatestAcceptance.stopWatching();
}

//get the token ID for the latest protection
//add new entries as they are created
var watchLatestProposal = -1;
function latestProposals(){
  console.log("fn: latestProposals");
  watchLatestProposal = witInstance.ProposalOffered(Session.get("filterCriteria"),{fromBlock: 'latest', toBlock: 'latest'}).watch(function(error, result){
    let id = result.args.tokenID.toNumber();
    startTraverse(id,function(){
      console.log("===> latest: 'offered', id:",id,latestToken,id !== latestToken);
      addToken(result);
      // checkProposal(result);
    });
  });
}

//get the token ID for the latest acceptance
//add new acceptances to myProposals as they are created and remove from open proposals
var watchLatestAcceptance = -1;
function latestAcceptances(){
  //do something as new proposal is accepted
  watchLatestAcceptance = witInstance.ProposalAccepted({},{fromBlock: 'latest', toBlock: 'latest'}).watch(function(error, result){
    let id = result.args.tokenIDAccepter.toNumber();
    let idp = result.args.tokenIDProposer.toNumber();
    startTraverse(id,function(){
      console.log("===> latest: 'accepted', id:",id)
      addAcceptance(result);

    });
    if(latestToken != -1){
      removeToken(idp);
      // updateStatus(idp);
    }
  });
}

function startTraverse(id,cb){
  if(id !== latestToken){
    $('.loader').hide();
    $('.wrapper').removeClass('loading');
    latestToken = id;

    //execute callback from latest __ function
    cb();

    //deal with token ID filtering
    let fst = $('#first-token-filter');
    let lst = $('#last-token-filter');
    if(fst.hasClass('fresh')){
      lastToken = latestToken
      fst.val(latestToken);
      lst.val(latestToken);
      fst.removeClass('fresh');
      lst.removeClass('fresh');
      opPagination = 0;
      pastProtections();
    }else{
      let lv = lst.val();
      if(latestToken > lv) lst.val(latestToken);
    }
    capToken();
  }
}

//populate open protections with open proposals
//only get data as necessary, used recursively
var watchProposal = -1;
var watchAcceptance = -1;
function pastProtections(){
 console.log("++++++++++++++++++++++++++++")
  console.log("fn: pastProtections",lastToken-1)
  let thisToken = lastToken - 1;
  if(thisToken > 0){
    //check to see if current ID is an open protection
    let f = Session.get("filterCriteria");
    f.tokenID = thisToken;
    if(watchProposal !== -1) watchProposal.stopWatching();
    watchProposal = witInstance.ProposalOffered(f,{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
      lastToken = thisToken;
      //only add token if it hasn't been accepted
      addToken(result);
      $('#first-token-filter').val(thisToken);
      capToken();
      //are we at the end of the list?
      managePage(thisToken);
    });

    //check to see if current ID is an accepted protection
    let e = {tokenIDAccepter:thisToken};
    if(watchAcceptance !== -1) watchAcceptance.stopWatching();
    watchAcceptance = witInstance.ProposalAccepted(e,{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
      lastToken = thisToken;
      //add previously accepted protections to myProtections
      addAcceptance(result);

      //continue traverse
      managePage(thisToken)
    });
  }
  if(thisToken === 0){
    console.log("clear watch events");
    //clear watch events
    if(watchAcceptance !== -1) watchAcceptance.stopWatching();
    if(watchProposal !== -1) watchProposal.stopWatching();
  }
}

//have you loaded enough data for the current page?
function managePage(thisToken){
  let l = Session.get("openProtectionsData").length;
  let ll = Session.get("myProtectionsData").length;
  if(l >= bin && thisToken > 1){
    $('#open-pager-btns').show();
  }
  if(l < bin){
    $('#open-pager-btns').hide();
  }
  if(ll >= bin && thisToken > 1){
    $('#my-pager-btns').show();
  }
  if(ll < bin){
    $('#my-pager-btns').hide();
  }
  if(l < bin*(1+opPagination) || ll < bin*(1+myPagination)){
    pastProtections();
  }else{
    watchAcceptance.stopWatching();
    watchProposal.stopWatching();
  }
}

//limit the token filter that can be used
function capToken(){
  $('#last-token-filter')[0].min = $('#first-token-filter').val();
  $('#last-token-filter')[0].max = latestToken;
  $('#first-token-filter')[0].min = 1;
  $('#first-token-filter')[0].max = $('#last-token-filter').val();
}

//check token, debug function
async function checkProposal(result){
  console.log("===> new proposal created",result)
  try{
    let supply = await promisify(cb => witInstance.totalSupply(cb));
    let afterBalance = await promisify(cb => web3.eth.getBalance(witAddress, cb));
    afterBalance = toEth(afterBalance.toNumber())
    let propose = toEth(result.args.weiContributing.toNumber());
    console.log("WIT supply",supply.toNumber())
    console.log("afterBalance",afterBalance)
    console.log("afterBalance-ethPropose === beforeBalance",afterBalance-propose)
  }catch(error){

  }
}

//check acceptance
async function checkAcceptance(result){
  console.log("===> new acceptance",result)
  try{
    let supply2 = await promisify(cb => witInstance.totalSupply(cb));
    let afterBalance = await promisify(cb => web3.eth.getBalance(witAddress, cb));
    let owner2 = await promisify(cb => witInstance.ownerOf(supply2.toNumber(), cb));

    console.log("supply",supply2.toNumber())
    console.log("afterBalance2",afterBalance.toNumber())
    // console.log("afterBalance2-ethAsk === beforeBalance2",afterBalance.toNumber()-ask)
    console.log("owner",owner2,testUser2)
  }catch(error){

  }
}

//check transfer, debug function
async function checkTransfer(){
  witInstance.Transfer({},{fromBlock: 'latest', toBlock: 'latest'}).watch(async function(error, result){
    if(result.event === "Transfer"){
      console.log("===> transfer",result)
      try{
        let afterAllowance = await promisify(cb => cropInstance.allowance(user[0],witAddress,cb));
        let ask = toEth(result.args.weiAsking.toNumber());
        let propose = toEth(result.args.weiContributing.c[0]);
        console.log("after allowance: ",afterAllowance.toNumber(),propose + ask)
      }catch(error){

      }
    }
  });
}

//add token to list
async function addToken(result){
  let id = result.args.tokenID;

  if(acceptedList.indexOf(id.toNumber()) === -1){
    //TODO reinstate date filter
    //only show entries whose starting dates haven't passed
    //if(new Date(result.args.start.c[0]) - new Date() > 0){
    if(true){
      //add to open protections
      let list = Session.get("openProtectionsData");
      console.log("===> proposal offered, id:",id.toNumber())
      list.push(new Entry(result));
      list = sortArray(list,Session.get("sortIndex"),Session.get("descending"));
      Session.set("openProtectionsData",list);
      let pageList = paginateData(list,opPagination);
      if(pageList.length > 0){
        Session.set("openProtectionsPaginatedData",pageList);
      }else{
        if(opPagination > 0) opPagination -= 1;
      }
    }
  }

  //add to my protections
  try{
    let owner = await promisify(cb => witInstance.ownerOf(id, cb));
    if(owner === user[0]){
      let list = Session.get("myProtectionsData");
      list.push(new MyEntry(result,result.args,id.toNumber(),true));
      list = sortArray(list,Session.get("mySortIndex"),Session.get("descending"));
      list = updateStatus(list,id.toNumber());
      Session.set("myProtectionsData",list);
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
      let b1 = "<button type='button' class='action'> Cancel and Redeem </button>";

      if(now < start) status = "Partnered, Waiting to Start";
      if(now >= start && now <= end){
        status = "In Term";
        b1 = "Waiting...";
      }
      if(now > end){
        status = "Waiting for Evaluation";
        b1 = "<button type='button' class='action'> Evaluate and Complete </button>";
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
  try{
    let outerResult = result;
    let idObj = result.args.tokenIDAccepter;
    let idpObj = result.args.tokenIDProposer;
    let id = idObj.toNumber();
    let idp = idpObj.toNumber();

    //prevent previous tokens from being added to list
    acceptedList.push(idp);

    let owner = await promisify(cb => witInstance.ownerOf(idObj, cb));
    if(owner === user[0]){
      //get contract information for associated proposal
      witInstance.ProposalOffered({tokenID:idpObj},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
        console.log("===> proposal accepted, id:",id)
        let list = Session.get("myProtectionsData");
        list.push(new MyEntry(outerResult,result.args,id,false));
        list = sortArray(list,Session.get("mySortIndex"),Session.get("descending"));
        Session.set("myProtectionsData",list);
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
    alert("My Protections data failed to load: " + error.message);
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
  'click .action': function(e){
    alert("action");
  },
  'click .buyit': function(e){
    acceptProposal(e.target.value);
  },
  'click .sellit': function(e){
    acceptProposal(e.target.value);
  }
});

async function acceptProposal(v){
  let vals = v.split(",");
  let ethAsk = vals[0]
  let id = vals[1];

  try {
    let supply = await promisify(cb => witInstance.totalSupply(cb));
    let owner = await promisify(cb => witInstance.ownerOf(id, cb));
    let beforeBalance = await promisify(cb => web3.eth.getBalance(witAddress,cb));
    beforeBalance = toEth(beforeBalance.toNumber());

    console.log("====> new WIT acceptance");
    console.log("WIT Balance (beforeBalance): ",beforeBalance);
    console.log("owner",user[0],owner);
    console.log("supply",supply.toNumber());
    console.log("ethAsk", ethAsk);
    console.log("proposal token ID", id);
    //TODO don't let user accept their own proposal

    await promisify(cb => witInstance.createWITAcceptance(id,{from: user[0], value:toWei(ethAsk)},cb));
  } catch (error) {
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
    console.log("forward")
    opPagination += 1;
    let fv = $('#first-token-filter').val();
    let list = Session.get("openProtectionsData");
    let l = list.length;
    if(fv > 1 && l < (opPagination+1)*bin){
      pastProtections();
    }else{
      Session.set("openProtectionsData",list);
      let pageList = paginateData(list,opPagination);
      if(pageList.length > 0) Session.set("openProtectionsPaginatedData",pageList);
      else if(opPagination > 0) opPagination -= 1;
    }
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
    console.log(myPagination)
    myPagination += 1;
    let fv = $('#first-token-filter').val();
    let list = Session.get("myProtectionsData");
    let l = list.length;
    if(fv > 1 && l < (myPagination+1)*bin){
      pastProtections();
    }else{
      Session.set("myProtectionsData",list);
      let pageList = paginateData(list,myPagination);
      if(pageList.length > 0) Session.set("myProtectionsPaginatedData",pageList);
      else if(myPagination > 0) myPagination -= 1;
    }
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
// FUNCTIONS RELATED TO FILTERING
////////////////////////////////////////////

// input for filter
Template.filter.helpers({
  filterInput: function() {
    return [
      {
        title: "Buyer Contribution (Eth):"
        ,tooltiptext: "The amount of Eth contributed by the contract buyer."
        ,type: "number"
        ,name: "buyer"
        ,id: "buyer-filter"
      }
      ,{
        title: "Seller Contribution (Eth):"
        ,tooltiptext: "The amount of Eth contributed by the contract seller."
        ,type: "number"
        ,name: "seller"
        ,id: "seller-filter"
      }
    ];
  }
});

Template.elFilter.helpers({
  isEqual: function (a, b) {
    return a === b;
  }
});

// Dealing with submittal of form
//TODO this doesn't react properly anymore, does it need to call another function?
//we need to purge filtered data list and start again?
//maybe we need separate lists one for any sort of filter other than token ID, which gets purged etc...
Template.filter.events({
  // 'input .filter'(event) {
  //   let a = $('#buyer-filter')[0].value;
  //   let b = $('#seller-filter')[0].value;
  //   let obj = {};
  //   if(a > 0) obj.weiAsking = parseInt(a);
  //   if(b > 0) obj.weiContributing = parseInt(b);
  //   Session.set("filterCriteria",obj);
  //   witInstance.ProposalOffered(obj,{fromBlock: 0, toBlock: 'latest'}).get(function(error, result){
  //     console.log("here",result);
  //     let list = [], l = result.length;
  //     for(var i = 0; i < l; i++){
  //       list.push(new Entry(result[i]));
  //     }
  //     Session.set("openProtectionsData",list);
  //     opPagination = 0;
  //     let pageList = paginateData(list,0);
  //     Session.set("openProtectionsPaginatedData",pageList);
  //   });
  // }
});

// input for filter
Template.tokens.helpers({
  tokensInput: function() {
    return [
      {
        title: "First Token:"
        ,tooltiptext: "First token for loaded data range."
        ,type: "number"
        ,name: "first-token"
        ,id: "first-token-filter"
      }
      ,{
        title: "Last Token:"
        ,tooltiptext: "Last token for loaded data range."
        ,type: "number"
        ,name: "last-token"
        ,id: "last-token-filter"
      }
    ];
  }
});

Template.elTokens.helpers({
  isEqual: function (a, b) {
    return a === b;
  }
});

// Dealing with submittal of form
Template.tokens.events({
  // 'input .tokens'(event) {
    // let a = $('#buyer-filter')[0].value;
    // let b = $('#seller-filter')[0].value;
    // let obj = {};
    // if(a > 0) obj.weiAsking = parseInt(a);
    // if(b > 0) obj.weiContributing = parseInt(b);
    // Session.set("filterCriteria",obj);
    // witInstance.ProposalOffered(obj,{fromBlock: 0, toBlock: 'latest'}).get(function(error, result){
    //   let list = [], l = result.length;
    //   for(var i = 0; i < l; i++){
    //     if(result[i].event === "ProposalOffered"){
    //       list.push(new Entry(result[i]));
    //     }
    //   }
    //   Session.set("openProtectionsData",list);
    //   opPagination = 0;
    //   let pageList = paginateData(list,0);
    //   Session.set("openProtectionsPaginatedData",pageList);
    // });
  // }
});

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

Template.formNewProtection.events({
  'click #createRandom': function(e){
    let amt1 = Math.round(Math.random()+1);
    let amt2 = Math.round(Math.random()+1);
    $('#seller-contrib')[0].value = amt1 + amt2;
    $('#buyer-contrib')[0].value = amt1;
    $('#payout-amt').html(2*amt1 + amt2);

    let amt3 = Math.random()*10000000000;
    let amt4 = Math.random()*10000000000;
    let amt5 = Math.random()*10000000000;
    let amt6 = Math.random()*10000000000;
    while((amt3 - amt4) > (amt5 - amt6)){
      amt5 = Math.random()*10000000000;
      amt6 = Math.random()*10000000000;
    }
    let d1 = new Date().getTime() + amt3 - amt4;
    let d2 = new Date().getTime() + amt5 - amt6;
    $('#start-date')[0].value = new Date(d1).toISOString().substring(0,10);
    $('#end-date')[0].value = new Date(d2).toISOString().substring(0,10);

    let a = Math.ceil(Math.random()*5);
    let b = Math.ceil(Math.random()*3);
    $('#location option').eq(a).prop('selected', true);
    $('#index option').eq(1).prop('selected', true);
    $('#threshold option').eq(b).prop('selected', true);

    // Check #x
    let bool = true;
    if(Math.random() > 0.5) bool = false;
    $('#toggle-buy-sell').prop("checked", bool);
  }
});

// populate new protections form with table
Template.formNewProtection.helpers({
  formNewProtection: function() {
    return [
      {
        title: "Buyer Contribution (Eth):"
        ,tooltiptext: "The amount of Eth contributed by the contract buyer."
        ,type: "number"
        ,name: "buyer"
        ,id: "buyer-contrib"
      }
      ,{
        title: "Seller Contribution (Eth):"
        ,tooltiptext: "The amount of Eth contributed by the contract seller."
        ,type: "number"
        ,name: "seller"
        ,id: "seller-contrib"
      }
      ,{
        title: "Total Payout (Eth):"
        ,tooltiptext: "The total amount of payout received by one of the parties when the outcome is evaluated."
        ,type: "payout"
        ,id: "payout-amt"
      }
      ,{
        title: " Do you want to buy or sell?"
        ,tooltiptext: "Are you offering to sell this protection or are you looking to buy this protection?"
        ,type: "toggle"
        ,id: "toggle-buy-sell"
      }
    ];
  }
});

//TODO add min date back in after testing status
Template.elNewProtection.helpers({
  minDate: function() {
    // return new Date().toISOString().substring(0,10);
  },
  isEqual: function (a, b) {
    return a === b;
  }
});

// Dealing with submittal of form
Template.formNewProtection.events({
  'input .date-picker'(event) {
    capDate(event.currentTarget);
    //update the data that is represented
    let s = +$('#start-date')[0].value.split("-")[1];
    let e = +$('#end-date')[0].value.split("-")[1];
    if(s <= e){
      MONTHCODE = s;
      DURATIONCODE = e - s + 1;
      currentHTTP += 1;
      let check = currentHTTP;
      console.log(s,e,NOAACODE,MONTHCODE,DURATIONCODE)
      Meteor.call("glanceNOAA",NOAACODE,MONTHCODE,DURATIONCODE,function(error, results) {
        let obj = parseData(results);
        if(check === currentHTTP) upDateMonths(obj);
      });
    }
  },
  'input .contribution'(event) {
    capVal(event.currentTarget);
  },
  'submit .new-protection'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.currentTarget;
    const startDate = target[1].value;
    const endDate = target[2].value;
    const buyerContr = parseInt(target[3].value);
    const sellerContr = parseInt(target[4].value);
    const location = target[5].value;
    const threshold = target[7].value;
    const buySell = target[8].checked ? "Buy" : "Sell";
    const index = "rainfall";

    //check if info is missing
    if(startDate === "" || endDate === "" || parseFloat(buyerContr) === 0 || parseFloat(sellerContr) === 0 || location === "" || index === "" || threshold === ""){
      var s = "Please complete form: \n";
      if(startDate === "") s += "  Start Date \n";
      if(endDate === "") s += "  End Date \n";
      if(parseFloat(buyerContr) === 0) s += "  Buyer Contribution \n";
      if(parseFloat(sellerContr) === 0) s += "  Seller Contribution \n";
      if(location === "") s += "  Location Date \n";
      if(index === "") s += "  Index Date \n";
      if(threshold === "") s += "  Threshold Date \n";
      alert(s);
    }else{
      //ask for confirmation
      const confirmed = confirm ( "Please confirm your selection: \n\n"
        + "  Start Date: " + startDate + "\n"
        + "  End Date: " + endDate + "\n"
        + "  Buyer Contribution (Eth): " + buyerContr + "\n"
        + "  Seller Contribution (Eth): " + sellerContr + "\n"
        + "  Location: " + location + "\n"
        + "  Index: " + index + "\n"
        + "  Threshold: " + threshold + "\n"
        + "  Buy or Sell: " + buySell + "\n"
      );

      if(confirmed){
        //submit info
        createProposal(startDate,endDate,buyerContr,sellerContr,location,index,threshold,buySell);
      }else{
        //let user continue to edit
      }

      async function createProposal(startDate,endDate,buyerContr,sellerContr,location,index,threshold,buySell){
        const d1 = (new Date(startDate)).getTime();
        const d2 = (new Date(endDate)).getTime();

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
          let supply = await promisify(cb => witInstance.totalSupply(cb));
          let beforeBalance = await promisify(cb => web3.eth.getBalance(witAddress, cb));
          beforeBalance = toEth(beforeBalance.toNumber());
          let beforeAllowance = await promisify(cb => cropInstance.allowance(user[0],witAddress,cb));
          await promisify(cb => cropInstance.approve(witAddress, ethPropose + ethAsk, {from: user[0]},cb));
          await promisify(cb => witInstance.createWITProposal(ethPropose, ethAsk, index, threshold, location, d1, d2, true, {value: ethPropose, from:user[0]}, cb));

          console.log("===== CREATE WIT PROPOSAL =====")
          // console.log("before allowance: ",beforeAllowance.toNumber())
          console.log("beforeBalance",beforeBalance)
          console.log("WIT supply",supply.toNumber())

          //clear form if succesful
          target[1].value = "";
          target[2].value = "";
          target[3].value = 0;
          target[4].value = 0;
          target[5].value = "";
          target[6].value = "";
          target[7].value = "";
          target[8].value = "";
          $('#end-date')[0].min = "";
          $('#start-date')[0].max = "";
          $('#seller-contrib')[0].min = 0;
          $('#payout-amt').html(0);
        } catch (error) {
          console.log(error)
          alert("Transaction was not succesful, a common source of errors is insufficient gas. \n " + error.message);
        }
      }
    }
  },
});

function capDate(target){
  //change properties of the other date picker so that incorrect values can't be chosen
  var date = target.value;
  var id = target.id;
  var now = new Date().toISOString().substring(0,10);

  //if start is changed first, then put min on end Date
  if(id === 'start-date'){
    if(date !== "") if(new Date(now) - new Date(date) <= 0) $('#end-date')[0].min = date;
  }
  if(id === 'end-date'){
    if(date !== "") $('#start-date')[0].max = date;
  }
}

function capVal(target){
  //change properties of the other date picker so that incorrect values can't be chosen
  var num = parseInt(target.value);
  var id = target.id;
  if(id === 'buyer-contrib') $('#seller-contrib')[0].min = num + 1;
  //show total payout
  let v = parseInt($('#seller-contrib')[0].value) + parseInt($('#buyer-contrib')[0].value);
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
// NOAA codes:
// Corn                   = 261
// Cotton                 = 265
// Hard Red Winter Wheat  = 255
// Corn and Soybean       = 260
// Soybean                = 262
// Spring Wheat           = 250
// Winter Wheat           = 256

let selectedRegion = "none";
let pv = 0;
let cols = ["blue","red"];
let codesNOAA = [261,262];
let currentHTTP = 0;
async function drawUSA(){
  //<svg id="map" width="500" height="300">
  let svg = d3.select("svg#map");
  let width = +svg.attr("width");
  let height = +svg.attr("height");
  let path = d3.geoPath();

  try{
    let us = await d3.json("USA.json");

    // svg.append("rect")
    //   .attr("width",width)
    //   .attr("height",height)
    //   .attr("fill","white");

    let g = svg.selectAll("g#outline")
      .attr("transform", "scale(" + width/1000 + ")");

    g.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

    g.append("path")
      .attr("fill", "gray")
      .attr("stroke", "black")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width",2)
      .attr("d", path(topojson.feature(us, us.objects.nation)));

    svg.selectAll("g#areas")
      .selectAll("path.ag-areas")
      .on("click", handleClick);

    function handleClick(d, i) {
      let v = +d3.select(this).attr("value");
      //manage the coloration change
      if(this.id !== selectedRegion){
        //update the title
        document.getElementById("selected-region").innerHTML = d3.select(this).attr("name");
        //update the form
        document.getElementById("location").selectedIndex = v;
        d3.select(this).attr("fill","orange")
          .attr("stroke","orange");
        //make previous region go blank
        d3.select(`path#${selectedRegion}`)
          .attr("fill",cols[pv])
          .attr("stroke",cols[pv]);

        currentHTTP += 1;
        let check = currentHTTP;
        NOAACODE = codesNOAA[v];
        Meteor.call("glanceNOAA",NOAACODE,MONTHCODE,DURATIONCODE,function(error, results) {
          let obj = parseData(results);
          if(check === currentHTTP) upDateMonths(obj);
        });
        selectedRegion = this.id;
        pv = v;
      }else{
        //update the title
        document.getElementById("selected-region").innerHTML = "";
        //update the form
        let f = document.getElementById("location").selectedIndex = -1;
        d3.select(`path#${selectedRegion}`)
          .attr("fill",cols[v])
          .attr("stroke",cols[v]);
        currentHTTP += 1;
        upDateMonths({start:2008,data:[0,0,0,0,0,0,0,0,0,0],avg:0});
        selectedRegion = "none";
      }
    }

  }catch(error){
    console.log("Error retrieving NOAA data: ",error);
  }
}

function drawMonths(){
  let svg = d3.select("svg#chart")
    ,margin = {top: 20, right: 20, bottom: 30, left: 50}
    ,width = +svg.attr("width") - margin.left - margin.right
    ,height = +svg.attr("height") - margin.top - margin.bottom;

  var data = [0,0,0,0,0,0,0,0,0,0];
  let tenYrAvg = 0;
  var b = d3.extent(data, function(d){return d;});

  var start = new Date(2007, 5, 1);
  var end = new Date(2017, 5, 1);
  var x = d3.scaleTime()
      .rangeRound([0, width])
      .domain([start,end]);
  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,b[1]]);

  let g = svg.append("g")
    .attr("transform",`translate(${margin.left}+${margin.top})`);

  //yaxis
  g.append("g")
    .call(d3.axisLeft(y).ticks(4))
    .attr("class","yaxis")
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", -70)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Monthly Precipitation (mm)");

  g.selectAll(".yaxis")
    .selectAll(".tick")
    .selectAll("line")
    .attr("x1",width)
    .attr("stroke-width",0.25);

  //draw bars
  let barWidth = 25;
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
    .attr("stroke-width","4");

  //xaxis
  g.append("g")
    .call(d3.axisBottom(x).ticks(9))
    .attr("class","xaxis")
    .attr("transform", `translate(0,${height})`)
    .append("text")
    .attr("fill", "#000")
    .attr("y", 30)
    .attr("x", 200)
    .attr("text-anchor", "end")
    .text("Year (mm)");

  g.append("line")
    .attr("class","tenYrAvg")
    .attr("y1",function(d){return y(tenYrAvg);})
    .attr("y2",function(d){return y(tenYrAvg);})
    .attr("x1",width*0.025)
    .attr("x2",width*0.975)
    .attr("stroke","black")
    .attr("stroke-width",2)
    .attr("stroke-dasharray","4, 4");
}

function upDateMonths(o){
  let svg = d3.select("svg#chart")
    ,margin = {top: 20, right: 20, bottom: 30, left: 50}
    ,width = +svg.attr("width") - margin.left - margin.right
    ,height = +svg.attr("height") - margin.top - margin.bottom;

  var b = d3.extent(o.data, function(d){return d;});

  var start = new Date(o.start-1, 5, 1);
  var end = new Date(o.start+9, 5, 1);
  var x = d3.scaleTime()
      .rangeRound([0, width])
      .domain([start,end]);
  var y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0,b[1]]);

  //yaxis
  d3.selectAll("g.yaxis")
    .transition().duration(1000)
    .call(d3.axisLeft(y).ticks(4));

  //draw bars
  let barWidth = 25;
  d3.selectAll("g.bars")
    .selectAll("rect")
    .data(o.data)
    .transition().duration(1000)
    .attr("y",d => y(d))
    .attr("x",(d,i) => x(new Date(o.start + i, 0, 1)) - barWidth/2)
    .attr("height",d => height - y(d) + 1)
    .attr("fill",d => d >= o.avg ? "#b5ffc0" : "#fcc8b0")
    .attr("stroke",d => d >= o.avg ? "green" : "red");

  //xaxis
  d3.selectAll("g.xaxis")
    .transition().duration(1000)
    .call(d3.axisBottom(x).ticks(9));

  d3.selectAll("line.tenYrAvg")
    .transition().duration(1000)
    .attr("y1",function(d){return y(o.avg);})
    .attr("y2",function(d){return y(o.avg);});
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
