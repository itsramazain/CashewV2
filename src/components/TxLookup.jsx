import React, { useState } from "react";
import { mirrorTxById } from "../utils/mirror";

export default function TxLookup() {
  const [txId, setTxId] = useState("");
  const [tx, setTx] = useState(null);
  const [err, setErr] = useState("");

  const onLookup = async () => {
    setErr("");
    setTx(null);
    try {
      const t = await mirrorTxById(txId.trim());
      if (!t) throw new Error("Transaction not found on mirror");
      setTx(t);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <>
      <h2>Transaction Lookup (Mirror Node)</h2>
      <label>Transaction ID</label>
      <input
        placeholder="0.0.x-1234567890-000000000"
        value={txId}
        onChange={(e) => setTxId(e.target.value)}
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={onLookup} disabled={!txId}>
          Lookup
        </button>
      </div>
      {tx && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(
            {
              id: tx.transaction_id,
              result: tx.result,
              type: tx.name || tx.transaction_type,
              consensus_timestamp: tx.consensus_timestamp,
            },
            null,
            2
          )}
        </pre>
      )}
      {err && <p style={{ color: "#ff8080" }}>{err}</p>}
    </>
  );
}
