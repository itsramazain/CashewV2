// src/utils/api.js

// Read from Vite env (.env -> VITE_BACKEND_URL)
const RAW_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// normalize: remove trailing slash
const BASE = RAW_BASE.replace(/\/+$/, "");

// small helper to parse JSON safely
async function parseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function buyHbar(accountId, amountHbar) {
  const res = await fetch(`${BASE}/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId, amountHbar }),
  });

  if (!res.ok) {
    const err = await parseJson(res);
    throw new Error(err.error || `Transfer failed (HTTP ${res.status})`);
  }
  return parseJson(res);
}

export async function health() {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`Backend offline (HTTP ${res.status})`);
  return parseJson(res);
}

// Optionally export the resolved base for debugging/other modules
export const BACKEND_BASE = BASE;
