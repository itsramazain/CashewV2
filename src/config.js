
export const TRADEVAULT_ADDRESS = "0x806924EF4EabB930BCe0CB308f7Ed25B0A47Bd82";
export const TRADEVAULT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradeId",
        "type": "uint256"
      }
    ],
    "name": "TradeCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tradeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "partyA",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "partyB",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountA",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountB",
        "type": "uint256"
      }
    ],
    "name": "TradeCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_partyB",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amountA",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amountB",
        "type": "uint256"
      }
    ],
    "name": "createTrade",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tradeId",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tradeId",
        "type": "uint256"
      }
    ],
    "name": "getTrade",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "partyA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "partyB",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountB",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "depositedA",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "depositedB",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          }
        ],
        "internalType": "struct TradeVault.Trade",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tradeCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "trades",
    "outputs": [
      {
        "internalType": "address",
        "name": "partyA",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "partyB",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountA",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountB",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "depositedA",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "depositedB",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
export const HEDERA_NETWORK = "testnet";
export const HEDERA_RPC = "https://testnet.hashio.io/api";
export const TREASURY_EVM_ADDRESS = "0x3447573f325DbC9bb7Cc740a3a603e550feD4C206";
