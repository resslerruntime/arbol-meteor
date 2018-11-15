 WITABI = [
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
          "name": "tokenID",
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
          "name": "owner",
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
      "name": "the_owner",
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
      "constant": false,
      "inputs": [
        {
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "aboveID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "belowID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "aboveOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "belowOwner",
          "type": "address"
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
          "name": "evaluator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "thresholdPPTTH",
          "type": "uint256"
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
        },
        {
          "indexed": false,
          "name": "makeStale",
          "type": "bool"
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
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "aboveID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "belowID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "aboveOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "belowOwner",
          "type": "address"
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
          "name": "evaluator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "thresholdPPTTH",
          "type": "uint256"
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
        },
        {
          "indexed": false,
          "name": "makeStale",
          "type": "bool"
        }
      ],
      "name": "ProposalOffered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "aboveOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "belowOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "beneficiary",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "weiPayout",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "aboveID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "belowID",
          "type": "uint256"
        }
      ],
      "name": "WITEvaluated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "amountRedeemed",
          "type": "uint256"
        }
      ],
      "name": "WITCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "numDependants",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "balance",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "recepientOfEscrow",
          "type": "address"
        }
      ],
      "name": "ContractDecomissioned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "invoker",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "evaluator",
          "type": "address"
        }
      ],
      "name": "WITEvaluationInvoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "thingThatHappened",
          "type": "string"
        }
      ],
      "name": "WeirdThingHappened",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
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
          "name": "arbolAddress",
          "type": "address"
        },
        {
          "name": "storageAddress",
          "type": "address"
        },
        {
          "name": "NOAAPrecipAggregate",
          "type": "address"
        },
        {
          "name": "NASA",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
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
          "name": "aboveOrBelow",
          "type": "bool"
        },
        {
          "name": "evaluator",
          "type": "address"
        },
        {
          "name": "thresholdPPTTH",
          "type": "uint256"
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
      "inputs": [
        {
          "name": "tokenID",
          "type": "uint256"
        },
        {
          "name": "runtimeParams",
          "type": "string"
        }
      ],
      "name": "evaluate",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "WITID",
          "type": "uint256"
        },
        {
          "name": "outcome",
          "type": "string"
        }
      ],
      "name": "evaluatorCallback",
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
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "dependant",
          "type": "address"
        }
      ],
      "name": "addDependant",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "decomission",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];