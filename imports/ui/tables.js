import { Template } from 'meteor/templating';


let witInstance;

//number of rows in the sortable tables
tableRows = function (){
  //TODO decide how many rows based on available area
  return 15;
}

setWitInstance2 = function(inst){
  witInstance = inst;
}

////////////////////////////////////////////
// FUNCTIONS RELATED TO SORTABLE TABLES
////////////////////////////////////////////
Meteor.startup(function(){
	// Template.sortableRows.helpers({
	//   isEqual: function (a, b) {
	//   return a === b;
	//   }
	// });

	// Template.sortableRows.events({
	//   'click .buyit': function(e){
	//     if(Session.get("user") === -1){
	//       alert("Please login to MetaMask buy a proposal.");
	//     } else {
	//       if(typeof e.target.value === 'undefined') acceptProposal(e.target.parentElement.value);
	//       else acceptProposal(e.target.value);
	//     }
	//   },
	//   'click .evaluateit': function(e){
	//     evaluateWIT(e.target.value);
	//   },
	//   'click .cancelit': function(e){
	//     alert("coming soon");
	//   }
	// });

	// async function acceptProposal(v){
	//   let vals = v.split(",");
	//   let ethAsk = vals[0]
	//   let id = vals[1];

	//   try {
	//     // console.log("====> new WIT acceptance");
	//     // console.log("ethAsk", ethAsk);
	//     // console.log("proposal token ID", id);

	//     //TODO don't let user accept their own proposal
	//     await promisify(cb => witInstance.createWITAcceptance(id,{from: Session.get("user"), value:toWei(ethAsk)},cb));
	//   } catch (error) {
	//     console.log(error)
	//   }
	// }

	// //evaluate WIT once its period h gas elapsed
	// async function evaluateWIT(id){
	//   try {
	//     let idodd = parseInt(id);
	//     if(id/2 === Math.round(id/2)) idodd = parseInt(id) - 1;
	//     // console.log("=================> new WIT evaluation");
	//     // console.log("token ID", id, idodd, Session.get("user"));
	//     await promisify(cb => witInstance.evaluate(idodd,"",{from: Session.get("user")},cb));
	//   } catch (error) {
	//     console.log(error)
	//   }
	// }

	// Template.headerRow.events({
	//   'mouseenter th': function(e){
	//     $(e.target).addClass('hover');
	//   },
	//   'mouseleave th': function(e){
	//     $(e.target).removeClass('hover');
	//   },
	//   'click th': function(e,template){
	//     var t = e.target;
	//     $(t).fadeIn(100).fadeOut(100).fadeIn(100); //.fadeOut(100).fadeIn(100);
	//     //sort the json based on the header
	//     let array = [];
	//     let colIndex = 0;
	//     if(t.parentElement.parentElement.parentElement.id === "openProtections"){
	//       let d = Session.get("descending");
	//       array = Session.get("openProtectionsData");
	//       //sort array based on the click header
	//       if(t.innerText.indexOf("LOCATION") != -1) colIndex = 0;
	//       if(t.innerText.indexOf("THRESHOLD") != -1) colIndex = 1;
	//       if(t.innerText.indexOf("INDEX") != -1) colIndex = 2;
	//       if(t.innerText.indexOf("START") != -1) colIndex = 3;
	//       if(t.innerText.indexOf("END") != -1) colIndex = 4;
	//       if(t.innerText.indexOf("TOTAL PAYOUT") != -1) colIndex = 5;
	//       if(t.innerText.indexOf("PRICE") != -1) colIndex = 6;
	//       Session.set("sortIndex",colIndex);
	//       //set variable to new sorted array
	//       let list = sortArray(array,colIndex,d);
	//       Session.set("openProtectionsData",list);
	//       Session.set("opPagination",0);
	//       let pageList = paginateData(list,0);
	//       Session.set("openProtectionsPaginatedData",pageList);
	//       Session.set("descending",!d);
	//     }
	//     if(t.parentElement.parentElement.parentElement.id === "myProtections"){
	//       let d = Session.get("myDescending");
	//       array = Session.get("myProtectionsData");
	//       //sort array based on the click header
	//       if(t.innerText.indexOf("LOCATION") != -1) colIndex = 0;
	//       if(t.innerText.indexOf("THRESHOLD") != -1) colIndex = 1;
	//       if(t.innerText.indexOf("INDEX") != -1) colIndex = 2;
	//       if(t.innerText.indexOf("START") != -1) colIndex = 3;
	//       if(t.innerText.indexOf("END") != -1) colIndex = 4;
	//       if(t.innerText.indexOf("YOUR CONTRIBUTION") != -1) colIndex = 5;
	//       if(t.innerText.indexOf("TOTAL PAYOUT") != -1) colIndex = 6;
	//       if(t.innerText.indexOf("STATUS") != -1) colIndex = 7;
	//       if(t.innerText.indexOf("ACTION") != -1) colIndex = 8;
	//       Session.set("mySortIndex",colIndex);
	//       //set variable to new sorted array
	//       let list = sortArray(array,colIndex,d);
	//       Session.set("myProtectionsData",list);
	//       Session.set("myPagination",0);
	//       let pageList = paginateData(list,0);
	//       Session.set("myProtectionsPaginatedData",pageList);
	//       Session.set("myDescending",!d);
	//     }
	//   }
	// });

	// sortArray = function (array,i,d){
	//   let sortedArray = _.sortBy(array,function(obj){
	//     let cell = obj.column[i], key;
	//     if(cell.type === "num") return key = parseFloat(cell.key);
	//     if(cell.type === "text") return key = cell.key;
	//   });
	//   if(d) sortedArray.reverse();
	//   return sortedArray;
	// }

	// ////////////////////////////////////////////
	// // FUNCTIONS RELATED TO PAGINATION
	// ////////////////////////////////////////////

	// //TODO grey out back and forward button as appropriate
	// // Paginate through all the data
	// Session.set("opPagination",0);
	// Template.openPagination.events({
	//   'click #open-forward'(e){
	//     let opPagination = Session.get("opPagination");
	//     opPagination += 1;
	//     let list = Session.get("openProtectionsData");
	//     let pageList = paginateData(list,opPagination);
	//     if(pageList.length > 0) Session.set("openProtectionsPaginatedData",pageList);
	//     else if(opPagination > 0) opPagination -= 1;
	//     $("#open-current").html(opPagination+1);
	//     Session.set("opPagination",opPagination);
	//   },
	//   'click #open-back'(e){
	//     let opPagination = Session.get("opPagination");
	//     if(opPagination > 0) opPagination -= 1;
	//     let fullList = Session.get("openProtectionsData");
	//     let pageList = paginateData(fullList,opPagination);
	//     Session.set("openProtectionsPaginatedData",pageList);
	//     $("#open-current").html(opPagination+1);
	//     Session.set("opPagination",opPagination);
	//   }
	// });

	// Session.set("myPagination",0);
	// Template.myPagination.events({
	//   'click #my-forward'(e){
	//     let myPagination = Session.get("myPagination");
	//     myPagination += 1;
	//     let fv = $('#first-token-filter').val();
	//     let list = Session.get("myProtectionsData");
	//     let pageList = paginateData(list,myPagination);
	//     if(pageList.length > 0) Session.set("myProtectionsPaginatedData",pageList);
	//     else if(myPagination > 0) myPagination -= 1;
	//     $("#my-current").html(myPagination+1);
	//     Session.set("myPagination",myPagination);
	//   },
	//   'click #my-back'(e){
	//     let myPagination = Session.get("myPagination");
	//     if(myPagination > 0) myPagination -= 1;
	//     let fullList = Session.get("myProtectionsData");
	//     let pageList = paginateData(fullList,myPagination);
	//     Session.set("myProtectionsPaginatedData",pageList);
	//     $("#my-current").html(myPagination+1);
	//     Session.set("myPagination",myPagination);
	//   }
	// });

	// //break all entries into list of x entries
	// paginateData = function (array,index) {
	//   let bin = tableRows();
	//   let l = array.length;
	//   if(l < index*bin){
	//     return [];
	//   }else{
	//     if(l <= (index+1)*bin){
	//       return array.slice(index*bin,l);
	//     }
	//     if(l > (index+1)*bin){
	//       return array.slice(index*bin,(index+1)*bin);
	//     }
	//   }
	// }

	// ////////////////////////////////////////////
	// // FUNCTIONS RELATED TO "OPEN PROTECTIONS"
	// ////////////////////////////////////////////

	// // populate open protections table
	// Template.openProtectionsTable.helpers({
	//   headerData: function() {
	//     return [
	//       {
	//         type: "headerRow"
	//         ,column: [
	//           {name:"Location"}
	//           ,{name:"Threshold"}
	//           ,{name:"Index"}
	//           ,{name:"Start"}
	//           ,{name:"End"}
	//           ,{name:"Total Payout"}
	//           ,{name:"Price"}
	//         ]
	//       }
	//     ];
	//   },
	//   bodyData: function(){
	//     return Session.get("openProtectionsPaginatedData");
	//   }
	// });

	// ////////////////////////////////////////////
	// // FUNCTIONS RELATED TO "MY PROTECTIONS"
	// ////////////////////////////////////////////

	// // populate open protections table
	// Template.myProtectionsTable.helpers({
	//   headerData: function() {
	//     return [
	//       {
	//         type: "headerRow"
	//         ,column: [
	//           {name:"Location"}
	//           ,{name:"Threshold"}
	//           ,{name:"Index"}
	//           ,{name:"Start"}
	//           ,{name:"End"}
	//           ,{name:"Your Contribution"}
	//           ,{name:"Total Payout"}
	//           ,{name:"Status"}
	//           ,{name:"Action"}
	//         ]
	//       }
	//     ];
	//   },
	//   bodyData: function(){
	//     return Session.get("myProtectionsPaginatedData");
	//   }
	// });
});