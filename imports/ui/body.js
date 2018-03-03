import { Template } from 'meteor/templating';
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

//table entry constructor
function Entry(r){
  let a = r.args;
  let s = r.transactionHash.substring(0,8) + "...";
  let d1 = new Date(a.start.c[0]).toISOString().substring(0,10);
  let d2 = new Date(a.end.c[0]).toISOString().substring(0,10);

  this.type = "bodyRow";
  this.column = [
      {type:"text",name:s}
      ,{type:"text",name:d1}
      ,{type:"text",name:d2}
      ,{type:"num",name:a.weiContributing.c[0]}
      ,{type:"num",name:a.weiAsking.c[0]}
      ,{type:"text",name:a.location}
      ,{type:"text",name:a.index}
      ,{type:"num",name:a.threshold}
      ,{type:"button",name:"Buy",button:"<button type='button' class='buyit'> buy </button>"}
    ];
}

const witAddress  = "0xf25186b5081ff5ce73482ad761db0eb0d25abfbf";
const cropAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";
const testUser    = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
const testUser2   = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

var user;
var cropContract;
var cropInstance;
var witContract;
var witInstance;

var myEvent;
var myEvent2;

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
      try{
        user = await promisify(cb => web3.eth.getAccounts(cb));
        let s = "current user: " + user[0];
        Session.set("activeUser",s);

      } catch (error) {
        console.log(error)
        alert("User information was not loaded succesfully: " + error.message);
      }
      cropContract = web3.eth.contract(CROPABI);
      cropInstance = cropContract.at(cropAddress);
      witContract = web3js.eth.contract(WITABI);
      witInstance = witContract.at(witAddress);
      //add all entries to the sortable rows
      witInstance.allEvents({fromBlock: 0, toBlock: 'latest'}).get(function(error, result){
        let list = [];
        let l = result.length;
        for(var i = 0; i < l; i++){
          if(result[i].event === "ProposalOffered") list.push(new Entry(result[i]));
        }
        $('.loader').hide();
        $('.wrapper').removeClass('loading');
        Session.set("openProtectionsFilteredData",list);
      });
      //add new entries as they are created
      witInstance.allEvents().watch(function(error, result){
        console.log("===> new proposal created")
        let list = Session.get("openProtectionsFilteredData");
        if(result.event === "ProposalOffered") list.push(new Entry(result));
        Session.set("openProtectionsFilteredData",list);
      });
      // var filter = web3.eth.filter({fromBlock: 0, toBlock: 'latest'});
      // filter.get(function(error, result){ console.log("A",error, result); });
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
Session.set("openProtectionsFullData",[]);
Session.set("openProtectionsFilteredData",[]);
Session.set("myProtectionsFullData",[]);
Session.set("myProtectionsFilteredData",[]);

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
    alert("buy");
  },
  'click .fund': function(e){
    alert("fund");
  }
});

