import './utilities.js'
import './threshold.js'

function StoreEntry(){
	this.proposerID;
	this.accepterID;
	this.proposer;
	this.accepter;
	this.proposerIsAbove;
	
	//event args
	this.aboveID;
	this.belowID;
	this.aboveOwner;
	this.belowOwner;
	
	this.thresholdPPTTH;
	this.end;
	this.start;
	this.location;
	this.makeStale;

	this.weiAsking;
	this.weiContributing;

	this.beneficiary;
	this.weiPayout;

	//calculated table entry values
	this.payoutText;
	this.askText;
	this.proposeText;
	this.startText;
	this.endText;

	//state
	this.state = {
		proposed:false
		,accepted:false
		,evaluationStarted:false
		,evaluated:false
	};
}

//table entry constructor, open proposals
function Entry(o){
	console.log("+++ new Entry",o)

	//threshold
  	let thresh = threshValsToText(!o.proposerIsAbove,o.thresholdPPTTH.toNumber());

	// button
  	let b = `${toEth(ask)}`;
  	let b1 = `<button type='button' class='action buyit tableBtn' value='${o.askText.v},${o.proposerID.toNumber()}'>Pay <span class="green-text">${o.askText.t} Eth</span> to accept</button>`;
  	//if no user is logged in
  	if(currentUser === -1){
    	b1 = `<button type='button' class='tableBtn'><span class="green-text">${o.askText.t} Eth</span></button>`;
  	}
  	//if the current use is the owner of the proposal don't give them the option to purchase the proposal
  	if(currentUser === o.proposer){
    	b = "1e99";
    	b1 = `<button type='button' class='tableBtn'>You are the owner of this proposal</button>`;
  	}

  	this.type = "bodyRow";
  	this.column = [
    	{type:"text",key:o.location,name:o.location}
    	,{type:"text",key:thresh,name:thresh}
    	,{type:"text",key:"NASA Rainfall",name:"NASA Rainfall"}
    	,{type:"num",key:o.startText.v,name:o.startText.t}
    	,{type:"num",key:o.endText.v,name:o.endText.t}
    	,{type:"num",key:o.payoutText.v,name:o.payoutText.t}
    	,{type:"num",key:b,name:b1}
    ];
}

//table entry constructor, my proposals
function MyEntry(o){
	//threshold
	let thresh = threshValsToText(o.proposerIsAbove,o.thresholdPPTTH.toNumber());

	//status
	let now = new Date().getTime();
	let start = new Date(o.start.toNumber()*1000).getTime();
	let end = new Date(o.end.toNumber()*1000).getTime();
	let status = "";
	let b = "";
	let b1 = "";

	if(now < start) status = "Waiting for partner";
	if(now >= start) status = "Stale";
	b = "";
	b1 = `<button type='button' class='action cancelit tableBtn'> Cancel and redeem <span class="green-text">${o.proposeText.t}</span></button>`;
	
	if(o.state.accepted){
		//acceptances and accepted proposals
		if(now >= start && now <= end){
		  status = "In term";
		  b = "Waiting";
		  b1 = "Waiting";
		}
		if(now > end){
		  status = "Waiting for evaluation";
		  b = "Evaluate"
		  b1 = `<button type='button' class='action evaluateit tableBtn' value=${o.proposerID.toNumber()}> Evaluate and complete </button>`;
		}
	}
	if(o.state.evaluated){

	}

	//create the object
	this.type = "bodyRow";
	//if you change the number or order of columns, you have to update the evaluation listener
	this.column = [
	  	{type:"text",key:o.location,name:o.location}
	  	,{type:"text",key:thresh,name:thresh}
	  	,{type:"text",key:"NASA Rainfall",name:"NASA Rainfall"}
    	,{type:"num",key:o.startText.v,name:o.startText.t}
    	,{type:"num",key:o.endText.v,name:o.endText.t}
	  	,{type:"num",key:o.proposeText.v,name:o.proposeText.t}
    	,{type:"num",key:o.payoutText.v,name:o.payoutText.t}
	  	,{type:"text",key:status,name:status}
	  	,{type:"text",key:b,name:b1}
	];
}

