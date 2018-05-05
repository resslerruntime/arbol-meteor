DONUTABI = [
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
      "constant": true,
      "inputs": [
        {
          "name": "record",
          "type": "bytes32"
        }
      ],
      "name": "getUIntValue",
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
          "name": "record",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "setUIntValue",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "record",
          "type": "bytes32"
        }
      ],
      "name": "getStringValue",
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
          "name": "record",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "string"
        }
      ],
      "name": "setStringValue",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "record",
          "type": "bytes32"
        }
      ],
      "name": "getAddressValue",
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
          "name": "record",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "address"
        }
      ],
      "name": "setAddressValue",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "record",
          "type": "bytes32"
        }
      ],
      "name": "getBytes32Value",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
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
          "name": "record",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "bytes32"
        }
      ],
      "name": "setBytes32Value",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "record",
          "type": "bytes32"
        }
      ],
      "name": "getBytesValue",
      "outputs": [
        {
          "name": "",
          "type": "bytes"
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
          "name": "record",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "bytes"
        }
      ],
      "name": "setBytesValue",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "record",
          "type": "bytes32"
        }
      ],
      "name": "getBooleanValue",
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
          "name": "record",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "bool"
        }
      ],
      "name": "setBooleanValue",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "record",
          "type": "bytes32"
        }
      ],
      "name": "getIntValue",
      "outputs": [
        {
          "name": "",
          "type": "int256"
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
          "name": "record",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "int256"
        }
      ],
      "name": "setIntValue",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
