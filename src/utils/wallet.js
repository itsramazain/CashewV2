import { ethers } from "ethers";

const V_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 296);
const V_RPC_URL =
  import.meta.env.VITE_HEDERA_RPC ?? "https://testnet.hashio.io/api";

function chainIdHex(id) {
  return "0x" + Number(id).toString(16);
}
function networkLabel(id) {
  if (id === 295) return "mainnet";
  if (id === 296) return "testnet";
  return "previewnet";
}

// --- version-agnostic constructors
function makeProvider() {
  if (!window?.ethereum) throw new Error("MetaMask not found");
  // v6
  if (ethers.BrowserProvider)
    return new ethers.BrowserProvider(window.ethereum);
  // v5: IMPORTANT => "any" prevents noNetwork during construction
  if (ethers.providers?.Web3Provider)
    return new ethers.providers.Web3Provider(window.ethereum, "any");
  throw new Error("Unsupported ethers version");
}

function parseEther(v) {
  return ethers.parseEther
    ? ethers.parseEther(String(v))
    : ethers.utils.parseEther(String(v));
}
function formatEther(v) {
  return ethers.formatEther
    ? ethers.formatEther(v)
    : ethers.utils.formatEther(v);
}

export function hasMetaMask() {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function addOrSwitchToHedera() {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");

  const params = {
    chainId: chainIdHex(V_CHAIN_ID),
    chainName: `Hedera ${networkLabel(V_CHAIN_ID)}`,
    nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
    rpcUrls: [V_RPC_URL],
    blockExplorerUrls: [`https://hashscan.io/${networkLabel(V_CHAIN_ID)}`],
  };

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: params.chainId }],
    });
  } catch (e) {
    if (e?.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [params],
      });
    } else {
      throw e;
    }
  }
}

export async function connectWallet() {
  if (!hasMetaMask()) throw new Error("MetaMask not found");
  // 1) ask for accounts first (unlocks MM)
  await window.ethereum.request({ method: "eth_requestAccounts" });
  // 2) ensure chain is added/switched
  await addOrSwitchToHedera();

  const provider = makeProvider();
  // 3) now network detection will succeed
  const signer = provider.getSigner
    ? await provider.getSigner()
    : await provider.getSigner(0);
  return await signer.getAddress();
}

export function getBrowserProvider() {
  return makeProvider();
}

export async function getSigner() {
  const provider = makeProvider();
  // make sure accounts are available & chain is correct
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const cidHex = await window.ethereum.request({ method: "eth_chainId" });
  const cid = parseInt(cidHex, 16);
  if (cid !== V_CHAIN_ID) {
    throw new Error(`Wrong network. Expected ${V_CHAIN_ID}, got ${cid}`);
  }
  return provider.getSigner
    ? await provider.getSigner()
    : await provider.getSigner(0);
}

export async function sendHBAR(toAddress, amountHBAR) {
  const signer = await getSigner();
  const value = parseEther(amountHBAR);
  const tx = await signer.sendTransaction({ to: toAddress, value });
  const receipt = tx.wait
    ? await tx.wait()
    : await signer.provider.waitForTransaction(tx.hash);
  return { hash: tx.hash, receipt };
}

export async function getAddressAndBalance() {
  const signer = await getSigner();
  const addr = await signer.getAddress();
  const balWei = await signer.provider.getBalance(addr);
  return { address: addr, balanceHBAR: Number(formatEther(balWei)) };
}