function MyAcceptance(o){
	//threshold
	let thresh = threshValsToText(!o.proposerIsAbove,o.thresholdPPTTH.toNumber());

	//status
	let now = new Date().getTime();
	let start = new Date(o.start.toNumber()*1000).getTime();
	let end = new Date(o.end.toNumber()*1000).getTime();
	let status = "";
	let b = "";
	let b1 = "";

    if(now < start){
      status = "Partnered, waiting to start";
      b1 = "Waiting"; 
    }
	if(now >= start && now <= end){
	  status = "In term";
	  b = "Waiting";
	  b1 = "Waiting";
	}
	if(now > end){
	  status = "Waiting for evaluation";
	  b = "Evaluate"
	  b1 = `<button type='button' class='action evaluateit tableBtn' value=${o.proposerID.toNumber()}> Evaluate and complete </button>`;
	}
	
	if(o.state.evaluated){

	}

	//create the object
	this.type = "bodyRow";
	//if you change the number or order of columns, you have to update the evaluation listener
	this.column = [
	  	{type:"text",key:o.location,name:o.location}
	  	,{type:"text",key:thresh,name:thresh}
	  	,{type:"text",key:"NASA Rainfall",name:"NASA Rainfall"}
    	,{type:"num",key:o.startText.v,name:o.startText.t}
    	,{type:"num",key:o.endText.v,name:o.endText.t}
	  	,{type:"num",key:o.askText.v,name:o.askText.t}
    	,{type:"num",key:o.payoutText.v,name:o.payoutText.t}
	  	,{type:"text",key:status,name:status}
	  	,{type:"text",key:b,name:b1}
	];
}

let witInstance, currentUser = -1;
let e = []; //event store

////////////////////////////////////
// populate store with event results
////////////////////////////////////

addInfoFromProposalCreated = function(r){
	console.log("+++++++++++++++++++++")
	//check for obj in eventStore
	let idx = findInStore(r.args.aboveID,r.args.belowID);
	if(typeof idx === "number"){
		if(e[idx].proposed){
			//duplicate event was fired
			//do nothing, don't update frontend
			console.log("+++ p duplicate")
			return false;
		}else{
			//update store with new info
			//pass by reference might be sufficient in this case
			e[idx] = fillDataProposalCreated(e[idx],r);
			console.log("+++ p update",e)
			return getStore();
		}
	}else{
		//create new obj for the event store
		let o = new StoreEntry();
		o = fillDataProposalCreated(o,r);
		e.push(o);
		console.log("+++ p new",e)
		return getStore();
	}	
}

function fillDataProposalCreated(o,r){
	//update store with new info
	if(r.args.aboveID.toNumber() === 0){
		o.belowID = r.args.belowID;
		o.belowOwner = getOwner(r.args.belowID);
		o.proposerID = o.belowID;
		o.proposer = o.belowOwner;
		o.proposerIsAbove = false;
	}
	if(r.args.belowID.toNumber() === 0){
		o.aboveID = r.args.aboveID;
		o.aboveOwner = getOwner(r.args.aboveID);
		o.proposerID = o.aboveID;
		o.proposer = o.aboveOwner;
		o.proposerIsAbove = true;		
	}
	
	o.thresholdPPTTH = r.args.thresholdPPTTH;
	o.end = r.args.end;
	o.start = r.args.start;
	o.location = r.args.location;
	o.makeStale = r.args.makeStale;

	o.weiAsking = r.args.weiAsking;
	o.weiContributing = r.args.weiContributing;
	o.payoutText = payoutText(o.weiAsking,o.weiContributing);
	o.askText = askText(o.weiAsking);
	o.proposeText = proposeText(o.weiContributing);
	o.startText = dateText(o.start);
	o.endText = dateText(o.end);

	o.state.proposed = true;
	return o;
}

