import { useState } from "react";
import { ethers } from "ethers";
export function useHederaMetaMask() {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);
    const connect = async () => {
        try {
            setError(null);
            if (!window.ethereum)
                throw new Error("MetaMask not installed");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            if (accounts.length === 0)
                throw new Error("No accounts found");
            setAccount(accounts[0]);
            console.log("Connected Hedera EVM account:", accounts[0]);
        }
        catch (err) {
            setError(err.message || "Unknown error");
        }
    };
    return { account, connect, error };
}
