require("@nomiclabs/hardhat-ethers");

const dotenv = require("dotenv");
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hedera",
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hedera: {
      url: process.env.HEDERA_RPC,
      chainId: parseInt(process.env.CHAIN_ID),
      accounts: [process.env.OPERATOR_KEY],
      type: "http",
      timeout: 60000,
    },
    hederaTestnet: {
      url: process.env.HEDERA_RPC || "https://testnet.hashio.io/api",
      chainId: Number(process.env.CHAIN_ID) || 296,
      accounts: [process.env.OPERATOR_KEY], // your MetaMask private key (0x...)
    },
  },
};