addInfoFromProposalAccepted = function(r){
	console.log("+++++++++++++++++++++")
	//check for obj in eventStore
	let idx = findInStore(r.args.aboveID,r.args.belowID);
	if(typeof idx === "number"){
		if(e[idx].accepted){
			//duplicate event was fired
			//do nothing, don't update frontend
			console.log("+++ a duplicate")
			return false;
		}else{
			//update store with new info
			//pass by reference might be sufficient in this case
			e[idx] = fillDataProposalAccepted(e[idx],r);
			console.log("+++ a update",e)
			return getStore();
		}
	}else{
		//create new obj for the event store
		let o = new StoreEntry();
		o = fillDataProposalAccepted(o,r);
		e.push(o);
		console.log("+++ a new",e)
		return getStore();
	}		
}

function fillDataProposalAccepted(o,r){
	//update store with new info
	if(o.aboveID && r.args.aboveID.toNumber() !== o.aboveID.toNumber()) console.log("+++ error- id mismatch",r.args.aboveID.toNumber(),o.aboveID.toNumber());
	if(o.belowID && r.args.belowID.toNumber() !== o.belowID.toNumber()) console.log("+++ error- id mismatch",r.args.belowID.toNumber(),o.belowID.toNumber());
	o.belowID = r.args.belowID;
	o.belowOwner = getOwner(r.args.belowID);
	o.aboveID = r.args.aboveID;
	o.aboveOwner = getOwner(r.args.aboveID);

	o.state.accepted = true;
	return o;
}

addInfoFromEvaluationStart = function(r){
	
}

addInfoFromProposalEvaluated = function(r){
	console.log("+++++++++++++++++++++")
	//check for obj in eventStore
	let idx = findInStore(r.args.aboveID,r.args.belowID);
	if(typeof idx === "number"){
		if(e[idx].evaluated){
			//duplicate event was fired
			//do nothing, don't update frontend
			console.log("+++ e duplicate")
			return false;
		}else{
			//update store with new info
			//pass by reference might be sufficient in this case
			e[idx] = fillDataProposalEvaluated(e[idx],r);
			console.log("+++ e update",e)
			return getStore();
		}
	}else{
		//create new obj for the event store
		let o = new StoreEntry();
		o = fillDataProposalEvaluated(o,r);
		e.push(o);
		console.log("+++ e new",e)
		return getStore();
	}		
}

function fillDataProposalEvaluated(o,r){
	//update store with new info
	if(o.aboveID && r.args.aboveID.toNumber() !== o.aboveID.toNumber()) console.log("+++ error- id mismatch",r.args.aboveID.toNumber(),o.aboveID.toNumber());
	if(o.belowID && r.args.belowID.toNumber() !== o.belowID.toNumber()) console.log("+++ error- id mismatch",r.args.belowID.toNumber(),o.belowID.toNumber());
	o.belowID = r.args.belowID;
	o.belowOwner = r.args.belowOwner;
	o.aboveID = r.args.aboveID;
	o.aboveOwner = r.args.aboveOwner;

	o.beneficiary = r.args.beneficiary;
	o.weiPayout = r.args.weiPayout;

	o.state.evaluated = true;
	return o;
}

////////////////////////////////////
// entry helpers
////////////////////////////////////

function payoutText(weiAsking,weiContributing){
	let ask = toEth(weiAsking.toNumber())
	let propose = toEth(weiContributing.toNumber());
	let totalPayout = propose + ask;
	let totalPayoutText = `${clipNum(totalPayout)} Eth`;
	return {v:totalPayout,t:totalPayoutText};
}

function askText(weiAsking){
	let ask = toEth(weiAsking.toNumber());
	let askText = `${clipNum(ask)} Eth`;
	return {v:ask,t:askText};
}

function proposeText(weiContributing){
	let propose = toEth(weiContributing.toNumber());
	let proposeText = `${clipNum(propose)} Eth`;
	return {v:propose,t:proposeText};
}

let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function dateText(dObj){
	let iso = dObj.toNumber()*1000;
  	let d1 = new Date(iso).toISOString().substring(0,7);
  	let a = d1.split("-");
  	let n = parseInt(a[1]) - 1;
  	return {v:iso,t:`${months[n]} ${a[0]}`};
}

