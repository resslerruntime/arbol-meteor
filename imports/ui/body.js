import { Template } from 'meteor/templating';
import './body.html';

// TODO
//populate the drop down menus for the form (locations,index,threshhold)
//  where are these values stored? there will obviously be only a limited number of areas available

////////////////////////////////////////////
// FUNCTIONS RELATED TO THE ENTIRE PAGE
////////////////////////////////////////////

ReactiveTabs.createInterface({
  template: 'basicTabs',
  onChange: function (slug, template) {
    // This callback runs every time a tab changes.
    // The `template` instance is unique per {{#basicTabs}} block.
    console.log('[tabs] Tab has changed! Current tab:', slug);
    console.log('[tabs] Template instance calling onChange:', template);
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
// FUNCTIONS RELATED TO "OPEN PROTECTIONS"
////////////////////////////////////////////


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
  'mouseleave .date-picker'(event) {
    //TODO change properties of the other date picker so that incorrect values can't be chosen
    var target = event.currentTarget;
    var date = target.value;
    var id = target.id;
    console.log(date,id)
    console.log(this)
    console.log(Template.formNewProtection)
  },
  'keyup .date-picker'(event) {
    //TODO change properties of the other date picker so that incorrect values can't be chosen
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
        //clear form
        target[0].value = "";
        target[1].value = "";
        target[2].value = "";
        target[3].value = "";
        target[4].value = "";
        target[5].value = "";
        target[6].value = "";
        target[7].value = "";
      }else{
        //let user continue to edit
      }
    }
  },
});

////////////////////////////////////////////
// FUNCTIONS RELATED TO "MY PROTECTIONS"
////////////////////////////////////////////
