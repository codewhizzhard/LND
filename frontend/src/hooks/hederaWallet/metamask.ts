import { useState } from "react";
import { ethers } from "ethers";

// Extend the Window interface
declare global {
  interface Window {
    ethereum?: any; // optional, since user might not have MetaMask
  }
}

export function useHederaMetaMask() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      setError(null);
      if (!window.ethereum) throw new Error("MetaMask not installed");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length === 0) throw new Error("No accounts found");

      setAccount(accounts[0]);
      console.log("Connected Hedera EVM account:", accounts[0]);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  return { account, connect, error };
}