////////////////////////////////////
// return complete list of values to present
////////////////////////////////////

//TODO in this approach it reconstructs the list of openProposals and myProposal everytime there is a change
// a less niave approach would be to only change the ones that are update by the event
getStore = function(){
	let op = [], mp = [];
	let l = e.length;
	for(let i = 0; i < l; i++){
		if(e[i].state.proposed && !e[i].state.accepted && !e[i].state.evaluated){
			op.push(new Entry(e[i]));
			//if it is owned by current user
			if(currentUser === e[i].proposer) mp.push(new MyEntry(e[i]));
			if(currentUser === e[i].accepter) mp.push(new MyAcceptance(e[i]));
		} else if(e[i].state.proposed && e[i].state.accepted && !e[i].state.evaluated){
			//if it is owned by current user
			if(currentUser === e[i].proposer) mp.push(new MyEntry(e[i]));
			if(currentUser === e[i].accepter) mp.push(new MyAcceptance(e[i]));
		} else if(e[i].state.proposed && e[i].state.accepted && e[i].state.evaluated){
			//if it is owned by current user
			if(currentUser === e[i].proposer) mp.push(new MyEntry(e[i]));
			if(currentUser === e[i].accepter) mp.push(new MyAcceptance(e[i]));
		}
	}
	return {openProposals:op,myProposals:mp};
}

////////////////////////////////////
// assorted helper functions
////////////////////////////////////

setCurrentUser = function(){
	currentUser = user;
}

setWitInstance = function(inst){
	witInstance = inst;
}

// check for ID in eventStore
function findInStore(a,b){
	let oa = false, ob = false;
	let l = e.length;
	while(l--){
		if(e[l].aboveID){
			// console.log("+++",e[l].aboveID.toNumber(),a.toNumber())
			if(e[l].aboveID.toNumber() === a.toNumber()) return l;
		} 
		if(e[l].belowID){
			// console.log("+++",e[l].belowID.toNumber(),b.toNumber())
			if(e[l].belowID.toNumber() === b.toNumber()) return l;
		} 
	}
	return false;
}

async function getOwner(id){
	let owner = await promisify(cb => witInstance.ownerOf(id, cb));
	return owner;
}

// //table entry constructor open protections
// //event ProposalOffered(uint indexed WITID, uint aboveID, uint belowID, uint indexed weiContributing,  uint indexed weiAsking, address evaluator, uint thresholdPPTTH, string location, uint start, uint end, bool makeStale);
// function Entry(r,owner){
//   let a = r.args;
//   let location = "?"; 
//   let ask = a.weiAsking.toNumber();
//   let propose = a.weiContributing.toNumber();
//   let id = a.WITID.toNumber();

//   //update for if the contract is for offered for sale or for funding
//   let totalPayout = toEth(propose) + toEth(ask);
//   let totalPayoutText = `${clipNum(toEth(propose) + toEth(ask))} Eth`;

//   // button
//   let b = `${toEth(ask)}`;
//   let b1 = `<button type='button' class='action buyit tableBtn' value='${toEth(ask)},${a.WITID.toNumber()}'>Pay <span class="green-text">${clipNum(toEth(ask))} Eth</span> to accept</button>`;
//   //if no user is logged in
//   if(user[0] === -1){
//     b1 = `<button type='button' class='tableBtn' value='${toEth(ask)},${a.WITID.toNumber()}'><span class="green-text">${clipNum(toEth(ask))} Eth</span></button>`;
//   }
//   //if the current use is the owner of the proposal don't give them the option to purchase the proposal
//   if(owner === user[0]){
//     b = "1e99";
//     b1 = `<button type='button' class='tableBtn'>You are the owner of this proposal</button>`;
//   }

//   //get threshold text
//   let above = a.WITID.toNumber() === a.belowID.toNumber();
//   if(owner === user[0]) above = a.WITID.toNumber() !== a.belowID.toNumber();
//   let thresh = threshValsToText(above,a.thresholdPPTTH.toNumber());

