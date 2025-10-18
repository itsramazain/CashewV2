import React, { useState } from "react";
import { connectWallet, getAddressAndBalance } from "../utils/wallet";

// ---- Vite env + safe fallbacks ----
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

export default function WalletConnect() {
  const [addr, setAddr] = useState("");
  const [bal, setBal] = useState(null);
  const [err, setErr] = useState("");

  const onConnect = async () => {
    setErr("");
    try {
      const a = await connectWallet();
      setAddr(a);
      const info = await getAddressAndBalance();
      setBal(info.balanceHBAR);
    } catch (e) {
      setErr(e?.message || String(e));
    }
  };

  return (
    <div>
      <h2>Wallet</h2>
      <button onClick={onConnect}>Connect MetaMask</button>

      {addr && (
        <p style={{ marginTop: 8 }}>
          <small>Address: </small>
          <a
            href={`${HASHSCAN_BASE}/address/${addr}`}
            target="_blank"
            rel="noreferrer"
            title="View on HashScan"
          >
            {addr.slice(0, 6)}…{addr.slice(-4)}
          </a>
          <br />
          <small>Balance: {bal ?? "—"} HBAR</small>
        </p>
      )}

      {err && <p style={{ color: "#ff8080" }}>{err}</p>}
    </div>
  );
}
