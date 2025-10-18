/**
 * HBAR sender backend — now respects your env:
 * - OPERATOR_ID, OPERATOR_KEY (hex ECDSA supported)
 * - CHAIN_ID (296=testnet, 295=mainnet, else previewnet)
 */
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
  Client,
  PrivateKey,
  Hbar,
  TransferTransaction,
} = require("@hashgraph/sdk");

const OPERATOR_ID = process.env.OPERATOR_ID;
const OPERATOR_KEY = process.env.OPERATOR_KEY;
const CHAIN_ID = Number(process.env.CHAIN_ID || 296); // default testnet
const PORT = process.env.PORT || 8080;

// Map CHAIN_ID → Hedera network name the SDK understands
function networkFromChainId(id) {
  if (id === 295) return "mainnet";
  if (id === 296) return "testnet";
  return "previewnet";
}
const HEDERA_NETWORK = networkFromChainId(CHAIN_ID);

// Accept common key formats (DER string, hex ECDSA w/ or w/o 0x)
function parsePrivateKey(key) {
  const k = (key || "").trim();
  let err;
  try {
    return PrivateKey.fromString(k);
  } catch (e) {
    err = e;
  }
  try {
    return PrivateKey.fromStringECDSA(k.startsWith("0x") ? k : "0x" + k);
  } catch (e) {
    err = e;
  }
  throw new Error(
    `Unable to parse OPERATOR_KEY: ${err?.message || "unknown format"}`
  );
}

if (!OPERATOR_ID || !OPERATOR_KEY) {
  console.error("Missing OPERATOR_ID or OPERATOR_KEY in env");
  process.exit(1);
}

const client = Client.forName(HEDERA_NETWORK);
client.setOperator(OPERATOR_ID, parsePrivateKey(OPERATOR_KEY));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (_, res) =>
  res.json({ ok: true, network: HEDERA_NETWORK, chainId: CHAIN_ID })
);

// Send HBAR from treasury → buyer
app.post("/buy", async (req, res) => {
  const { accountId, amountHbar } = req.body || {};
  if (!accountId || typeof amountHbar !== "number" || amountHbar <= 0) {
    return res
      .status(400)
      .json({ error: "accountId and positive amountHbar are required" });
  }
  try {
    const tx = await new TransferTransaction()
      .addHbarTransfer(OPERATOR_ID, new Hbar(-amountHbar))
      .addHbarTransfer(accountId, new Hbar(amountHbar))
      .freezeWith(client)
      .execute(client);

    const receipt = await tx.getReceipt(client);
    res.json({
      status: receipt.status.toString(),
      txId: tx.transactionId.toString(),
      network: HEDERA_NETWORK,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () =>
  console.log(`HBAR backend on ${PORT} (${HEDERA_NETWORK}, chain ${CHAIN_ID})`)
);
