// src/hooks/useEcdsaWallet.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { PrivateKey, Transaction } from "@hashgraph/sdk";
import { saveToDB, getFromDB, deleteFromDB } from "../../utils/db";
import { encryptWithPassword, decryptWithPassword } from "../../utils/crypto";
import { exportPrivateKey } from "@/utils/walletCrypto";

// Encrypted payload + keystore types (unchanged)
type EncryptedPayload = {
  cipher: string;
  iv: string;
  salt: string;
  kdf: "pbkdf2";
  iterations: number;
  hash: "SHA-256";
};
type KeystoreJSON = {
  version: 1;
  id: string;
  createdAt: string;
  publicKey: string;
  encrypted: EncryptedPayload;
};

const STORAGE_KEY = import.meta.env.VITE_SECRET_KEY

function randomId() {
  return crypto.getRandomValues(new Uint8Array(16)).reduce(
    (s, b) => s + b.toString(16).padStart(2, "0"),
    ""
  );
}

export function useEcdsaWallet({
  autoLockMinutes = 5,
  storageKey = STORAGE_KEY,
}: { autoLockMinutes?: number; storageKey?: string } = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKeyStr, setPrivateKeyStr] = useState<string | null>(null); // optional viewable string
  const privateKeyRef = useRef<PrivateKey | null>(null);
  const lockTimerRef = useRef<number | null>(null);

  const clearLockTimer = () => {
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  };
  const setAutoLock = (minutes: number) => {
    clearLockTimer();
    if (minutes <= 0) return;
    lockTimerRef.current = window.setTimeout(() => {
      lock();
    }, minutes * 60 * 1000);
  };

  // load metadata if any
  useEffect(() => {
    (async () => {
      const raw = await getFromDB(storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as KeystoreJSON;
          setPublicKey(parsed.publicKey);
        } catch (err) {
          console.warn("Failed to parse stored keystore metadata", err);
        }
      }
      setIsInitialized(true);
    })();
    return () => clearLockTimer();
  }, [storageKey]);

  // ---------- create wallet ----------
  const createWallet = useCallback(
    async (password: string) => {
      const pk = PrivateKey.generateECDSA();

      // Use stable string format for storage & restore:
      // pk.toString() is safe and works with PrivateKey.fromString(...)
      const pkString = pk.toString();
      const pubString = pk.publicKey.toString();

      const encrypted = await encryptWithPassword(password, pkString);

      const keystore: KeystoreJSON = {
        version: 1,
        id: randomId(),
        createdAt: new Date().toISOString(),
        publicKey: pubString,
        encrypted: encrypted as EncryptedPayload,
      };

      await saveToDB(storageKey, JSON.stringify(keystore));

      // keep PrivateKey instance in memory for immediate session use
      privateKeyRef.current = pk;
      setPublicKey(pubString);
      setPrivateKeyStr(pkString); // useful for 'view private key' flows
      setIsUnlocked(true);
      setAutoLock(autoLockMinutes);

      console.debug("Created wallet - publicKey:", pubString);
      return keystore;
    },
    [storageKey, autoLockMinutes]
  );

  // ---------- view private (returns same string format) ----------
  const viewPrivateKey = useCallback(async (password: string) => {
    // reuse existing export helper if it returns same format (string)
    const pk = await exportPrivateKey(password);
    setPrivateKeyStr(pk);
    return pk;
  }, []);

  // ---------- import keystore ----------
  const importKeystore = useCallback(
    async (keystoreJson: string | KeystoreJSON, password: string) => {
      const parsed =
        typeof keystoreJson === "string"
          ? (JSON.parse(keystoreJson) as KeystoreJSON)
          : keystoreJson;

      if (parsed.encrypted.hash !== "SHA-256") {
        throw new Error("Unsupported hash type");
      }

      const plain = await decryptWithPassword(
        password,
        parsed.encrypted as EncryptedPayload
      );

      // Use PrivateKey.fromString which accepts the same format `.toString()`
      const pk = PrivateKey.fromString(plain);

      await saveToDB(storageKey, JSON.stringify(parsed));
      privateKeyRef.current = pk;
      setPublicKey(parsed.publicKey);
      setPrivateKeyStr(plain);
      setIsUnlocked(true);
      setAutoLock(autoLockMinutes);
      console.debug("Keystore imported, public:", parsed.publicKey);
      return parsed;
    },
    [storageKey, autoLockMinutes]
  );

  // ---------- export keystore ----------
  const exportKeystore = useCallback(async () => {
    const raw = await getFromDB(storageKey);
    if (!raw) throw new Error("No keystore found");
    return JSON.parse(raw) as KeystoreJSON;
  }, [storageKey]);

  // ---------- unlock ----------
  const unlock = useCallback(
    async (password: string) => {
      const raw = await getFromDB(storageKey);
      console.log("unraw:", raw)
      if (!raw) throw new Error("No wallet in storage");
      const parsed = JSON.parse(raw) as KeystoreJSON;
      console.log("parsed:", parsed.encrypted)
      console.log("parsed:", password)

      if (parsed.encrypted.hash !== "SHA-256") {
        throw new Error("Unsupported hash type");
      }

      const plain = await decryptWithPassword(
        password,
        parsed.encrypted as EncryptedPayload
      );
      console.log("plain:", plain)
      // Use PrivateKey.fromString to reconstruct the PrivateKey instance
      const pk = PrivateKey.fromString(plain);
      console.log("pk:", pk)

      privateKeyRef.current = pk;
      setPublicKey(parsed.publicKey);
      setPrivateKeyStr(plain);
      setIsUnlocked(true);
      setAutoLock(autoLockMinutes);

      console.debug("Unlocked wallet, publicKey:", parsed.publicKey);
      return parsed.publicKey;
    },
    [storageKey, autoLockMinutes]
  );

  // ---------- lock / clear ----------
  const lock = useCallback(() => {
    privateKeyRef.current = null;
    setIsUnlocked(false);
    clearLockTimer();
    // do not clear publicKey metadata (so user still sees presence)
  }, []);

  const clearWallet = useCallback(async () => {
    await deleteFromDB(storageKey);
    lock();
    setPublicKey(null);
    setPrivateKeyStr(null);
  }, [storageKey, lock]);

  // ---------- sign raw bytes ----------
  const signBytes = useCallback(async (data: Uint8Array) => {
    if (!privateKeyRef.current) throw new Error("Wallet locked");
    const sig = privateKeyRef.current.sign(data);
    return sig instanceof Uint8Array ? sig : new Uint8Array(sig);
  }, []);

  // ---------- sign transaction ----------
  // inside useEcdsaWallet
