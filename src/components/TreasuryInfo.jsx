import React, { useEffect, useState } from "react";
import { health } from "../utils/api";
import { mirrorAccountBalance, tinyToHBAR } from "../utils/mirror";

export default function TreasuryInfo() {
  const [ready, setReady] = useState(false);
  const [treasuryId, setTreasuryId] = useState("");
  const [bal, setBal] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const h = await health();
        setReady(true);
        // If you want, hardcode or env-inject your treasury ID to show its mirror balance here
        // Example: setTreasuryId("0.0.XXXX");
      } catch {
        setReady(false);
      }
    })();
  }, []);

  const loadBal = async () => {
    if (!treasuryId) return;
    const b = await mirrorAccountBalance(treasuryId.trim());
    setBal(b);
  };

  return (
    <>
      <h2>Treasury</h2>
      <p>Backend: {ready ? "online ✅" : "offline ❌"}</p>
      <label>Treasury Account ID</label>
      <input
        placeholder="0.0.xxxx"
        value={treasuryId}
        onChange={(e) => setTreasuryId(e.target.value)}
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={loadBal} disabled={!treasuryId}>
          Load Balance (Mirror)
        </button>
      </div>
      {bal && (
        <p>
          <strong>{bal.accountId}</strong>
          <br />
          HBAR:{" "}
          {tinyToHBAR(bal.tinybars).toLocaleString(undefined, {
            maximumFractionDigits: 8,
          })}
        </p>
      )}
    </>
  );
}
