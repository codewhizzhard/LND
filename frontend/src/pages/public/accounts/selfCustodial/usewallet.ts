import { useState, useCallback } from "react";
import { generateKey, exportKeystore, importKeystore, signMessage } from "../../../../utils/walletCrypto";
import type { Transaction } from "@hashgraph/sdk";

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  // Create a wallet and return both keys, but only store the public one
  const createWallet = useCallback(async (password: string) => {
    const { publicKey, privateKey } = await generateKey(password);
    setPublicKey(publicKey);
    return { publicKey, privateKey }; // ✅ return private key once
  }, []);

  // Restore wallet from keystore and return private key once
  const restoreWallet = useCallback(async (password: string, json: string) => {
    const { publicKey, privateKey } = await importKeystore(password, json);
    setPublicKey(publicKey);
    return { publicKey, privateKey }; // ✅ return private key once
  }, []);

  const startSession = useCallback((minutes: number = 15) => {
    setSessionActive(true);
    setExpiresAt(Date.now() + minutes * 60 * 1000);
    setTimeout(() => {
      setSessionActive(false);
      setExpiresAt(null);
    }, minutes * 60 * 1000);
  }, []);

 const signTx = useCallback(
  async (tx: Transaction, password: string) => {
    if (!publicKey) throw new Error("No wallet loaded");

    // get frozen tx bytes
    const txBytes = tx.toBytes();

    // sign with your keystore
    return await signMessage(txBytes, password);
  },
  [publicKey]
);


  const backup = useCallback(async () => {
    return await exportKeystore();
  }, []);

  return {
    publicKey,
    sessionActive,
    expiresAt,
    createWallet,
    restoreWallet,
    startSession,
    signTx,
    backup,
  };
}
