window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.log("web3 from current provider: ",web3.currentProvider.constructor.name)
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
  }

  // Now you can start your app & access web3 freely:
  testTokens();
})

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

async function testTokens() {
  console.log("testTokens");

  const testCropAbi = [
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_from",
            "type": "address"
          },
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "INITIAL_SUPPLY",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "name": "",
            "type": "uint8"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_subtractedValue",
            "type": "uint256"
          }
        ],
        "name": "decreaseApproval",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_addedValue",
            "type": "uint256"
          }
        ],
        "name": "increaseApproval",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          },
          {
            "name": "_spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      }
    ];
  const testWitAbi = [
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "weatherAPIs",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_tokenId",
            "type": "uint256"
          }
        ],
        "name": "approvedFor",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "tokensOf",
        "outputs": [
          {
            "name": "",
            "type": "uint256[]"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_tokenId",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "WITs",
        "outputs": [
          {
            "name": "weiEscrow",
            "type": "uint256"
          },
          {
            "name": "weiPartnerEscrow",
            "type": "uint256"
          },
          {
            "name": "index",
            "type": "string"
          },
          {
            "name": "threshold",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "partnerID",
            "type": "uint256"
          },
          {
            "name": "start",
            "type": "uint256"
          },
          {
            "name": "end",
            "type": "uint256"
          },
          {
            "name": "makeStale",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_tokenId",
            "type": "uint256"
          }
        ],
        "name": "takeOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "systemFeePPM",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_cropAddress",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "tokenID",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "user",
            "type": "address"
          }
        ],
        "name": "Redemption",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "tokenIDProposer",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "tokenIDAccepter",
            "type": "uint256"
          }
        ],
        "name": "ProposalAccepted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "tokenID",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "weiContributing",
            "type": "uint256"
          },
          {
            "indexed": true,
            "name": "weiAsking",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "index",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "threshold",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "location",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "start",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "end",
            "type": "uint256"
          }
        ],
        "name": "ProposalOffered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "one",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "two",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "three",
            "type": "uint256"
          }
        ],
        "name": "Debug",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_approved",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "weiContributing",
            "type": "uint256"
          },
          {
            "name": "weiAsking",
            "type": "uint256"
          },
          {
            "name": "index",
            "type": "string"
          },
          {
            "name": "threshold",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "start",
            "type": "uint256"
          },
          {
            "name": "end",
            "type": "uint256"
          },
          {
            "name": "makeStale",
            "type": "bool"
          }
        ],
        "name": "createWITProposal",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "proposalID",
            "type": "uint256"
          }
        ],
        "name": "createWITAcceptance",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "ping",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "weiContributing",
            "type": "uint256"
          },
          {
            "name": "weiAsking",
            "type": "uint256"
          }
        ],
        "name": "calculateFee",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "name": "addWeatherAPI",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "fee",
            "type": "uint256"
          }
        ],
        "name": "setSystemFee",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "tokenID",
            "type": "uint256"
          }
        ],
        "name": "cancelAndRedeem",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

  const witAddress  = "0xf25186b5081ff5ce73482ad761db0eb0d25abfbf";
  const cropAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";
  const testUser    = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
  const testUser2   = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

  const testCropContract = web3.eth.contract(testCropAbi);
  const cropInstance = testCropContract.at(cropAddress);
  const testWitContract = web3.eth.contract(testWitAbi);
  const witInstance = testWitContract.at(witAddress);

  console.log("testCrop")
  console.log(testCropAbi)
  console.log(testCropContract)
  console.log(cropInstance)
  console.log("testWit")
  console.log(testWitAbi)
  console.log(testWitContract)
  console.log(witInstance)

  const ethPropose = 9000;
  const ethAsk = 1000;

  const one_month_from_now = new Date();
  const two_months_from_now = new Date();

  let wei, wei2, bb2, beforeBalance;
  let checkAllowance, beforeAllowance;
  let ap, approval;
  let chkAl, afterAllowance1, afterAllowance2;
  let createWit;
  let sup, supply;
  let cropBal, cropBal2, cropBalance, cropBalance2;
  let aftBal, afterBalance;
  let ownr, owner;

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
  try {
    beforeBalance = web3.fromWei(await wei, 'ether');
    bb2 = web3.fromWei(await wei2, 'ether');
    console.log("WIT Balance: ",beforeBalance + " ETH")
    console.log("User Balance: ",bb2 + " ETH");
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
    cropBalance = await cropBal;
    cropBalance2 = await cropBal2;
    console.log("CROP Balance testUser",cropBalance)
    console.log("CROP Balance testUser2",cropBalance2)
    afterBalance = await aftBal;
    console.log("afterBalance",afterBalance-ethPropose,beforeBalance)
    owner = await ownr;
    // console.log("owner",testUser,owner)
  } catch (error) {
    console.log("!!! ERROR - EXIT TestTokens !!!");
    console.log(error)
  }
}
