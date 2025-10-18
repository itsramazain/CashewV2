import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function HbarBalance({ provider, account }) {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (!provider || !account) return;

    async function fetchBalance() {
      const bal = await provider.getBalance(account);
      setBalance(ethers.utils.formatEther(bal)); // convert from wei to HBAR
    }

    fetchBalance();

    // Optional: refresh every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [provider, account]);

  return <p>Your HBAR balance: {balance}</p>;
}