Template.headerRow.onCreated(function(){
  this.descending = new ReactiveVar(false);
});

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
    let d = template.descending.get();

    if(t.parentElement.parentElement.parentElement.id === "openProtections"){
      console.log("sort openProtections")
      array = Session.get("openProtectionsFilteredData");
      //sort array based on the click header
      if(t.innerText === "TOKEN HASH") colIndex = 0;
      if(t.innerText === "TERM (MO)") colIndex = 1;
      if(t.innerText === "PAYOUT (WEI)") colIndex = 2;
      if(t.innerText === "COST (WEI)") colIndex = 3;
      if(t.innerText === "LOCATION") colIndex = 4;
      if(t.innerText === "INDEX") colIndex = 5;
      if(t.innerText === "THRESHOLD (%)") colIndex = 6;
      if(t.innerText === "BUY/FUND") colIndex = 7;
      //set variable to new sorted array
      Session.set("openProtectionsFilteredData",sortArray(array,colIndex,d));
      template.descending.set(!d);
    }
    if(t.parentElement.parentElement.parentElement.id === "myProtections"){
      console.log("sort myProtections")
      array = Session.get("myProtectionsFilteredData");
      //sort array based on the click header
      if(t.innerText === "SELLER") colIndex = 0;
      if(t.innerText === "BUYER") colIndex = 1;
      if(t.innerText === "START") colIndex = 2;
      if(t.innerText === "END") colIndex = 3;
      if(t.innerText === "PAYOUT") colIndex = 4;
      if(t.innerText === "COST") colIndex = 5;
      if(t.innerText === "LOCATION") colIndex = 6;
      if(t.innerText === "INDEX") colIndex = 7;
      if(t.innerText === "THRESHOLD") colIndex = 5;
      if(t.innerText === "STATUS") colIndex = 6;
      if(t.innerText === "ACTION") colIndex = 7;
      sortArray(array,colIndex,d);
      //set variable to new sorted array
      Session.set("myProtectionsFilteredData",sortArray(array,colIndex,d));
      template.descending.set(!d);
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
// FUNCTIONS RELATED TO "OPEN PROTECTIONS"
////////////////////////////////////////////

// //tables should display as loading until data is available
// Template.openProtectionsTable.onCreated(function(){
//   setTimeout(function(){
//     $('.wrapper').removeClass('loading');
//     $('.loader').hide();
//     Session.set("openProtectionsFilteredData",[
//       {
//         type: "bodyRow"
//         ,column: [
//           {type:"text",name:"#123456789"}
//           ,{type:"num",name:"2"}
//           ,{type:"num",name:"2"}
//           ,{type:"num",name:"5"}
//           ,{type:"text",name:"US corn belt"}
//           ,{type:"text",name:"Index"}
//           ,{type:"num",name:"10"}
//           ,{type:"button",name:"Buy",button:"<button type='button' class='buyit'> buy </button>"}
//         ]
//       },
//       {
//         type: "bodyRow"
//         ,column: [
//           {type:"text",name:"#285937365"}
//           ,{type:"num",name:"5"}
//           ,{type:"num",name:"6"}
//           ,{type:"num",name:"2"}
//           ,{type:"text",name:"US corn belt"}
//           ,{type:"text",name:"Index"}
//           ,{type:"num",name:"9"}
//           ,{type:"button",name:"Fund",button:"<button type='button' class='fund'> fund </button>"}
//         ]
//       }
//     ]);
//   }, 500);
// });

// populate open protections table
Template.openProtectionsTable.helpers({
  filterData: function() {
    return [
      {
        type: "headerRow"
        ,column: [
          {name:"Token Hash"}
          ,{name:"Start"}
          ,{name:"End"}
          ,{name:"Payout (wei)"}
          ,{name:"Cost (wei)"}
          ,{name:"Location"}
          ,{name:"Index"}
          ,{name:"Threshold (%)"}
          ,{name:"Buy/Fund"}
        ]
      }
    ];
  },
  headerData: function() {
    return [
      {
        type: "headerRow"
        ,column: [
          {name:"Token Hash"}
          ,{name:"Start"}
          ,{name:"End"}
          ,{name:"Payout (wei)"}
          ,{name:"Cost (wei)"}
          ,{name:"Location"}
          ,{name:"Index"}
          ,{name:"Threshold (%)"}
          ,{name:"Buy/Fund"}
        ]
      }
    ];
  },
  bodyData: function(){
    return Session.get("openProtectionsFilteredData");
  }
});

////////////////////////////////////////////
// FUNCTIONS RELATED TO "CREATE A PROTECTION"
////////////////////////////////////////////

// populate new protections form with table
Template.formNewProtection.helpers({
  formNewProtection: function() {
    return [
      {
        title: "Start Date:"
        ,tooltiptext: "The starting date of the contract."
        ,type: "date"
        ,name: "start-date"
        ,id: "start-date"
      }
      ,{
        title: "End Date:"
        ,tooltiptext: "The ending date of the contract."
        ,type: "date"
        ,name: "end-date"
        ,id: "end-date"
      }
      ,{
        title: "Payout (Wei):"
        ,tooltiptext: "The amount of wei received by the contract buyer if the conditions are met."
        ,type: "number"
        ,name: "payout"
      }
      ,{
        title: "Cost (Wei):"
        ,tooltiptext: "The amount of wei received by the contract seller if the conditions are met."
        ,type: "number"
        ,name: "cost"
      }
      ,{
        title: "Location:"
        ,tooltiptext: "The geographic area covered by the contract."
        ,type: "select"
        ,name: "location"
        ,article: "a"
        ,elOptions:[
          ,{
            value: "us-corn-belt"
            ,text: "US Corn Belt"
          }
          ,{
            value: "india"
            ,text: "India"
          }
          ,{
            value: "canadian-prairies"
            ,text: "Canadian Prairies"
          }
        ]
      }
      ,{
        title: "Index:"
        ,tooltiptext: "The ____."
        ,type: "select"
        ,name: "index"
        ,article: "an"
        ,elOptions:[
          ,{
            value: "rainfall"
            ,text: "Rainfall"
          }
        ]
      }
      ,{
        title: "Threshold:"
        ,tooltiptext: "The amount of deviation required to trigger the outcome of the contract."
        ,type: "select"
        ,name: "threshold"
        ,article: "a"
        ,elOptions:[
          ,{
            value: "10pct"
            ,text: "10% less than average"
          }
          ,{
            value: "15pct"
            ,text: "15% less than average"
          }
        ]
      }
      ,{
        title: "Buy or Sell:"
        ,tooltiptext: "Are you offering to sell this contract or are you looking to buy this contract?"
        ,type: "toggle"
      }
    ];
  }
});

Template.elNewProtection.helpers({
  minDate: function() {
    return new Date().toISOString().substring(0,10);
  },
  isEqual: function (a, b) {
    return a === b;
  }
});

// Dealing with submittal of form
Template.formNewProtection.events({
  'input .date-picker'(event) {
    var target = event.currentTarget;
    capDate(target);
    console.log("input")
  },
  'submit .new-protection'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.currentTarget;
    const startDate = target[0].value;
    const endDate = target[1].value;
    const payout = parseInt(target[2].value);
    const cost = parseInt(target[3].value);
    const location = target[4].value;
    const index = target[5].value;
    const threshold = target[6].value;
    const buySell = target[7].checked ? "Buy" : "Sell";

    //check if info is missing
    if(startDate === "" || endDate === "" || parseFloat(payout) === 0 || parseFloat(cost) === 0 || location === "" || index === "" || threshold === ""){
      var s = "Please complete form: \n";
      if(startDate === "") s += "  Start Date \n";
      if(endDate === "") s += "  End Date \n";
      if(parseFloat(payout) === 0) s += "  Payout Date \n";
      if(parseFloat(cost) === 0) s += "  Cost Date \n";
      if(location === "") s += "  Location Date \n";
      if(index === "") s += "  Index Date \n";
      if(threshold === "") s += "  Threshold Date \n";
      alert(s);
    }else{
      //ask for confirmation
      const confirmed = confirm ( "Please confirm your selection: \n\n"
        + "  Start Date: " + startDate + "\n"
        + "  End Date: " + endDate + "\n"
        + "  Payout (Wei): " + payout + "\n"
        + "  Cost (Wei): " + cost + "\n"
        + "  Location: " + location + "\n"
        + "  Index: " + index + "\n"
        + "  Threshold: " + threshold + "\n"
        + "  Buy or Sell: " + buySell + "\n"
      );

      if(confirmed){
        //submit info
        createProposal(startDate,endDate,payout,cost,location,index,threshold);
      }else{
        //let user continue to edit
      }

      async function createProposal(startDate,endDate,ethPropose,ethAsk,location,index,threshold){
        const d1 = (new Date(startDate)).getTime();
        const d2 = (new Date(endDate)).getTime();
        console.log(d1,d2)

        try {
          // let beforeBalance = web3.fromWei(await promisify(cb => web3.eth.getBalance(witAddress, cb)), 'ether');
          // let bb2 = web3.fromWei(await promisify(cb => web3.eth.getBalance(testUser, cb)), 'ether');
          // console.log("WIT Balance (beforeBalance): ",beforeBalance.toNumber())
          // console.log("User Balance: ",bb2.toNumber());
          // let beforeAllowance = await promisify(cb => cropInstance.allowance(testUser,witAddress,cb));
          // console.log("beforeAllowance",beforeAllowance.toNumber(),0)
          // let approval = await promisify(cb => cropInstance.approve(witAddress,ethPropose + ethAsk,{from: testUser},cb));
          // console.log("approval",approval)
          // let afterAllowance2 = await promisify(cb => cropInstance.allowance(testUser,witAddress,cb));
          // console.log("afterAllowance2",afterAllowance2.toNumber(),ethPropose + ethAsk)
          await promisify(cb => witInstance.createWITProposal(ethPropose, ethAsk, index, threshold, location, d1, d2, true, {value: ethPropose, from:testUser}, cb));
          // let supply = await promisify(cb => witInstance.totalSupply(cb));
          // console.log("supply",supply.toNumber(),1)
          // let cropBalance = await web3.fromWei(await promisify(cb => cropInstance.balanceOf(testUser,cb)), 'ether');
          // let cropBalance2 = await web3.fromWei(await promisify(cb => cropInstance.balanceOf(testUser2,cb)), 'ether');
          // console.log("CROP Balance testUser",cropBalance.toNumber())
          // console.log("CROP Balance testUser2",cropBalance2.toNumber())
          // let afterBalance = await promisify(cb => web3.eth.getBalance(witAddress, cb));
          // console.log("afterBalance",afterBalance.toNumber())
          // console.log("afterBalance-ethPropose === beforeBalance",afterBalance-ethPropose,beforeBalance.toNumber())
          // let owner = await promisify(cb => witInstance.ownerOf(1, cb));
          // console.log("owner",testUser,owner)
          // let beforeBalance2 = await promisify(cb => web3.eth.getBalance(witAddress,cb));
          // console.log("WIT Balance (beforeBalance): ",beforeBalance.toNumber());
          // await promisify(cb => witInstance.createWITAcceptance(1,{from: testUser, value:ethAsk},cb));
          // let supply2 = await promisify(cb => witInstance.totalSupply(cb));
          // console.log("supply",supply2.toNumber(),2)
          // let afterBalance2 = await promisify(cb => web3.eth.getBalance(witAddress, cb));
          // console.log("afterBalance2",afterBalance2.toNumber())
          // console.log("afterBalance2-ethAsk === beforeBalance2",afterBalance2-ethAsk,beforeBalance2.toNumber())
          // let owner2 = await promisify(cb => witInstance.ownerOf(supply2.toNumber(), cb));
          // console.log("owner",owner2,testUser)

          //clear form if succesful
          target[0].value = "";
          target[1].value = "";
          target[2].value = 0;
          target[3].value = 0;
          target[4].value = "";
          target[5].value = "";
          target[6].value = "";
          target[7].value = "";
        } catch (error) {
          console.log(error)
          alert("Transaction was not succesful: " + error.message);
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

////////////////////////////////////////////
// FUNCTIONS RELATED TO "MY PROTECTIONS"
////////////////////////////////////////////

//tables should display as loading until data is available
Template.myProtectionsTable.onCreated(function(){
  Session.set("myProtectionsFilteredData",[
    {
      type: "bodyRow"
      ,column: [
        {type:"text",name:"#325927593"}
        ,{type:"text",name:"#56425673"}
        ,{type:"text",name:"01-02-2018"}
        ,{type:"text",name:"03-04-2018"}
        ,{type:"text",name:"7$"}
        ,{type:"text",name:"8$"}
        ,{type:"text",name:"Alberta"}
        ,{type:"text",name:"index"}
        ,{type:"text",name:"10%"}
        ,{type:"text",name:"frozen"}
        ,{type:"button",name:"action",button:"<button type='button' class='action'> action </button>"}
      ]
    },
    {
      type: "bodyRow"
      ,column: [
        {type:"text",name:"#539503827"}
        ,{type:"text",name:"#56425673"}
        ,{type:"text",name:"07-02-2018"}
        ,{type:"text",name:"09-09-2018"}
        ,{type:"text",name:"1$"}
        ,{type:"text",name:"10$"}
        ,{type:"text",name:"Saskatchewan"}
        ,{type:"text",name:"index"}
        ,{type:"text",name:"10%"}
        ,{type:"text",name:"evaluating"}
        ,{type:"button",name:"action",button:"<button type='button' class='action'> action </button>"}
      ]
    }
  ]);
});

// populate open protections table
Template.myProtectionsTable.helpers({
  headerData: function() {
    return [
      {
        type: "headerRow"
        ,column: [
          {name:"Seller"}
          ,{name:"Buyer"}
          ,{name:"Start"}
          ,{name:"End"}
          ,{name:"Payout"}
          ,{name:"Cost"}
          ,{name:"Location"}
          ,{name:"Index"}
          ,{name:"Threshold"}
          ,{name:"Status"}
          ,{name:"Action"}
        ]
      }
    ];
  },
  bodyData: function(){
    return Session.get("myProtectionsFilteredData");
  }
});
