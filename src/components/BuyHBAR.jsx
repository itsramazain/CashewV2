// src/components/BuyHBAR.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// --- Vite env (frontend) ---
const V_TREASURY = import.meta.env.VITE_TREASURY_EVM_ADDRESS ?? "";
const V_API_BASE = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";
const V_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 296);

// tiny guard
const isEvm = (v) => /^0x[a-fA-F0-9]{40}$/.test(v || "");

export default function BuyHBAR() {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("1");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // ----- utils (ethers v6) -----
  const getProvider = () => {
    if (!window?.ethereum) throw new Error("MetaMask not found");
    return new ethers.providers.JsonRpcProvider(window.ethereum);
  };

  const connect = async () => {
    const provider = getProvider();
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
    return { provider, signer };
  };

  const ensureExpectedChain = async (provider) => {
    const net = await provider.getNetwork();
    const chainId = Number(net.chainId);
    if (chainId !== V_CHAIN_ID) {
      throw new Error(`Please switch MetaMask to chainId ${V_CHAIN_ID}.`);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!window?.ethereum) return;
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts?.length) setAccount(accounts[0]);
      } catch {}
    })();
  }, []);

  // A) user → treasury (MetaMask pops)
  const sendWithMetaMask = async () => {
    setOk("");
    setErr("");
    try {
      if (!isEvm(V_TREASURY))
        throw new Error("TREASURY_EVM_ADDRESS is missing/invalid");
      if (!amount || Number(amount) <= 0)
        throw new Error("Enter a positive amount");

      const { provider, signer } = await connect();
      await ensureExpectedChain(provider);

      const tx = await signer.sendTransaction({
        to: V_TREASURY,
        value: ethers.parseEther(String(amount)), // HBAR uses 18 decimals on Hedera EVM
      });

      await tx.wait(); // 1 confirmation
      setOk(`Sent ${amount} HBAR to treasury. Tx: ${tx.hash.slice(0, 10)}…`);
    } catch (e) {
      setErr(e?.message || String(e));
    }
  };

  // B) (optional) server → user (needs backend running)
  const requestFromServer = async () => {
    setOk("");
    setErr("");
    try {
      if (!V_API_BASE) throw new Error("VITE_BACKEND_URL is not set");
      const { provider, signer } = await connect();
      await ensureExpectedChain(provider);
      const addr = await signer.getAddress();

      const r = await fetch(`${V_API_BASE}/sendHbar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: addr, hbarAmount: Number(amount) }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status} ${t}`);
      }
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "Server returned error");
      setOk(`Treasury sent HBAR. TxId: ${data.txId || "(see server logs)"}`);
    } catch (e) {
      setErr(e?.message || String(e));
    }
  };

  return (
    <div>
      <h3>Buy HBAR</h3>

      <div style={{ marginBottom: 8 }}>
        <button onClick={connect}>Connect MetaMask</button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <label style={{ minWidth: 140 }}>Your EVM Address</label>
        <input
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="0x..."
          style={{ width: 360 }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <label style={{ minWidth: 140 }}>Amount (HBAR)</label>
        <input
          type="number"
          min="0"
          step="0.000000000000000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: 160 }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={sendWithMetaMask}>
          Send HBAR (MetaMask → Treasury)
        </button>
        <button onClick={requestFromServer}>Request HBAR (Server → You)</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
        Treasury: <code>{V_TREASURY || "(set VITE_TREASURY_EVM_ADDRESS)"}</code>
      </div>

      {ok && <div style={{ color: "green", marginTop: 10 }}>{ok}</div>}
      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}
    </div>
  );
}
