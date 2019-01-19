 WITABI = [
    {
      "constant": true,
      "inputs": [
        {
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "name": "",
          "type": "bool"
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
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
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
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
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
      "inputs": [
        {
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "SYSTEM_FEE_WALLET",
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
          "name": "tokenId",
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
          "name": "to",
          "type": "address"
        },
        {
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "theOwner",
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
      "name": "arbolcoin",
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
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "SYSTEM_FEE_PPM",
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
      "name": "stableERC20",
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
        },
        {
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "name": "",
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
          "name": "witID",
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
          "name": "rating",
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
          "name": "witID",
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
          "name": "rating",
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
          "indexed": true,
          "name": "witID",
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
        },
        {
          "indexed": false,
          "name": "rating",
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
          "name": "witID",
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
          "name": "witID",
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
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "tokenId",
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
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "tokenId",
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
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
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
          "name": "stableERC20Address",
          "type": "address"
        },
        {
          "name": "useTestMode",
          "type": "bool"
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
          "name": "rating",
          "type": "uint256"
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
          "name": "witID",
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
    }
  ];