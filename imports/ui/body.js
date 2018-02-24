import { Template } from 'meteor/templating';
import './body.html';

////////////////////////////////////////////
// FUNCTIONS RELATED TO WEB3 PAGE STARTUP
////////////////////////////////////////////

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
  Meteor.startup(function() {
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
      user = web3.eth.accounts[0];
      cropContract = web3.eth.contract(CROPABI);
      cropInstance = cropContract.at(cropAddress);
      witContract = web3.eth.contract(WITABI);
      witInstance = witContract.at(witAddress);
      console.log("testCrop")
      console.log(CROPABI)
      console.log(cropContract)
      console.log(cropInstance)
      console.log("testWit")
      console.log(WITABI)
      console.log(witContract)
      console.log(witInstance)
      myEvent = witInstance.allEvents();
      console.log(myEvent)
      myEvent.watch(function(error, result){
          console.log("on watch");
          console.log(arguments);
      });
      myEvent2 = witInstance.allEvents({},{fromBlock: 0, toBlock: 'latest'});
      console.log(myEvent2)
      myEvent2.watch(function(error, result){
          console.log("on watch2");
          console.log(arguments);
      });
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

  Template.body.onCreated(function() {
    console.log('Template.body.onCreated');
  });

  Template.body.helpers({
    // currentTemplate: function() {
    //   return Session.get('curTemplate');
    // },
  });
}

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
      if(t.innerText === "PAYOUT (ETH)") colIndex = 2;
      if(t.innerText === "COST (ETH)") colIndex = 3;
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

//tables should display as loading until data is available
Template.openProtectionsTable.onCreated(function(){

  setTimeout(function(){
    $('.wrapper').removeClass('loading');
    $('.loader').hide();
    Session.set("openProtectionsFilteredData",[
      {
        type: "bodyRow"
        ,column: [
          {type:"text",name:"#123456789"}
          ,{type:"num",name:"2"}
          ,{type:"num",name:"2"}
          ,{type:"num",name:"5"}
          ,{type:"text",name:"US corn belt"}
          ,{type:"text",name:"Index"}
          ,{type:"num",name:"10"}
          ,{type:"button",name:"Buy",button:"<button type='button' class='buyit'> buy </button>"}
        ]
      },
      {
        type: "bodyRow"
        ,column: [
          {type:"text",name:"#285937365"}
          ,{type:"num",name:"5"}
          ,{type:"num",name:"6"}
          ,{type:"num",name:"2"}
          ,{type:"text",name:"US corn belt"}
          ,{type:"text",name:"Index"}
          ,{type:"num",name:"9"}
          ,{type:"button",name:"Fund",button:"<button type='button' class='fund'> fund </button>"}
        ]
      }
    ]);
  }, 500);
});

// populate open protections table
Template.openProtectionsTable.helpers({
  filterData: function() {
    return [
      {
        type: "headerRow"
        ,column: [
          {name:"Token Hash"}
          ,{name:"Term (mo)"}
          ,{name:"Payout (eth)"}
          ,{name:"Cost (eth)"}
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
          ,{name:"Term (mo)"}
          ,{name:"Payout (eth)"}
          ,{name:"Cost (eth)"}
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
        title: "ETH Payout:"
        ,tooltiptext: "The amount of ETH received by the contract buyer if the ___ are met."
        ,type: "number"
        ,name: "payout"
      }
      ,{
        title: "ETH Cost:"
        ,tooltiptext: "The amount of ETH received by the contract seller if the ___ are met."
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
    const payout = target[2].value;
    const cost = target[3].value;
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
        + "  ETH Payout: " + payout + "\n"
        + "  ETH Cost: " + cost + "\n"
        + "  Location: " + location + "\n"
        + "  Index: " + index + "\n"
        + "  Threshold: " + threshold + "\n"
        + "  Buy or Sell: " + buySell + "\n"
      );

      if(confirmed){
        //submit info
        createProposal();
      }else{
        //let user continue to edit
      }

      async function createProposal(){
        //make ethereum call createWITProposal()
        const ethPropose = 9000;
        const ethAsk = 1000;

        const now = Math.round((new Date()).getTime() / 1000);
        const one_month = 2629746000;
        const one_month_from_now = now + one_month;
        const two_months_from_now = now + (2 * one_month);

        let wei, wei2, bb2, beforeBalance;
        let checkAllowance, beforeAllowance;
        let ap, approval;
        let chkAl, afterAllowance1, afterAllowance2;
        let createWit;
        let sup, supply;
        let cropBal, cropBal2, cropBalance, cropBalance2;
        let aftBal, afterBalance;
        let ownr, owner;
        let bb3, beforeBalance2;
        let createWit2;
        let sup2, supply2;
        let aftBal2, afterBalance2;
        let ownr2, owner2;

        wei = promisify(cb => web3.eth.getBalance(witAddress, cb))
        wei2 = promisify(cb => web3.eth.getBalance(testUser, cb))
        checkAllowance = promisify(cb => cropInstance.allowance(testUser,witAddress,cb))
        ap = promisify(cb => cropInstance.approve(witAddress,ethPropose + ethAsk,{from: testUser},cb))
        chkAl = promisify(cb => cropInstance.allowance(testUser,witAddress,cb))
        createWit = promisify(cb => witInstance.createWITProposal(ethPropose, ethAsk, "rain", "one inch", "india", one_month_from_now, two_months_from_now, true, {value: ethPropose, from:testUser}, cb))
        sup = promisify(cb => witInstance.totalSupply(cb))
        cropBal = promisify(cb => cropInstance.balanceOf(testUser,cb))
        cropBal2 = promisify(cb => cropInstance.balanceOf(testUser2,cb))
        aftBal = promisify(cb => web3.eth.getBalance(witAddress, cb))
        ownr = promisify(cb => witInstance.ownerOf(1, cb))
        bb3 = promisify(cb => web3.eth.getBalance(witAddress,cb))
        createWit2 = promisify(cb => witInstance.createWITAcceptance(1,{from: testUser, value:ethAsk},cb))
        sup2 = promisify(cb => witInstance.totalSupply(cb))
        aftBal2 = promisify(cb => web3.eth.getBalance(witAddress, cb))
        ownr2 = promisify(cb => witInstance.ownerOf(2, cb))
        try {
          beforeBalance = web3.fromWei(await wei, 'ether');
          bb2 = web3.fromWei(await wei2, 'ether');
          console.log("WIT Balance (beforeBalance): ",beforeBalance.toNumber())
          console.log("User Balance: ",bb2.toNumber());
          beforeAllowance = await checkAllowance;
          console.log("beforeAllowance",beforeAllowance.toNumber(),0)
          approval = await ap;
          console.log("approval",approval)
          // afterAllowance1 = await checkAllowance;
          // console.log("afterAllowance1",afterAllowance1.toNumber(),ethPropose + ethAsk)
          afterAllowance2 = await chkAl;
          console.log("afterAllowance2",afterAllowance2.toNumber(),ethPropose + ethAsk)
          await createWit;
          supply = await sup;
          console.log("supply",supply.toNumber(),1)
          cropBalance = await web3.fromWei(await cropBal, 'ether');
          cropBalance2 = await web3.fromWei(await cropBal2, 'ether');
          console.log("CROP Balance testUser",cropBalance.toNumber())
          console.log("CROP Balance testUser2",cropBalance2.toNumber())
          afterBalance = await aftBal;
          console.log("afterBalance",afterBalance.toNumber())
          console.log("afterBalance-ethPropose === beforeBalance",afterBalance-ethPropose,beforeBalance.toNumber())
          owner = await ownr;
          console.log("owner",testUser,owner)
          beforeBalance2 = await bb3;
          console.log("WIT Balance (beforeBalance): ",beforeBalance.toNumber());
          await createWit2;
          supply2 = await sup2;
          console.log("supply",supply2.toNumber(),2)
          afterBalance2 = await aftBal2;
          console.log("afterBalance2",afterBalance2.toNumber())
          console.log("afterBalance2-ethAsk === beforeBalance2",afterBalance2-ethAsk,beforeBalance2.toNumber())
          owner2 = await ownr2;
          console.log("owner",owner2,testUser2)

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
