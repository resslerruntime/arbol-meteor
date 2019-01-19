import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './manageWITs.js'
import './NASA-leaflet.js';
import './NOAA-svg.js';
import './tables.js'
import './yearly-chart.js';
import './threshold.js';
import './utilities.js'

import './body.html';
import './createProtection.html';

Router.route('/tutorial');
Router.route('/', {
  template: 'main-page',
  onAfterAction:function(){
    let onHTML = setInterval(function(){
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

//manage current user
Session.set("user",-1);
Session.set("pastUser",-2);

// var arbolAddress, arbolContract, arbolInstance; //tag for deletion
var witAddress, witContract, witInstance;
var noaaAddress, nasaAddress;
var hadrianAddress, hadrianContract, hadrianInstance;

function initMainPage(){
  if (Meteor.isClient) {
    Meteor.startup(async function() {

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
      //TODO this should be done when user choose index
      //start drawing svg
      drawMonths(30);

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
        $('#demo-popup').show();
        $("#user").show();
        // Modern dapp browsers...
        if(window.ethereum) {
          window.web3 = new Web3(ethereum);
          console.log("User account exposed on users agreement",web3);
          try {
              // Request account access if needed
              await ethereum.enable();

              //show relevant content depending on whether web3 is loaded or not
              $("#web3-onload").removeClass("disabled-div");

              // check for subsequent account activity, lockout screen if no metamask user is signed in
              initContracts();
              setInterval(manageAccounts, 1000);
          } catch (error) {
            console.log('Web3 injection was declined by user')
            // TODO ??? 
          }
        }
        // Legacy dapp browsers...
        else if (typeof web3 !== 'undefined') {
          console.log("legacy web3 injection", web3.currentProvider.constructor.name)
          // Use Mist/MetaMask's provider
          web3 = new Web3(web3.currentProvider);

          //show relevant content depending on whether web3 is loaded or not
          $("#web3-onload").removeClass("disabled-div");

          // check for subsequent account activity, lockout screen if no metamask user is signed in
          initContracts();
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

function initContracts(){
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
        //original deployment
        // witAddress  = "0x8ac71ef838699f2ebe03b00adb1a726aa2153afa";
        // noaaAddress = "0x598ca8a1da8f889a244a6031126fa6bd71acc292"; 
        //NASA-leaflet deployment- backwards compatible 07-11-2018
        // witAddress = "0x72dc0461f8ef97dbe30595b882846f80e6382189";
        // noaaAddress = "0xe8ca721c10a1947a9344d168c1299dd342f78093";
        // nasaAddress = "0xc0ec4dbd358038c42ef92f9cc9f7e389191280ef";
        //NASA-leaflet deployment- backwards compatible 10-11-2018;
        // witAddress = "0x51b65c830bff89af8b68de85400bae1ee66cbb40";
        // noaaAddress = "0x337c58a3c4142f3d382b1fe4027d281625315a0b";
        // nasaAddress = "0x5a958c25b04cdef8ff408bf79479837922bbff16";
        //NASA-leaflet deployment- backwards compatible 10-12-2018;
        // witAddress = "0xa2ed7be8cd73d94de8e6d8e7a7b5de9af43684bc";
        // noaaAddress = "0x782c883f8034e9ee52eba6dcea57a87851fce738";
        // nasaAddress = "0x836886d868e84529f1d327531e7e2d35f8f04705"; 
        //Stable coing deployment, 12-06-2018
        hadrianAddress = "0x10159b0bd6b60009be286753b153aaabd386a949";
        nasaAddress = "0xec3819a25261535594fda1425c702dc8240a5c5c";
        witAddress = "0xa6080a40c9e1149f943ca6a3543e361f8604d290";
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
        noaaAddress = "0x7cb50610e7e107b09acf3fbb8724c6df3f3e1c1d"; 
    }
    console.log("witAddress",witAddress)
    console.log("noaaAddress",noaaAddress)
    console.log("nasaAddress",nasaAddress)
    witContract = web3.eth.contract(WITABI);
    witInstance = witContract.at(witAddress);
    hadrianContract = web3.eth.contract(HADRIANABI);
    hadrianInstance = hadrianContract.at(hadrianAddress);
    Session.set("witAddress",witAddress)
    Session.set("noaaAddress",noaaAddress)
    Session.set("nasaAddress",nasaAddress)
    setWitInstance(witInstance); //for manageWITs
    setWitInstance2(witInstance); //for table
  })  
}

async function manageAccounts(){
  try {
    let userObj = await promisify(cb => web3.eth.getAccounts(cb)), user = userObj[0];
    Session.set("user",user);
    if(typeof user === "undefined") Session.set("user",-1);
    console.log(`_-_ currentUser: ${user}`, `last check: ${Session.get("pastUser")}`,`user changed? ${user !== Session.get("pastUser")}`)
    if(user !== Session.get("pastUser")){
      console.log("_-_-_- CHANGE IN USER _-_-_-")
      //reset and reload everything for new user
      // $("#web3-onload").addClass("disabled-div");

      resetSessionVars();
      // resetGlobalVariables();
      let s;
      if(user !== -1){
        console.log("_-_ new user",user)
        $('#user-hash').html(user);
        $('#user-hash').removeClass('red-text');
        $('#user-hash').addClass('green-text');

        $('#my-wrapper').removeClass('loading');
        $('#my-loader').hide();
      } else {
        console.log("_-_ user undefined",user)
        $('#user-hash').html("No current user- log into MetaMask");
        $('#user-hash').addClass('red-text');
        $('#user-hash').removeClass('green-text');

        $('#my-loader').show();
        $('#my-wrapper').addClass('loading'); 
      }
      updateBalance();
      loadData();
    }
    pastUser = user;
    Session.set("pastUser",user);
  } catch (error) {
    console.log(error)
  }
}

async function updateBalance(){
  console.log("_-_ update balance",Session.get("user"))
  if(Session.get("user") === -1){
    $('#user-balance').html("0.000");
    $('#user-balance').removeClass('green-text');
    $('#user-balance').addClass('red-text');
  } else {
    // get Eth balance
    web3.eth.getBalance(Session.get("user"),function (error, result) {
      if (!error) {
        var e = toEth(result.toNumber());
        if(e === 0){
          $('#user-balance').html("0.000");
          $('#user-balance').removeClass('green-text');
          $('#user-balance').addClass('red-text');
        }else{
          $('#user-balance').html("Ξ"+clipNum(e));
          $('#user-balance').removeClass('red-text');
          $('#user-balance').addClass('green-text');
        }
      } else {
        console.error(error);
      }
    });
    // get HUSD balance
    try{
      var bal = await promisify(cb => hadrianInstance.balanceOf(Session.get("user"), cb));
    }catch(error){
      console.log(error);
    }
    console.log("HUSD balance",bal,bal.toNumber()/1e18)
    //TODO convert this properly
    var e = parseInt(toEth(bal.toNumber())).toFixed(2);
    //var e = bal.toNumber()/1e18;
    if(e === 0){
      $('#user-balance-HUSD').html("0");
      $('#user-balance-HUSD').removeClass('green-text');
      $('#user-balance-HUSD').addClass('red-text');
    }else{
      $('#user-balance-HUSD').html("$"+e);
      $('#user-balance-HUSD').removeClass('red-text');
      $('#user-balance-HUSD').addClass('green-text');
    } 
  }
}

//begin the process of loading all the data
function loadData(){
    //populate lists
    latestProposals();
    latestAcceptances();
    latestInvocation();
    latestEvaluations();
}

function resetSessionVars(){
  console.log("_-_ fn: resetSessionVars")
  $('#open-pager-btns').hide();
  $('#my-pager-btns').hide();
  Session.set("filterCriteria",{});
  Session.set("openProtectionsData",[]);
  Session.set("myProtectionsData",[]);
  Session.set("myPagination",0);
  Session.set("opPagination",0);
  Session.set("openProtectionsPaginatedData",[]);
  Session.set("myProtectionsPaginatedData",[]);
  Session.set("sortIndex",0);
  Session.set("descending",true);
  Session.set("mySortIndex",0);
  Session.set("myDescending",true);
  resetReception();
}

//get all proposals, add new entries as they are created
var watchLatestProposal = -1;
function latestProposals(){
  console.log("fn: latestProposals");
  watchLatestProposal = witInstance.ProposalOffered({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    updateBalance();
    if(typeof result !== "undefined"){
      let store = addInfoFromProposalCreated(result);
      updateOpenProposals(store.openProposals);
      updateMyProposals(store.myProposals);
    }
  });
}

//get all acceptances, add new acceptances to myProposals as they are created and remove from open proposals
var watchLatestAcceptance = -1;
function latestAcceptances(){
  console.log("fn: latestAcceptance");
  //do something as new proposal is accepted
  watchLatestAcceptance = witInstance.ProposalAccepted({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    updateBalance();
    if(typeof result !== "undefined"){
      let store = addInfoFromProposalAccepted(result);
      updateOpenProposals(store.openProposals);
      updateMyProposals(store.myProposals);
    }
  });
}

var watchLatestInvocation = -1;
function latestInvocation(){
  console.log("fn: latestEvalInvoked");
  watchLatestInvocation = witInstance.WITEvaluationInvoked({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    updateBalance();
    if(typeof result !== "undefined"){
      let store = addInfoFromEvaluationInvoked(result);
      updateOpenProposals(store.openProposals);
      updateMyProposals(store.myProposals);
    }
  })
}

//get all evaluations
var watchLatestEvaluation = -1;
function latestEvaluations(){
  console.log("fn: latestEvaluation")
  //do something as new evaluation is accepted
  watchLatestEvaluation = witInstance.WITEvaluated({},{fromBlock: 0, toBlock: 'latest'}).watch(function(error, result){
    updateBalance();
    if(typeof result !== "undefined"){
      let store = addInfoFromProposalEvaluated(result);
      updateOpenProposals(store.openProposals);
      updateMyProposals(store.myProposals);
    }
  })
}

function updateOpenProposals(list){
  list = sortArray(list,Session.get("sortIndex"),Session.get("descending"));
  Session.set("openProtectionsData",list);

  if(list.length > 0){
    $('#open-loader').hide();
    $('#open-wrapper').removeClass('loading');
  }else{
    $('#open-loader').show();
    $('#open-wrapper').addClass('loading');   
  }

  //if more than ten items turn on pagination
  //set max pagination
  let tblRow = tableRows();
  if(list.length > tblRow){
    $("#open-pager-btns").show();
    $("#open-max").html(Math.ceil(list.length/tblRow));
    $("#open-current").html(1);
  }else{
    $("#open-pager-btns").hide();
  }

  //show paginated items
  let opPagination = Session.get("opPagination");
  let pageList = paginateData(list,opPagination);
  if(pageList.length > 0){
    Session.set("openProtectionsPaginatedData",pageList);
  }else{
    if(list.length > 0){
      if(opPagination > 0) Session.set("opPagination",opPagination-1);
    }else{
      Session.set("openProtectionsPaginatedData",pageList);
    }
  }
}

function updateMyProposals(list){
  list = sortArray(list,Session.get("mySortIndex"),Session.get("descending"));
  Session.set("myProtectionsData",list);

  if(list.length > 0){
    $('#my-loader').hide();
    $('#my-wrapper').removeClass('loading');
  }else{
    $('#my-loader').show();
    $('#my-wrapper').addClass('loading');   
  }

  //if more than ten items turn on pagination
  let tblRow = tableRows();
  if(list.length > tblRow){
    $("#my-pager-btns").show();
    $("#my-max").html(Math.ceil(list.length/tblRow));
    $("#my-current").html(1);
  }else{
    $("#my-pager-btns").hide();
  }

  //show paginated items
  let myPagination = Session.get("myPagination");
  let pageList = paginateData(list,myPagination);
  if(pageList.length > 0){
    Session.set("myProtectionsPaginatedData",pageList);
  }else{
    if(list.length > 0){
      if(myPagination > 0) Session.set("myPagination",myPagination-1);
    }else{
      Session.set("myProtectionsPaginatedData",pageList);
    }
  }  
}

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
      // reset the map
      if (typeof regionmap == "object") {
        regionmap.invalidateSize();
      }
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
    'locationRegion':'test',
    'month-start':null,
    'year-start':null,
    'month-end':null,
    'year-end':null,
    'date-start':null,
    'date-end':null,
    'threshold-relation':null,
    'threshold-percent':null,
    'threshold-average':null,
    'your-contrib':0,
    'requested-contrib':0,
    'total-contrib':0
  });
});
Template.formNewProtection.onRendered(function(){
  // show the first step
  $("#createwit .step").eq(0).addClass('showing');
  // disable the previous button since this is the first step
  $("#createwit-prev button").attr('disabled','disabled');
  // hide the submit button since this is the first step
  $("#createwit-submit").hide();
  // hide the start over button since this is the first step
  $("#createwit-cancel").hide();
  // initialize datepickers
  $('[data-toggle="datepicker"]').datepicker({
    autoHide: true,
    date: new Date(2017, 0, 1),
    format: 'mm/yyyy',
    startDate: new Date(2017, 0, 1),
    endDate: new Date(2020, 11, 31)
  });
  // get initial values for reactive variables based on rendered form
  self = Template.instance();
  selfdata = self.createWITdata.get();
  selfdata['locationRegion'] = 'test'; //$('#location option:selected').text();
  selfdata['threshold-relation'] = $('#threshold-relation option:selected').text();
  selfdata['threshold-percent'] = $('#threshold-percent option:selected').text();
  selfdata['threshold-average'] = $('#threshold-average option:selected').text();
  self.createWITdata.set(selfdata);
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
    // show the correct step
    $("#createwit .step.showing").removeClass('showing');
    $("#createwit .step").eq((self.createWITstep.get() - 1)).addClass('showing');
    // if this is the first step, disable the previous button
    if (self.createWITstep.get() < 2) {
      console.log("^^^ A")
      $("#createwit-prev button").attr('disabled','disabled');
      $("#createwit-next").show();
      $("#createwit-submit").hide();
      $("#createwit-cancel").hide();
      // reset the map
      if (typeof regionmap == "object") {
        regionmap.invalidateSize();
      }
    }
    // otherwise, hide the confirm button, show the next button and enable the previous button
    else {
      console.log("^^^ C")
      $("#createwit-prev button").show().removeAttr('disabled');
      $("#createwit-next").show();
      $("#createwit-submit").hide();
    }
  },
  'click #createwit-next button'(event){
    event.preventDefault();
    self = Template.instance();
    // validate step
    let validates = validateCreateWITStep((self.createWITstep.get() - 1));
    if (validates) {
      // increment the step button
      self.createWITstep.set(self.createWITstep.get() + 1);
      // show the correct step
      $("#createwit .step.showing").removeClass('showing');
      $("#createwit .step").eq((self.createWITstep.get() - 1)).addClass('showing');

      // if this is the last step, hide the next button and show the confirm button
      if (self.createWITstep.get() >= $("#createwit .step").length) {
        console.log("^^^ E")
        $("#createwit-prev button").show().removeAttr('disabled');
        $("#createwit-next").hide();
        $("#createwit-submit").show();
      }
      // otherwise, hide the confirm button, show the next button and enable the previous button
      else {
        console.log("^^^ F")
        $("#createwit-prev button").show().removeAttr('disabled');
        $("#createwit-next").show();
        $("#createwit-submit").hide();
        $("#createwit-cancel").show();
      }
    }
  },
  'click #createwit-cancel button'(event){
    event.preventDefault();
    self = Template.instance();
    resetCreateWIT(self);
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
  'click #mapdiv'(event){
    let a = selectedBounds;
    let lat = Math.round(1000 * (a[0][0]+0.125)) / 1000;
    let lng = Math.round(1000 * (a[0][1]+0.125)) / 1000;
    $('#locname').val('latitude '+lat+'°, longitude '+lng+'°').trigger('input');
    let reversegeocodeURL = 'https://services.gisgraphy.com/reversegeocoding/search?format=json&lat='+lat+'&lng='+lng;

    //TODO can we move this api call to server side?
    $.ajax({
      type: 'GET',
      crossDomain: true,
      dataType: 'jsonp',
      url: reversegeocodeURL
    }).done(function(data) {
      let r = data.result[0];
      if(typeof r !== "undefined"){
        let adm1Name = "", adm2Name = "", city = "";
        if(r.adm1Name && r.adm1Name !== "unknown") adm1Name = r.adm1Name + ", "; 
        if(r.adm2Name && r.adm2Name !== "unknown") adm2Name = r.adm2Name + ", ";
        if(r.city && r.city !== "unknown") city = r.city + ", ";
        let location = city + adm2Name + adm1Name + r.countryCode;
        $('#locname').val(location).trigger('input');
      }
    }).fail(function(){
      console.log('failed to reverse geocode');
    });

  },
  'input #locname'(event){
    // this is a hidden input to hold a location region that is reverse geocoded from the map coordinate
    self = Template.instance();
    selfdata = self.createWITdata.get();
    selfdata.locationRegion = event.currentTarget.value;
    self.createWITdata.set(selfdata);
  },
  'input [data-toggle="datepicker"]'(event){
    // if the input is the start date, use the selected date to limit the end date
    if ($(event.currentTarget).attr('id') == "date-start") {
      if (event.currentTarget.value) {
        // get selected start date
        let limitStart = $(event.currentTarget).datepicker('getDate');
        // add 11 months
        let limitEnd = $(event.currentTarget).datepicker('getDate');
        limitEnd.setMonth(limitEnd.getMonth() + 11);
        // use these dates to constrain the selection for the end date
        let limitStart_year = limitStart.getFullYear();
        let limitStart_month = limitStart.getMonth();
        let limitEnd_year = limitEnd.getFullYear();
        let limitEnd_month = limitEnd.getMonth();
        // activate the date picker for the end date
        $('#date-end').removeAttr('disabled');
        $('#date-end').prev().removeAttr('disabled');
        // destroy and recreate the date picker for the end date
        $('#date-end').val('').datepicker('destroy').datepicker({
          autoHide: true,
          date: new Date(limitStart_year,limitStart_month,1),
          format: 'mm/yyyy',
          startDate: new Date(limitStart_year,limitStart_month,1),
          endDate: new Date(limitEnd_year,limitEnd_month,1)
        });
      }
      else {
        $('#date-end').attr('disabled','disabled');
        $('#date-end').prev().attr('disabled','disabled');
      }
    }
    // if a date has been entered, remove any missing info class
    if (event.currentTarget.value != '') {
      $(event.currentTarget).removeClass('missing-info');
    }
    // store the date in the reactive variable
    self = Template.instance();
    selfdata = self.createWITdata.get();
    targetid = $(event.currentTarget).attr('id');
    selfdata[targetid] = $(event.currentTarget).datepicker('getMonthName', true) + " " + $(event.currentTarget).datepicker('getDate').getFullYear();
    self.createWITdata.set(selfdata); 

    //call NASA
    if($(event.currentTarget).attr('id') == "date-end") prepareNasaCall();
  },
  'input #your-contrib'(event){
    //don't allow your contribution to be higher than total contribution
    var num = parseFloat(event.currentTarget.value);
    var step = parseFloat($('#your-contrib')[0].step);
    let next = num + step;
    $('#total-contrib')[0].min = next;

    let tot = parseFloat($('#total-contrib')[0].value);
    if(num >= tot) {
      $('#total-contrib')[0].value = next;
      // recalculate recommended contribution
      if ($('#pct-span').attr('data-tenYrProb')) {
        var recommendedValue = Math.round((next * $('#pct-span').attr('data-tenYrProb'))*10)/1000;
        $('#your-contrib-hint-value').text(recommendedValue).parent().show();
        $('#your-contrib').attr("placeholder",recommendedValue);
      }    
    }

    $("#your-contrib").removeClass("missing-info");
    $('#requested-contrib').val(Math.round(($('#total-contrib').val() - $('#your-contrib').val())*10000)/10000);

    // calculate and show wit rating
    calcRating();

    // assign values to reactive variables
    self = Template.instance();
    selfdata = self.createWITdata.get();
    targetid = $(event.currentTarget).attr('id');
    selfdata[targetid] = event.currentTarget.value;
    selfdata['total-contrib'] = $('#total-contrib').val();
    self.createWITdata.set(selfdata);
  },
  'input #total-contrib'(event){
    if (event.currentTarget.value != '0' && event.currentTarget.value != '') {
      // remove missing info indication
      $("#total-contrib").removeClass("missing-info");
      // enable the other contribution fields
      $("#your-contrib, #requested-contrib").removeAttr('disabled');
      $("#your-contrib, #requested-contrib").prev().removeAttr('disabled');
      // recommend your contribution
      if ($('#pct-span').attr('data-tenYrProb')) {
        var recommendedValue = Math.round((event.currentTarget.value * $('#pct-span').attr('data-tenYrProb'))*10)/1000;
        $('#your-contrib-hint-value').text(recommendedValue).parent().show();
        $('#your-contrib').attr("placeholder",recommendedValue);
        // calculate the requested contribution
        $('#requested-contrib').val(Math.round((event.currentTarget.value - $('#your-contrib').val())*10000)/10000);
        // calculate and show wit rating
        calcRating(); 
      }
    }
    else {
      // disable other contribution fields
      $("#your-contrib-hint").hide();
      $("#createwit .helpbox.rating").hide();
      $('#requested-contrib').val('');
      $('#your-contrib').val('');
      $("#your-contrib, #requested-contrib").attr('disabled','disabled');
      $("#your-contrib, #requested-contrib").prev().attr('disabled','disabled');
    }
    // assign value to reactive variable
    self = Template.instance();
    selfdata = self.createWITdata.get();
    targetid = $(event.currentTarget).attr('id');
    selfdata[targetid] = event.currentTarget.value;
    selfdata['your-contrib'] = $('#your-contrib').val();
    self.createWITdata.set(selfdata);
  },
  'click #your-contrib-hint-value'(event) {
    // // clicking on the recommended value should reset the your contrib field to this value
    // $('#your-contrib').val($(event.currentTarget).text());
    // // also have to reset the requested contribution
    // $('#requested-contrib').val(Math.round(($('#total-contrib').val() - $('#your-contrib').val())*10000)/10000);
    // calcRating();

    // self = Template.instance();
    // selfdata = self.createWITdata.get();
    // selfdata['your-contrib'] = $('#your-contrib').val();
    // self.createWITdata.set(selfdata);
  },
  'input #threshold'(event) {
    changeThreshold();
    calcPct();
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
    //changeRegion(event.currentTarget.value);
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
    if (Session.get("user") === -1){
      alert("Please login to MetaMask to create a proposal.");
      return false;
    }
    else {
      event.preventDefault();
      const target = event.currentTarget;
      // console.log("target",target)
      const yourContr = parseFloat($('#your-contrib').val());
      // console.log("yourContr",yourContr)
      const totalPayout = parseFloat($('#total-contrib').val());
      const requestedContrib = parseFloat($('#requested-contrib').val());
      // console.log("totalPayout",totalPayout)
      // const location = "21.5331234,-3.1621234&0.14255"; //$('#location').val();
      const location = leafletToWitCoords(); //
      const locationDisplay = $('#locname').val();
      // console.log("return location nasa",location)
      const thresholdRelation = $('#threshold-relation').val();
      // console.log("thresholdRelation",thresholdRelation)
      const thresholdPercent = $('#threshold-percent').val();
      // console.log("tresholdPercent",thresholdPercent)
      const thresholdAverage = $('#threshold-average').val();
      // console.log("tresholdAverage",thresholdAverage)
      let sm = $('#date-start').datepicker('getDate').getMonth() + 1; // start month
      const sy = $('#date-start').datepicker('getDate').getFullYear(); // start year
      let em = $('#date-end').datepicker('getDate').getMonth() + 1; // end month
      const ey = $('#date-end').datepicker('getDate').getFullYear(); // end year
      if(sm.length < 10) sm = "0" + sm;
      if(em.length < 10) em = "0" + em;
      const startDate = `${sy}-${sm}`;
      const endDate = `${ey}-${em}`;
      const index = "Precipitation";
      const rating = calcRating();

      //ask for confirmation
      const confirmed = confirm ( "Please confirm your selection: \n\n"
        + "  Your Contribution (hUSD): " + yourContr + "\n"
        + "  Total Payout (hUSD): " + totalPayout + "\n"
        + "  Location: " + locationDisplay + "\n"
        + "  Threshold: " + threshText(thresholdRelation,thresholdPercent,thresholdAverage) + "\n"
        + "  Start Date: " + startDate + "\n"
        + "  End Date: " + endDate + "\n"
      );

      if (confirmed) {
        //submit info
        self = Template.instance();
        createProposal(startDate,endDate,yourContr,requestedContrib,location,index,thresholdRelation,thresholdPercent,thresholdAverage,rating,self);
      } else {
        //let user continue to edit
      }
    }
  }
});

function calcRating(){
  let contrib = parseFloat($('#your-contrib').val());
  let hint = parseFloat($('#your-contrib-hint-value').text());

  if(contrib !== 0 && !isNaN(contrib)){
    $("#createwit .helpbox.rating").show();

    let ratio, rating, sign, sign2 = 1, text, less;
    if(hint > contrib){
      ratio = hint/contrib;
      sign = "-";
      sign2 = -1;
      text = "less than";
      less = true;
    } 
    if(contrib >= hint){
      ratio = contrib/hint;
      sign = "+";
      text = "greater than";
      less = false;
    }
    let val = Math.round((ratio-1)*100);
    let shortText = `${sign}${val}%`;
    let longText = `${val}% ${text}`;

    $('.witrating').text(`${shortText}`);
    $('.witrating-text').text(`${longText}`);
    if(!less){
      $(".witrating").removeClass("witrating-bad");
      $(".witrating").addClass("witrating-good");
    }else{
      $(".witrating").removeClass("witrating-good");
      $(".witrating").addClass("witrating-bad");
    } 
    return sign2*val;
  }else{
    $("#createwit .helpbox.rating").hide();
    return 'NaN';
  }
}

function resetCreateWIT(instance) {
  console.log("fn: resetCreateWIT")
  // reset the step to 1
  instance.createWITstep.set(1);
  // show the correct step
  $("#createwit .step.showing").removeClass('showing');
  $("#createwit .step").eq(0).addClass('showing');
  // reset the map
  if (typeof regionmap == "object") {
    regionmap.invalidateSize();
    // NOTE: need to add clearing of layers and restart of the map
  }
  // since we are resetting to the first step, disable the previous button and hide the submit button
  $("#createwit-prev button").attr('disabled','disabled');
  $("#createwit-next").show();
  $("#createwit-submit").hide();
  // set all inputs to blank
  $('#createwit input[type="text"], #createwit input[type="number"]').val('');
  // set all selects to the first option
  $('#createwit select').each(function(){
    var firstVal = $(this).find('option').eq(0).attr('value');
    $(this).val(firstVal);
  });
  // reset the datepickers
  $('[data-toggle="datepicker"]').datepicker('destroy').datepicker({
    autoHide: true,
    date: new Date(2017, 0, 1),
    format: 'mm/yyyy',
    startDate: new Date(2017, 0, 1),
    endDate: new Date(2020, 11, 31)
  });
  // remove/hide the 10 year average
  $("#ten-yr-prob").html('');
  // clear the chart
  clearChart();
  // clear and hide the recommended contribution and wit rating
  $('#total-contrib').val('');
  $('#requested-contrib').val('');
  $('#your-contrib').val('');
  $("#your-contrib, #requested-contrib").attr('disabled','disabled');
  $("#your-contrib, #requested-contrib").prev().attr('disabled','disabled');  
  $('#your-contrib-hint-value').text('').parent().hide();
  $("#createwit .helpbox.rating").hide();
  // make initial selection for the map
  //changeRegion($('#location').val());
  $('#location').trigger('input');
  // reset the reactive variable data
  instance.createWITdata.set({
    'weatherIndex':'Rainfall',
    'locationType':'Weather Stations',
    'locationRegion':null,
    'month-start':null,
    'year-start':null,
    'month-end':null,
    'year-end':null,
    'date-start':null,
    'date-end':null,
    'threshold-relation':$('#threshold-relation').val(),
    'threshold-percent':$('#threshold-percent').val(),
    'threshold-average':$('#threshold-average').val(),
    'your-contrib':0,
    'requested-contrib':0,
    'total-contrib':0
  });
}

// var batch = web3.createBatch();
// batch.add(web3.eth.getBalance.request('0x0000000000000000000000000000000000000000', 'latest', callback));
// batch.add(web3.eth.contract(abi).at(address).balance.request(address, callback2));
// batch.execute();

async function createProposal(startDate,endDate,yourContr,requestedContrib,location,index,thresholdRelation,thresholdPercent,thresholdAverage,rating,self){
  console.log("fn: createProposal")
  const d1 = (new Date(startDate)).getTime()/1000; //convert to UNIX timestamp
  let dd2 = new Date(endDate);
  dd2.setDate(dd2.getDate() + 15);
  const d2 = dd2.getTime()/1000; //convert to UNIX timestamp

  console.log("wei",yourContr,requestedContrib)
  let weiPropose = toWei(yourContr);
  let weiAsk = toWei(requestedContrib);
  let above = threshVal(thresholdRelation);
  let numPPTH = threshValPPTH(thresholdPercent,thresholdAverage);
  let address = nasaAddress;
  console.log("weiPropose, weiAsk, above, address, numPPTH, location, d1, d2, rating");
  console.log(weiPropose, weiAsk, above, address, numPPTH, location, d1, d2, rating);

  var batch = web3.createBatch();
  batch.add(witInstance.createWITProposal.request(weiPropose, weiAsk, above, address, numPPTH, location, d1, d2, parseInt(rating), {from:Session.get("user")},function(){resetCreateWIT(self)}));
  batch.add(hadrianInstance.approve.request(witInstance.address, weiPropose, {from: Session.get("user")}));
  batch.execute();
  
  // try {
  //   await promisify(cb => hadrianInstance.approve(witInstance.address, weiPropose, {from: Session.get("user")},cb));
  // } catch (error){
  //   console.log(error)
  // }
  // try {
  //   await promisify(cb => witInstance.createWITProposal(weiPropose, weiAsk, above, address, numPPTH, location, d1, d2, makeStale, true, {from:Session.get("user"), value: weiPropose, gas: 2000000}, cb));
  //   // await promisify(cb => witInstance.createWITProposal(weiPropose, weiAsk, above, address, numPPTH, location, d1, d2, makeStale, true, {from:Session.get("user")}, cb));
  //   resetCreateWIT(self);    
  // } catch (error) {
  //   console.log(error)
  // }
}

// async function createProposalTest(){
//   console.log("fn: createProposal")
//   const d1 = 1510354801; 
//   const d2 = 1512946801; 
//   let location = "21.5331234,-3.1621234&0.14255";

//   let ethPropose = 100000000000000000;
//   let ethAsk = 100000000000000000;
//   let above = false;
//   let numPPTH = 10000; // = 10000 * threshValFraction(thresholdPercent,thresholdAverage);
//   let address = "0x5a958c25b04cdef8ff408bf79479837922bbff16";
//   let makeStale = false; //TODO for deployment makeStale should be true in default
//   let gas = 2000000;
//   console.log("ethPropose, ethAsk, above, address, numPPTH, location, d1, d2, makeStale, user");
//   console.log(ethPropose, ethAsk, above, address, numPPTH, location, d1, d2, makeStale, Session.get("user"));

//   try {
//     await promisify(cb => witInstance.createWITProposal(ethPropose, ethAsk, above, address, numPPTH, location, d1, d2, makeStale, {value: ethPropose, gas: gas, from:Session.get("user")}, cb));
//   } catch (error) {
//     console.log(error)
//   }
// }

function validateCreateWITStep(step) {
  let validates = false;
  if ($("#createwit .step").eq(step).length > 0) {
    //console.log("valid step number to validate");
    validates = true;
    $("#createwit .step").eq(step).find('input,select').each(function(){
      if ($(this).val() === null || $(this).val() === '') {
        validates = false;
        $(this).addClass('missing-info');
      }
    });
  }
  return validates;
}

////////////////////////////////////////////
// FUNCTIONS RELATED TO SORTABLE TABLES
////////////////////////////////////////////

//number of rows in the sortable tables
function tableRows (){
  //TODO decide how many rows based on available area
  return 15;
}

Template.sortableRows.helpers({
  isEqual: function (a, b) {
  return a === b;
  }
});

Template.sortableRows.events({
  'click .buyit': function(e){
    if(Session.get("user") === -1){
      alert("Please login to MetaMask buy a proposal.");
    } else {
      if(typeof e.target.value === 'undefined') acceptProposal(e.target.parentElement.value);
      else acceptProposal(e.target.value);
    }
  },
  'click .evaluateit': function(e){
    console.log("==> new WIT evaluation",e.target);
    evaluateWIT(e.target.value);
  },
  'click .cancelit': function(e){
    alert("Cancel and redeem: coming soon");
  },
  'click .downloadit': function(e){
    alert("Download receipt: coming soon");
  }
});

async function acceptProposal(v){
  let vals = v.split(",");
  let weiAsk = vals[0];
  let id = vals[1];

  console.log("===> new WIT acceptance");
  console.log("==> token ID",id,Session.get("user"),weiAsk)

  var batch = web3.createBatch();
  batch.add(witInstance.createWITAcceptance.request(id,{from: Session.get("user")}));
  batch.add(hadrianInstance.approve.request(witInstance.address, weiAsk, {from: Session.get("user")}));
  batch.execute();

  // try {
  //   await promisify(cb => witInstance.createWITAcceptance(id,{from: Session.get("user"), value:weiAsk, gas: 2000000},cb));
  // } catch (error) {
  //   console.log(error);
  // }
}


async function evaluateWIT(id){
  //evaluate WIT once its period h gas elapsed
  try {
    console.log("==> token ID", id, Session.get("user"));
    await promisify(cb => witInstance.evaluate(id,"",{from: Session.get("user"), gas: 6000000},cb));
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
    $(t).fadeIn(100).fadeOut(100).fadeIn(100);
    //sort the json based on the header
    let array = [];
    let colIndex = 0;
    if(t.parentElement.parentElement.parentElement.id === "openProtections"){
      let d = Session.get("descending");
      array = Session.get("openProtectionsData");
      //sort array based on the click header
      if(t.innerText.indexOf("RATING") != -1) colIndex = 0;
      if(t.innerText.indexOf("LOCATION") != -1) colIndex = 1;
      if(t.innerText.indexOf("THRESHOLD") != -1) colIndex = 2;
      if(t.innerText.indexOf("INDEX") != -1) colIndex = 3;
      if(t.innerText.indexOf("START") != -1) colIndex = 4;
      if(t.innerText.indexOf("END") != -1) colIndex = 5;
      if(t.innerText.indexOf("TOTAL PAYOUT") != -1) colIndex = 6;
      if(t.innerText.indexOf("PRICE") != -1) colIndex = 7;
      Session.set("sortIndex",colIndex);
      //set variable to new sorted array
      let list = sortArray(array,colIndex,d);
      Session.set("openProtectionsData",list);
      Session.set("opPagination",0);
      let pageList = paginateData(list,0);
      Session.set("openProtectionsPaginatedData",pageList);
      Session.set("descending",!d);
    }
    if(t.parentElement.parentElement.parentElement.id === "myProtections"){
      let d = Session.get("myDescending");
      array = Session.get("myProtectionsData");
      //sort array based on the click header
      if(t.innerText.indexOf("LOCATION") != -1) colIndex = 0;
      if(t.innerText.indexOf("THRESHOLD") != -1) colIndex = 1;
      if(t.innerText.indexOf("INDEX") != -1) colIndex = 2;
      if(t.innerText.indexOf("START") != -1) colIndex = 3;
      if(t.innerText.indexOf("END") != -1) colIndex = 4;
      if(t.innerText.indexOf("YOUR CONTRIBUTION") != -1) colIndex = 5;
      if(t.innerText.indexOf("TOTAL PAYOUT") != -1) colIndex = 6;
      if(t.innerText.indexOf("STATUS") != -1) colIndex = 7;
      if(t.innerText.indexOf("ACTION") != -1) colIndex = 8;
      Session.set("mySortIndex",colIndex);
      //set variable to new sorted array
      let list = sortArray(array,colIndex,d);
      Session.set("myProtectionsData",list);
      Session.set("myPagination",0);
      let pageList = paginateData(list,0);
      Session.set("myProtectionsPaginatedData",pageList);
      Session.set("myDescending",!d);
    }
  }
});

function sortArray (array,i,d){
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
Session.set("opPagination",0);
Template.openPagination.events({
  'click #open-forward'(e){
    let opPagination = Session.get("opPagination");
    opPagination += 1;
    let list = Session.get("openProtectionsData");
    let pageList = paginateData(list,opPagination);
    if(pageList.length > 0) Session.set("openProtectionsPaginatedData",pageList);
    else if(opPagination > 0) opPagination -= 1;
    $("#open-current").html(opPagination+1);
    Session.set("opPagination",opPagination);
  },
  'click #open-back'(e){
    let opPagination = Session.get("opPagination");
    if(opPagination > 0) opPagination -= 1;
    let fullList = Session.get("openProtectionsData");
    let pageList = paginateData(fullList,opPagination);
    Session.set("openProtectionsPaginatedData",pageList);
    $("#open-current").html(opPagination+1);
    Session.set("opPagination",opPagination);
  }
});

Session.set("myPagination",0);
Template.myPagination.events({
  'click #my-forward'(e){
    let myPagination = Session.get("myPagination");
    myPagination += 1;
    let fv = $('#first-token-filter').val();
    let list = Session.get("myProtectionsData");
    let pageList = paginateData(list,myPagination);
    if(pageList.length > 0) Session.set("myProtectionsPaginatedData",pageList);
    else if(myPagination > 0) myPagination -= 1;
    $("#my-current").html(myPagination+1);
    Session.set("myPagination",myPagination);
  },
  'click #my-back'(e){
    let myPagination = Session.get("myPagination");
    if(myPagination > 0) myPagination -= 1;
    let fullList = Session.get("myProtectionsData");
    let pageList = paginateData(fullList,myPagination);
    Session.set("myProtectionsPaginatedData",pageList);
    $("#my-current").html(myPagination+1);
    Session.set("myPagination",myPagination);
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
          {name:"Rating"}
          ,{name:"Location"}
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

