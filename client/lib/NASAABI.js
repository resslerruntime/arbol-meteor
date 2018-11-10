NASAABI = [
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
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "key",
          "type": "string"
        },
        {
          "indexed": false,
          "name": "result",
          "type": "string"
        },
        {
          "indexed": false,
          "name": "remainingGas",
          "type": "uint256"
        }
      ],
      "name": "gotNASACHIRPSCallback",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "precipScript",
          "type": "string"
        },
        {
          "indexed": false,
          "name": "WITID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "num_averaged_years",
          "type": "uint256"
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
          "name": "thresholdFactorPPTTH",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "location",
          "type": "string"
        }
      ],
      "name": "sentNASACHIRPSOraclizeComputation",
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
      "constant": false,
      "inputs": [
        {
          "name": "WITID",
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
          "name": "thresholdFactorPPTTH",
          "type": "uint256"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "num_averaged_years",
          "type": "uint256"
        },
        {
          "name": "runtimeParams",
          "type": "string"
        }
      ],
      "name": "evaluateWIT",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "myid",
          "type": "bytes32"
        },
        {
          "name": "result",
          "type": "string"
        }
      ],
      "name": "__callback",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "myid",
          "type": "bytes32"
        },
        {
          "name": "result",
          "type": "string"
        },
        {
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "__callback",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "setLocalOAR",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "scriptHash",
          "type": "string"
        }
      ],
      "name": "updateIPFSMultihash",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getNameAndDescription",
      "outputs": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "pure",
      "type": "function"
    }
  ];