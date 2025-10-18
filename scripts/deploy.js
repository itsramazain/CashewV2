/**
 * Hybrid Hedera deployment + HBAR sender script (ethers v5).
 *
 * Features:
 *  - Send HBAR using Hedera SDK
 *  - Deploy TradeVault.sol to Hedera EVM (via Hardhat + ethers v5)
 *  - Automatically write ABI + address + TREASURY_EVM_ADDRESS to /src/config.js
 *
 * Required .env:
 *   OPERATOR_ID=0.0.x
 *   OPERATOR_KEY=0x<hex>     // your private key
 *   CHAIN_ID=296
 *   HEDERA_RPC=https://testnet.hashio.io/api
 * Optional:
 *   TARGET_ACCOUNT_ID=0.0.x
 *   AMOUNT_HBAR=5
 *   TREASURY_EVM_ADDRESS=0x...  // optional
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const hre = require("hardhat"); // provides ethers v5 in hre.ethers
const {
  Client,
  PrivateKey,
  TransferTransaction,
  Hbar,
} = require("@hashgraph/sdk");

// ----- ENV -----
const OPERATOR_ID = (process.env.OPERATOR_ID || "").trim();
const OPERATOR_KEY = (process.env.OPERATOR_KEY || "").trim();
const TARGET = (process.env.TARGET_ACCOUNT_ID || "").trim();
const AMOUNT = Number(process.env.AMOUNT_HBAR || 0);
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;
const HEDERA_RPC = import.meta.env.VITE_HEDERA_RPC;

const TREASURY_EVM_ADDRESS = (process.env.TREASURY_EVM_ADDRESS || "").trim();

// ----- HELPERS -----
function networkFromChainId(id) {
  if (id === 295) return "mainnet";
  if (id === 296) return "testnet";
  return "previewnet";
}
const HEDERA_NETWORK = networkFromChainId(CHAIN_ID);

function parsePrivateKeyHex(hexKey) {
  const cleaned = hexKey.startsWith("0x") ? hexKey : "0x" + hexKey;
  return PrivateKey.fromStringECDSA(cleaned);
}

function isHederaAccountId(v) {
  return /^\d+\.\d+\.\d+$/.test(v);
}

// ----- VALIDATIONS -----
if (!OPERATOR_ID || !OPERATOR_KEY) {
  throw new Error("Missing OPERATOR_ID or OPERATOR_KEY in .env");
}
if (!isHederaAccountId(OPERATOR_ID)) {
  throw new Error(`OPERATOR_ID must look like 0.0.x — got: ${OPERATOR_ID}`);
}
if (!HEDERA_RPC) {
  throw new Error("Missing HEDERA_RPC in .env");
}

// ----- SEND HBAR (Hedera SDK) -----
async function sendHbar() {
  if (!isHederaAccountId(TARGET)) {
    throw new Error(`TARGET_ACCOUNT_ID must look like 0.0.x — got: ${TARGET}`);
  }
  if (!AMOUNT || AMOUNT <= 0) {
    throw new Error(`AMOUNT_HBAR must be a positive number — got: ${AMOUNT}`);
  }

  const privateKey = parsePrivateKeyHex(OPERATOR_KEY);
  const client = Client.forName(HEDERA_NETWORK);
  client.setOperator(OPERATOR_ID, privateKey);

  console.log(`Sending ${AMOUNT} HBAR from ${OPERATOR_ID} → ${TARGET} ...`);

  const tx = await new TransferTransaction()
    .addHbarTransfer(OPERATOR_ID, new Hbar(-AMOUNT))
    .addHbarTransfer(TARGET, new Hbar(AMOUNT))
    .freezeWith(client)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`✅ Transfer status: ${receipt.status.toString()}`);
  console.log(`Tx ID: ${tx.transactionId.toString()}`);
}

// ----- DEPLOY CONTRACT (Hardhat + ethers v5) -----
async function deployTradeVault() {
  const { ethers } = hre; // ethers v5
  console.log(`Network: ${HEDERA_NETWORK} (${HEDERA_RPC})`);
  console.log("Deploying TradeVault to Hedera EVM...");

  // Provider + wallet (ethers v5 API)
  const provider = new ethers.providers.JsonRpcProvider(HEDERA_RPC);
  const wallet = new ethers.Wallet(OPERATOR_KEY, provider);

  // Load compiled artifact
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/TradeVault.sol/TradeVault.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Contract factory (v5)
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const contract = await factory.deploy();
  await contract.deployed(); // v5 wait
  const address = contract.address;

  console.log(`✅ TradeVault deployed at: ${address}`);

  // Write ABI + address to frontend config
  const configPath = path.join(__dirname, "../src/config.js");
  const content = `
export const TRADEVAULT_ADDRESS = "${address}";
export const TRADEVAULT_ABI = ${JSON.stringify(artifact.abi, null, 2)};
export const HEDERA_NETWORK = "${HEDERA_NETWORK}";
export const HEDERA_RPC = "${HEDERA_RPC}";
export const TREASURY_EVM_ADDRESS = "${
    TREASURY_EVM_ADDRESS || "0x3447573f325DbC9bb7Cc740a3a603e550feD4C206"
  }";
`;
  fs.writeFileSync(configPath, content, "utf8");
  console.log(
    `📝 Wrote contract address, ABI, and treasury address to ${configPath}`
  );
}

// ----- MAIN -----
(async () => {
  console.log(`Network: ${HEDERA_NETWORK} (chain ${CHAIN_ID})`);

  const action = process.argv[2];
  if (action === "send") {
    await sendHbar();
  } else {
    await deployTradeVault();
  }
  console.log("✅ Done.");
})().catch((e) => {
  console.error("❌ Error:", e?.message || e);
  process.exit(1);
});
