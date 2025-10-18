const MIRROR_NODE_URL =
  import.meta.env.VITE_MIRROR_NODE_URL ||
  "https://testnet.mirrornode.hedera.com/api/v1";

// Get account balance from Mirror Node (tinybars)
export async function mirrorAccountBalance(accountId) {
  const url = `${MIRROR_NODE_URL}/balances?account.id=${accountId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mirror balance error: ${res.status}`);
  const data = await res.json();
  // Latest snapshot first
  const entry = (data?.balances || [])[0];
  if (!entry) throw new Error("No balance found on mirror");
  return { accountId: entry.account, tinybars: String(entry.balance) };
}

// Lookup transactions for an account (newest first)
export async function mirrorAccountTxs(accountId, limit = 10) {
  const url = `${MIRROR_NODE_URL}/transactions?account.id=${accountId}&limit=${limit}&order=desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mirror tx error: ${res.status}`);
  const data = await res.json();
  return data?.transactions || [];
}

// Query a transaction by ID (consensus status, transfers, etc.)
export async function mirrorTxById(txId) {
  // Tx IDs must be in the "x.y.z-sss-nnn" format
  const url = `${MIRROR_NODE_URL}/transactions/${encodeURIComponent(txId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mirror tx lookup error: ${res.status}`);
  const data = await res.json();
  // Returns a list; most specific lookup typically yields 1
  return (data?.transactions || [])[0] || null;
}

// Convenience formatter
export function tinyToHBAR(tiny) {
  return Number(tiny) / 1e8;
}
