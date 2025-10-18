import React from "react";
import WalletConnect from "./components/WalletConnect.jsx";
import TradeVault from "./components/TradeVault.jsx";
import BuyHBAR from "./components/BuyHBAR.jsx";
import HbarBalance from "./components/HbarBalance.jsx";
import TreasuryInfo from "./components/TreasuryInfo.jsx";
import TxLookup from "./components/TxLookup.jsx";
import "./index.css";

export default function App() {
  return (
    <div className="container">
      <h1>HBAR dApp — MetaMask + Mirror Node + Trade Vault</h1>

      {/* Connect & Trade Vault */}
      <div className="row">
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <WalletConnect />
        </div>
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <TradeVault />
        </div>
      </div>

      {/* Direct HBAR send + Wallet balance */}
      <div className="row" style={{ marginTop: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <BuyHBAR />
        </div>
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <HbarBalance />
        </div>
      </div>

      {/* Treasury info + Tx lookup */}
      <div className="row" style={{ marginTop: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <TreasuryInfo />
        </div>
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <TxLookup />
        </div>
      </div>
    </div>
  );
}
