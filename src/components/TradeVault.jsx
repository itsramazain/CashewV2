// src/components/TradeVault.jsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { TRADEVAULT_ADDRESS, TRADEVAULT_ABI } from "../config";

// Chain check from Vite env
const V_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 296);

// helpers to support both ethers v5 and v6
function makeProvider() {
  if (!window?.ethereum) throw new Error("MetaMask not found");
  // v6
  if (ethers.BrowserProvider)
    return new ethers.BrowserProvider(window.ethereum);
  // v5 (pass "any" to avoid noNetwork on construction)
  if (ethers.providers?.Web3Provider)
    return new ethers.providers.Web3Provider(window.ethereum, "any");
  throw new Error("Unsupported ethers version");
}
const parseEther = (v) =>
  ethers.parseEther
    ? ethers.parseEther(String(v))
    : ethers.utils.parseEther(String(v));

const isEvmAddress = (v) => /^0x[a-fA-F0-9]{40}$/.test(v || "");

export default function TradeVault() {
  const [tradeId, setTradeId] = useState("");
  const [partyB, setPartyB] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [status, setStatus] = useState("");

  const getSigner = async () => {
    const provider = makeProvider();

    // ensure accounts are authorized (works v5/v6)
    await (provider.send
      ? provider.send("eth_requestAccounts", [])
      : window.ethereum.request({ method: "eth_requestAccounts" }));

    // check chain
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    const chainId = parseInt(chainIdHex, 16);
    if (chainId !== V_CHAIN_ID) {
      throw new Error(`Please switch MetaMask to chainId ${V_CHAIN_ID}.`);
    }

    // get signer (v5/v6)
    return provider.getSigner
      ? await provider.getSigner()
      : await provider.getSigner(0);
  };

  const createTrade = async () => {
    try {
      setStatus("");
      if (!isEvmAddress(partyB))
        throw new Error("Party B must be a valid 0x address");
      if (!amountA || Number(amountA) <= 0)
        throw new Error("Amount A must be > 0");
      if (!amountB || Number(amountB) <= 0)
        throw new Error("Amount B must be > 0");

      const signer = await getSigner();
      const contract = new ethers.Contract(
        TRADEVAULT_ADDRESS,
        TRADEVAULT_ABI,
        signer
      );

      const tx = await contract.createTrade(
        partyB,
        parseEther(String(amountA)),
        parseEther(String(amountB))
      );
      const receipt = await tx.wait();

      // 🔹 Extract tradeId from TradeCreated event
      let newId = null;
      for (const log of receipt.logs ?? []) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed?.name === "TradeCreated") {
            newId = parsed.args.tradeId.toString();
            break;
          }
        } catch {}
      }

      if (newId) {
        setTradeId(newId);
        setStatus(`Trade created! ID: ${newId} | Tx: ${tx.hash.slice(0, 10)}…`);
      } else {
        setStatus(
          `Trade created. Tx: ${tx.hash.slice(0, 10)}… (check HashScan for ID)`
        );
      }
    } catch (e) {
      setStatus(e?.message || String(e));
    }
  };

const deposit = async () => {
  try {
    setStatus("");
    if (!tradeId) throw new Error("Enter a trade ID");

    const signer = await getSigner();
    const user = (await signer.getAddress()).toLowerCase();

    const contract = new ethers.Contract(
      TRADEVAULT_ADDRESS,
      TRADEVAULT_ABI,
      signer
    );

    const t = await contract.getTrade(BigInt(tradeId));
    const partyAAddr = t.partyA.toLowerCase();
    const partyBAddr = t.partyB.toLowerCase();

    let valueWei;

    if (user === partyAAddr) {
      valueWei = t.amountA; // must match contract exactly
    } else if (user === partyBAddr) {
      valueWei = t.amountB;
    } else {
      throw new Error("Connected wallet is not a participant in this trade");
    }

    const tx = await contract.deposit(BigInt(tradeId), { value: valueWei });
    await tx.wait();
    setStatus(`Deposit successful! Tx: ${tx.hash}`);
  } catch (e) {
    setStatus("Deposit failed: " + (e?.data?.message || e?.message || e));
  }
};



  return (
    <div>
      <h3>Trade Vault</h3>
      <p>Create a trade between two accounts and deposit HBAR safely.</p>

      <input
        placeholder="Party B address (0x...)"
        value={partyB}
        onChange={(e) => setPartyB(e.target.value.trim())}
        style={{ display: "block", marginBottom: 8, width: 360 }}
      />
      <input
        placeholder="Amount A (HBAR)"
        value={amountA}
        onChange={(e) => setAmountA(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 200 }}
      />
      <input
        placeholder="Amount B (HBAR)"
        value={amountB}
        onChange={(e) => setAmountB(e.target.value)}
        style={{ display: "block", marginBottom: 12, width: 200 }}
      />

      <button onClick={createTrade}>Create Trade</button>

      <hr />
      <input
        placeholder="Trade ID"
        value={tradeId}
        onChange={(e) => setTradeId(e.target.value)}
        style={{ marginRight: 8, width: 140 }}
      />
      <button onClick={deposit}>Deposit</button>

      <div
        style={{
          marginTop: 10,
          color:
            status?.startsWith("Trade") || status?.startsWith("Deposit")
              ? "green"
              : "crimson",
        }}
      >
        {status}
      </div>
    </div>
  );
}
