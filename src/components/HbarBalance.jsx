// src/components/BuyHBAR.jsx
import React, { useState } from "react";
import { sendHBAR } from "../utils/wallet";

// ---- Vite env + fallbacks ----
const V_CHAIN_ID_STR = import.meta.env.VITE_CHAIN_ID ?? "296";
const V_NETWORK_STR = import.meta.env.VITE_HEDERA_NETWORK ?? "";
const CHAIN_ID_NUM = Number(V_CHAIN_ID_STR) || 296;

function networkFromChainId(id) {
  if (id === 295) return "mainnet";
  if (id === 296) return "testnet";
  return "previewnet";
}
const NETWORK = (
  V_NETWORK_STR || networkFromChainId(CHAIN_ID_NUM)
).toLowerCase();

const HASHSCAN_BASE =
  import.meta.env.VITE_HASHSCAN_BASE ?? `https://hashscan.io/${NETWORK}`;

const isEvmAddress = (v) => /^0x[a-fA-F0-9]{40}$/.test(v || "");

export default function BuyHBAR() {
  const [to, setTo] = useState(""); // EVM address 0x...
  const [amount, setAmount] = useState("1");
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState("");

  const onSend = async () => {
    setErr("");
    setTx(null);
    try {
      if (!isEvmAddress(to)) throw new Error("Enter a valid 0x address");
      if (!amount || Number(amount) <= 0)
        throw new Error("Enter a positive amount");

      const res = await sendHBAR(to, amount); // returns { hash, receipt }
      setTx(res);
    } catch (e) {
      setErr(e?.message || String(e));
    }
  };

  return (
    <>
      <h2>Send HBAR (MetaMask)</h2>

      <label>Recipient (0x address)</label>
      <input
        placeholder="0x..."
        value={to}
        onChange={(e) => setTo(e.target.value.trim())}
      />

      <label style={{ marginTop: 8 }}>Amount (HBAR)</label>
      <input
        type="number"
        min="0"
        step="0.000000000000000001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={onSend} disabled={!to || !amount}>
          Send
        </button>
      </div>

      {tx && (
        <p style={{ marginTop: 8 }}>
          <small>Tx: </small>
          <a
            href={`${HASHSCAN_BASE}/tx/${tx.hash}`}
            target="_blank"
            rel="noreferrer"
            title="View on HashScan"
          >
            {tx.hash.slice(0, 10)}…{tx.hash.slice(-8)}
          </a>
        </p>
      )}

      {err && <p style={{ color: "#ff8080" }}>{err}</p>}
    </>
  );
}
