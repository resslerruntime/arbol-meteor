WITABI = [{
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
      "constant": false,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
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
      "constant": true,
      "inputs": [],
      "name": "owner",
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
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "aboveID",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "belowID",
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
          "name": "thresholdPPM",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "location",
          "type": "bytes32"
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
          "indexed": false,
          "name": "",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "debug",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "evaluationResult",
          "type": "string"
        },
        {
          "indexed": false,
          "name": "weiPayout",
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
          "indexed": false,
          "name": "",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "debug",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "",
          "type": "string"
        }
      ],
      "name": "debug",
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
          "indexed": false,
          "name": "one",
          "type": "uint256"
        }
      ],
      "name": "debug",
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
          "name": "_arbolAddress",
          "type": "address"
        },
        {
          "name": "storageAddress",
          "type": "address"
        },
        {
          "name": "NOAAPrecipAggregate",
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
          "name": "thresholdPPM",
          "type": "uint256"
        },
        {
          "name": "location",
          "type": "bytes32"
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
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "asdf",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
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
      "name": "transferOwnershipOfDependants",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