const signTransaction = useCallback(
  async (tx: Transaction) => {
    if (!privateKeyRef.current) throw new Error("Wallet locked");

    // Debug: show key and tx info
    try {
      console.debug("signTransaction: privateKey present:", !!privateKeyRef.current);
      console.debug("signTransaction: publicKey:", privateKeyRef.current.publicKey.toString());
    } catch (e) {
      console.debug("signTransaction: failed to print publicKey", e);
    }

    // Ensure tx is frozen (defensive)
    try {
      const isFrozen = (tx as any).isFrozen ? (tx as any).isFrozen() : undefined;
      console.debug("signTransaction: tx.isFrozen =>", isFrozen);
      if (isFrozen === false) {
        // try local freeze as fallback (some SDKs allow tx.freeze())
        try {
          // Many Transaction classes have freeze() but some require freezeWith(client).
          // Attempt best-effort but do not rely on it for production — backend should freeze.
          (tx as any).freeze?.();
          console.debug("signTransaction: attempted local freeze()");
        } catch (freezeErr) {
          console.warn("signTransaction: local freeze failed:", freezeErr);
          throw new Error("Transaction must be frozen before signing");
        }
      }
    } catch (err) {
      console.debug("signTransaction: could not check freeze state (continuing).", err);
    }

    // Perform signing (this mutates and returns the tx)
    try {
      const signed = tx.sign(privateKeyRef.current);
      setAutoLock(autoLockMinutes);
      console.debug("signTransaction: signed with publicKey:", privateKeyRef.current.publicKey.toString());
      return signed;
    } catch (err: any) {
      console.error("signTransaction: signing operation failed:", err);
      // Re-throw a clearer message for UI
      throw new Error(err?.message || "Signing operation failed (OperationError)");
    }
  },
  [autoLockMinutes]
);

  const isPresent = !!publicKey;

  return {
    isInitialized,
    isUnlocked,
    isPresent,
    publicKey,
    privateKey: privateKeyStr,

    // actions
    createWallet,
    viewPrivateKey,
    importKeystore,
    exportKeystore,
    unlock,
    lock,
    clearWallet,
    signBytes,
    signTransaction,
    setAutoLockMinutes: (m: number) => setAutoLock(m),
  } as const;
}


/* 

// src/wallet/restore.ts
import { PrivateKey } from "@hashgraph/sdk";
import { getFromDB } from "../utils/db";
import { fromBase64, toBase64 } from "../utils/base64";

// must match what you used in saveToDB
const STORAGE_KEY = "hedera_ecdsa_keystore_protected_ultrally";

export async function restoreWallet(password: string) {
  const raw = await getFromDB(STORAGE_KEY);
  if (!raw) throw new Error("No wallet stored in IndexedDB");

  const keystore = JSON.parse(raw);

  // get encrypted parts
  const { cipher, iv, salt, iterations, hash } = keystore.encrypted;

  // derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: fromBase64(salt),
      iterations,
      hash,
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // decrypt private key string
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    aesKey,
    fromBase64(cipher)
  );

  const pkString = new TextDecoder().decode(decryptedBuffer);

  // rebuild PrivateKey instance
  const privateKey = PrivateKey.fromString(pkString);

  return {
    publicKey: keystore.publicKey,
    privateKey,
  };
}
////


sign 
// Example usage in React or service
import { restoreWallet } from "./wallet/restore";

const signTx = async (tx: Transaction, password: string) => {
  const { privateKey } = await restoreWallet(password);

  // freeze tx first if not already
  const frozen = tx.isFrozen() ? tx : await tx.freeze();

  // sign it
  return await frozen.sign(privateKey);
};

*/