//   //create the object
//   this.id = id;
//   this.type = "bodyRow";
//   this.column = [
//       {type:"text",key:location,name:location}
//       ,{type:"text",key:thresh,name:thresh}
//       ,{type:"text",key:"NASA Rainfall",name:"NASA Rainfall"}
//       ,{type:"num",key:a.start.toNumber()*1000,name:dateText(a.start.toNumber()*1000)}
//       ,{type:"num",key:a.end.toNumber()*1000,name:dateText(a.end.toNumber()*1000)}
//       ,{type:"num",key:totalPayout,name:totalPayoutText}
//       ,{type:"num",key:b,name:b1}
//     ];
// }

// //table entry constructor my protections
// //bool if you proposed the protection = true, if you accepted the protection = false
// function MyEntry(r,a,id,bool){
//   //is this entry an acceptance, an open proposal, or an accepted proposal
//   let acceptance = r.args !== a;
//   let acceptedProposal = false;
//   if(!acceptance){
//     if(acceptedList.indexOf(id) !== -1) acceptedProposal = true;
//   }

//   let ask = a.weiAsking.toNumber();
//   let propose = a.weiContributing.toNumber();
//   let location = "?"; 

//   //total payouts
//   let totalPayout = toEth(propose) + toEth(ask);
//   let totalPayoutText = `${clipNum(toEth(propose) + toEth(ask))} Eth`;

//   //your contribution
//   let v;
//   if(acceptance) v = toEth(ask);
//   else v = toEth(propose);
//   let yourContr = v;
//   let yourContrText = `${clipNum(v)} Eth`;

//   //status
//   let now = new Date().getTime();
//   let start = new Date(a.start.toNumber()*1000).getTime();
//   let end = new Date(a.end.toNumber()*1000).getTime();
//   let status = "";
//   let b = "";
//   let b1 = "";

//   if(acceptance || acceptedProposal){
//     //acceptances and accepted proposals
//     if(now < start){
//       status = "Partnered, waiting to start";
//       b1 = "Waiting"; //`<button type='button' class='action cancelit tableBtn'> Cancel and redeem <span class="green-text">${yourContr}</span></button>`;
//     }
//     if(now >= start && now <= end){
//       status = "In term";
//       b = "Waiting";
//       b1 = "Waiting";
//     }
//     if(now > end){
//       status = "Waiting for evaluation";
//       b = "Evaluate"
//       b1 = `<button type='button' class='action evaluateit tableBtn' value=${id}> Evaluate and complete </button>`;
//     }
//   }else{
//     //not accepted proposal
//     if(now < start) status = "Waiting for partner";
//     if(now >= start) status = "Stale";
//     b = "";
//     b1 = `<button type='button' class='action cancelit tableBtn'> Cancel and redeem <span class="green-text">${yourContrText}</span></button>`;
//   }

//   //get threshold text
//   let thresh;
//   if(acceptance) thresh = threshValsToText(a.WITID.toNumber() === a.belowID.toNumber(),a.thresholdPPTTH.toNumber());
//   else thresh = threshValsToText(a.WITID.toNumber() !== a.belowID.toNumber(),a.thresholdPPTTH.toNumber());

//   //create the object
//   this.id = r.args.WITID.toNumber();
//   this.type = "bodyRow";
//   //if you change the number or order of columns, you have to update the evaluation listener
//   this.column = [
//       {type:"text",key:location,name:location}
//       ,{type:"text",key:thresh,name:thresh}
//       ,{type:"text",key:"NASA Rainfall",name:"NASA Rainfall"}
//       ,{type:"num",key:a.start.toNumber()*1000,name:dateText(a.start.toNumber()*1000)}
//       ,{type:"num",key:a.end.toNumber()*1000,name:dateText(a.end.toNumber()*1000)}
//       ,{type:"num",key:yourContr,name:yourContrText}
//       ,{type:"num",key:totalPayout,name:totalPayoutText}
//       ,{type:"text",key:status,name:status}
//       ,{type:"text",key:b,name:b1}
//     ];
// }

