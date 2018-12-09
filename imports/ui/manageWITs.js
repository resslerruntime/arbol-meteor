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

	this.weiAsking;			//amount of wei asked for by the proposing party
	this.weiContributing;	//amount of wei contributed by the proposing party

	this.invoker;			//user who invoked the evaluation

	this.beneficiary;		//user that received the total payout
	this.weiPayout;			//total payout that was received

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
		,invoked:false
		,evaluated:false
	};
}

//table entry constructor, open proposals
function Entry(o){
	// console.log("+++ new Entry",o)
	let currentUser = Session.get("user");

	//threshold
  	let thresh = threshValsToText(!o.proposerIsAbove,o.thresholdPPTTH.toNumber());

	// button
  	let b = `${o.askText.v}`;
  	let b1 = `<button type='button' class='action buyit tableBtn' value='${o.askText.v},${o.proposerID.toNumber()}'>Pay <span class="green-text">${o.askText.t}</span> to accept</button>`;
  	//if no user is logged in
  	if(currentUser === -1){
    	b1 = `<button type='button' class='tableBtn'><span class="green-text">${o.askText.t}</span></button>`;
  	}
  	//if the current use is the owner of the proposal don't give them the option to purchase the proposal
  	if(currentUser === o.proposer){
    	b = "1e99";
    	b1 = `<button type='button' class='tableBtn'>You are the owner of this proposal</button>`;
  	}
  	console.log("&&&",o.proposerID.toNumber(),b1)

  	this.type = "bodyRow";
  	this.column = [
    	{type:"text",key:o.location,name:o.locationText.t}
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
	let currentUser = Session.get("user");
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
		  b1 = `<button type='button' class='action evaluateit tableBtn' value=${o.proposerID.toNumber()}>Evaluate and complete</button>`;
		}
	}

	if(o.state.invoked){
		if(currentUser === o.invoker) status = "You initiated evaluation";
		else status = "Accepter initiated evaluation";
		b = "Waiting";
		b1 = "Waiting";
	}

	if(o.state.evaluated){
		console.log("<> evaluated",o)
	  	if(currentUser === o.beneficiary) status = `You received <span class="green-text">${o.proposeText.t}</span>`;
	  	else status = "You did not receive the payout";
	  	b = "Completed";
	  	b1 = `<button type='button' class='action downloadit tableBtn'>Download receipt</button>`;
	}

	//create the object
	this.type = "bodyRow";
	//if you change the number or order of columns, you have to update the evaluation listener
	this.column = [
	  	{type:"text",key:o.location,name:o.locationText.t}
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
	let currentUser = Session.get("user");
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
		console.log("+++E",o.proposerID.toNumber(),o.accepterID.toNumber(),b1);
	}

	if(o.state.invoked){
		if(currentUser === o.invoker) status = "You initiated evaluation";
		else status = "Proposer initiated evaluation";
		b = "Waiting";
		b1 = "Waiting";
	}
	
	if(o.state.evaluated){
		console.log("<> evaluated",o)
	  	if(currentUser === o.beneficiary) status = `You received <span class="green-text">${o.proposeText.t}</span>`;
	  	else status = "You did not receive the payout";
	  	b = "Completed";
	  	b1 = `<button type='button' class='action downloadit tableBtn'>Download receipt</button>`;
	}

	//create the object
	this.type = "bodyRow";
	//if you change the number or order of columns, you have to update the evaluation listener
	this.column = [
	  	{type:"text",key:o.locationText.t,name:o.locationText.t}
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

let witInstance;
let e = []; //event store

////////////////////////////////////
// populate store with event results
////////////////////////////////////

let proposalReceived = false
	,acceptanceReceived = false
	,invocationReceived = false
	,evaluationReceived = false
	,timedRelease = false;

resetReception = function(){
	proposalReceived = false;
	acceptanceReceived = false;
	invocationReceived = false;
	evaluationReceived = false;
	timedRelease = false;	
}

addInfoFromProposalCreated = function(r){
	console.log("+++++++++++++++++++++",r)
	proposalReceived = true;
	//check for obj in eventStore
	let idx = findInStore(r.args.aboveID,r.args.belowID);
	if(typeof idx === "number"){
		if(e[idx].proposed){
			//duplicate event was fired
			//do nothing, don't update frontend
			console.log("+++= p duplicate")
			return false;
		}else{
			//update store with new info
			//pass by reference might be sufficient in this case
			e[idx] = fillDataProposalCreated(e[idx],r);
			console.log("+++= p update",r.args.WITID.toNumber(),e.length)
			return getStore();
		}
	}else{
		//create new obj for the event store
		let o = new StoreEntry();
		o = fillDataProposalCreated(o,r);
		e.push(o);
		console.log("+++= p new",r.args.WITID.toNumber(),e.length)
		return getStore();
	}	
}

function fillDataProposalCreated(o,r){
	if(o.aboveID && r.args.aboveID.toNumber() && r.args.aboveID.toNumber() !== o.aboveID.toNumber()) console.log("+++ error- above id mismatch",r.args.aboveID.toNumber(),o.aboveID.toNumber());
	if(o.belowID && r.args.belowID.toNumber() && r.args.belowID.toNumber() !== o.belowID.toNumber()) console.log("+++ error- below id mismatch",r.args.belowID.toNumber(),o.belowID.toNumber());
	if(o.aboveOwner && r.args.aboveID.toNumber() && r.args.aboveOwner !== o.aboveOwner) console.log("+++ error- above owner mismatch",r.args.aboveOwner,o.aboveOwner);
	if(o.belowOwner && r.args.belowID.toNumber() && r.args.belowOwner !== o.belowOwner) console.log("+++ error- below owner mismatch",r.args.belowOwner,o.belowOwner);
	
	//update store with new info
	if(r.args.aboveID.toNumber() === 0){
		o.belowID = r.args.belowID;
		o.belowOwner = r.args.belowOwner;
		o.proposerID = o.belowID;
		o.proposer = o.belowOwner;
		o.proposerIsAbove = false;
	}
	if(r.args.belowID.toNumber() === 0){
		o.aboveID = r.args.aboveID;
		o.aboveOwner = r.args.aboveOwner;
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
	o.locationText = locationText(o.location)

	o.state.proposed = true;
	return o;
}

addInfoFromProposalAccepted = function(r){
	console.log("+++++++++++++++++++++",r)
	acceptanceReceived = true;
	//check for obj in eventStore
	let idx = findInStore(r.args.aboveID,r.args.belowID);
	if(typeof idx === "number"){
		if(e[idx].accepted){
			//duplicate event was fired
			//do nothing, don't update frontend
			console.log("+++= a duplicate")
			return false;
		}else{
			//update store with new info
			//pass by reference might be sufficient in this case
			e[idx] = fillDataProposalAccepted(e[idx],r);
			console.log("+++= a update",r.args.WITID.toNumber(),e.length)
			return getStore();
		}
	}else{
		//create new obj for the event store
		let o = new StoreEntry();
		o = fillDataProposalAccepted(o,r);
		e.push(o);
		console.log("+++= a new",r.args.WITID.toNumber(),e.length)
		return getStore();
	}		
}

function fillDataProposalAccepted(o,r){
	//update store with new info
	if(o.aboveID && r.args.aboveID.toNumber() !== o.aboveID.toNumber()) console.log("+++ error- above id mismatch",r.args.aboveID.toNumber(),o.aboveID.toNumber());
	if(o.belowID && r.args.belowID.toNumber() !== o.belowID.toNumber()) console.log("+++ error- below id mismatch",r.args.belowID.toNumber(),o.belowID.toNumber());
	if(o.aboveOwner && r.args.aboveOwner !== o.aboveOwner) console.log("+++ error- above owner mismatch",r.args.aboveOwner,o.aboveOwner);
	if(o.belowOwner && r.args.belowOwner !== o.belowOwner) console.log("+++ error- below owner mismatch",r.args.belowOwner,o.belowOwner);
	o.belowID = r.args.belowID;
	o.belowOwner = r.args.belowOwner;
	o.aboveID = r.args.aboveID;
	o.aboveOwner = r.args.aboveOwner;

	//add proposer and accepter
	if(o.belowID.toNumber() === r.args.WITID.toNumber()){
		o.accepter = o.aboveOwner;
		o.accepterID = o.aboveID;
		o.proposer = o.belowOwner
		o.proposerID = o.belowID;
		o.proposerIsAbove = false;
	}
	if(o.aboveID.toNumber() === r.args.WITID.toNumber()){
		o.accepter = o.belowOwner;
		o.accepterID = o.belowID;
		o.proposer = o.aboveOwner
		o.proposerID = o.aboveID;	
		o.proposerIsAbove = true;
	}

	//double check vals if over writing from proposal or vice versa?
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
	o.locationText = locationText(o.location)

	o.state.accepted = true;
	return o;
}

addInfoFromEvaluationInvoked = function(r){
	console.log("+++++++++++++++++++++",r)
	invocationReceived = true;
	//check for obj in eventStore
	let idx = findInStore(r.args.WITID,r.args.WITID);
	if(typeof idx === "number"){
		if(e[idx].evaluated){
			//duplicate event was fired
			//do nothing, don't update frontend
			console.log("+++= se duplicate")
			return false;
		}else{
			//update store with new info
			//pass by reference might be sufficient in this case
			e[idx] = fillDataEvaluationInvoked(e[idx],r);
			console.log("+++= se update",r.args.WITID.toNumber(),e.length)
			return getStore();
		}
	}else{
		//create new obj for the event store
		let o = new StoreEntry();
		o = fillDataEvaluationInvoked(o,r);
		e.push(o);
		console.log("+++= se new",r.args.WITID.toNumber(),e.length)
		return getStore();
	}	
}

function fillDataEvaluationInvoked(o,r){

	o.invoker = r.args.invoker;

	o.state.invoked = true;
	return o;
}

addInfoFromProposalEvaluated = function(r){
	console.log("+++++++++++++++++++++",r)
	evaluationReceived = true;
	//check for obj in eventStore
	let idx = findInStore(r.args.aboveID,r.args.belowID);
	if(typeof idx === "number"){
		if(e[idx].evaluated){
			//duplicate event was fired
			//do nothing, don't update frontend
			console.log("+++= e duplicate")
			return false;
		}else{
			//update store with new info
			//pass by reference might be sufficient in this case
			e[idx] = fillDataProposalEvaluated(e[idx],r);
			console.log("+++= e update",r.args.WITID.toNumber(),e.length)
			return getStore();
		}
	}else{
		//create new obj for the event store
		let o = new StoreEntry();
		o = fillDataProposalEvaluated(o,r);
		e.push(o);
		console.log("+++= e new",r.args.WITID.toNumber(),e.length)
		return getStore();
	}		
}

function fillDataProposalEvaluated(o,r){
	//update store with new info
	if(o.aboveID && r.args.aboveID.toNumber() !== o.aboveID.toNumber()) console.log("+++ error- above id mismatch",r.args.aboveID.toNumber(),o.aboveID.toNumber());
	if(o.belowID && r.args.belowID.toNumber() !== o.belowID.toNumber()) console.log("+++ error- below id mismatch",r.args.belowID.toNumber(),o.belowID.toNumber());
	if(o.aboveOwner && r.args.aboveOwner !== o.aboveOwner) console.log("+++ error- above owner mismatch",r.args.aboveOwner,o.aboveOwner);
	if(o.belowOwner && r.args.belowOwner !== o.belowOwner) console.log("+++ error- below owner mismatch",r.args.belowOwner,o.belowOwner);
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
	let ask = weiAsking.toNumber()
	let propose = weiContributing.toNumber();
	let totalPayout = propose + ask;
	let totalPayoutText = `${clipNum(toEth(totalPayout))} hUSD`;
	return {v:totalPayout,t:totalPayoutText};
}

function askText(weiAsking){
	let ask = weiAsking.toNumber();
	let askText = `${clipNum(toEth(ask))} hUSD`;
	return {v:ask,t:askText};
}

function proposeText(weiContributing){
	let propose = weiContributing.toNumber();
	let proposeText = `${clipNum(toEth(propose))} hUSD`;
	return {v:propose,t:proposeText};
}

function locationText(location){
	let l = location.split("&")[0].split(",");
	return {t:`${Math.round(parseFloat(l[0])*10)/10},${Math.round(parseFloat(l[1])*10)/10}`}
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
	if(proposalReceived && acceptanceReceived && invocationReceived && evaluationReceived){
		return buildStore();
	} else {
		return {openProposals:[],myProposals:[]};	
	} 
}

function buildStore(){
	console.log("+++? get store", e.length,proposalReceived,acceptanceReceived,invocationReceived,evaluationReceived)
	let op = [], mp = [], currentUser = Session.get("user");
	let l = e.length;
	for(let i = 0; i < l; i++){
		if(e[i].state.proposed || e[i].state.accepted) console.log("+++?",i,currentUser,e[i].proposer,e[i].accepter)
		//have to add in time filter, only add to open proposals if start date hasn't passed already
		if(e[i].state.proposed && !e[i].state.accepted && !e[i].state.invoked && !e[i].state.evaluated){
			op.push(new Entry(e[i]));
		}
		if(e[i].state.proposed || e[i].state.accepted){
			if(currentUser === e[i].proposer) mp.push(new MyEntry(e[i]));
			if(currentUser === e[i].accepter) mp.push(new MyAcceptance(e[i]));
		}
	}
	console.log("+++? list",op,mp)
	return {openProposals:op,myProposals:mp};
}

////////////////////////////////////
// assorted helper functions
////////////////////////////////////

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
	try {
		let owner = await promisify(cb => witInstance.ownerOf(id, cb));
		return owner;
  	} catch (error) {
    	console.log(error);
  	}
}

