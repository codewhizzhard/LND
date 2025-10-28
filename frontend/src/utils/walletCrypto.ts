// src/utils/walletCrypto.ts
import { PrivateKey } from "@hashgraph/sdk";
import { encryptWithPassword, decryptWithPassword, type EncryptedPayload } from "./crypto";
import { saveToDB, getFromDB, deleteFromDB } from "./db";
import CryptoJS from "crypto-js";

/**
 * Keystore JSON shape (same as your hook expects)
 */
export type KeystoreJSON = {
  version: 1;
  id: string;
  createdAt: string;
  publicKey: string; // raw pubkey string (for convenience)
  encrypted: EncryptedPayload;
};

const STORAGE_KEY = import.meta.env.VITE_SECRET_KEY

/**
 * Generate a new ECDSA PrivateKey, encrypt with password and persist keystore to DB.
 * Returns the created KeystoreJSON and the publicKey string.
 */
export async function generateKey(password: string): Promise<{ publicKey: string; privateKey: string; keystore: KeystoreJSON }> {
  console.log("here")
  const pk = PrivateKey.generateED25519(); //   ✅ Use Ed25519 (Hedera-compatible)
  const pkDer = pk.toStringDer(); 
  const pub = pk.publicKey.toStringRaw();
  console.log("keys:", pk, pkDer, pub)

  const encrypted = await encryptWithPassword(password, pkDer);
  console.log("hhh:", encrypted)

  const keystore: KeystoreJSON = {
    version: 1,
    id: randomId(),
    createdAt: new Date().toISOString(),
    publicKey: pub,
    encrypted,
  };

  console.log("store:", STORAGE_KEY)

  await saveToDB(STORAGE_KEY, JSON.stringify(keystore));
  console.log("💾 Saved to IndexedDB:", STORAGE_KEY, keystore);

  // expose privateKey here
  return { publicKey: pub, privateKey: pkDer, keystore };
}

/**
 * Import a keystore JSON (string or parsed object), verify decryption with password,
 * persist to DB (overwrite), and return publicKey.
 */

  // user getting their publickey on password

export async function exportPrivateKey(password: string): Promise<string> {
  const raw = await getFromDB(STORAGE_KEY);
  if (!raw) throw new Error("No wallet found");

  const parsed: KeystoreJSON = JSON.parse(raw);

  // decrypt
  const plain = await decryptWithPassword(password, parsed.encrypted);

  // validate
  PrivateKey.fromStringECDSA(plain);

  return plain; // return DER-encoded private key
}


export async function importKeystore(
  password: string,
  keystoreOrString: string | KeystoreJSON
): Promise<{ publicKey: string; privateKey: string; keystore: KeystoreJSON }> {
  const parsed: KeystoreJSON =
    typeof keystoreOrString === "string"
      ? (JSON.parse(keystoreOrString) as KeystoreJSON)
      : keystoreOrString;

  if (parsed.version !== 1) throw new Error("Unsupported keystore version");
  if (parsed.encrypted.hash !== "SHA-256") {
  throw new Error("Unsupported hash: " + parsed.encrypted.hash);
}

  const plain = await decryptWithPassword(password, parsed.encrypted);

  // validate
  const pk = PrivateKey.fromStringECDSA(plain);

  await saveToDB(STORAGE_KEY, JSON.stringify(parsed));

  return { publicKey: parsed.publicKey, privateKey: pk.toStringDer(), keystore: parsed };
}

/**
 * Export keystore from DB (returns KeystoreJSON or throws if none)
 */
export async function exportKeystore(): Promise<KeystoreJSON> {
  const raw = await getFromDB(STORAGE_KEY);
  if (!raw) throw new Error("No keystore found");
  const parsed = JSON.parse(raw) as KeystoreJSON;
  return parsed;
}

/**
 * Remove keystore from DB (useful for "delete wallet")
 */
export async function deleteKeystore(): Promise<void> {
  await deleteFromDB(STORAGE_KEY);
}

/**
 * Sign an arbitrary message (string or Uint8Array) using the stored keystore.
 * This function will:
 *  - fetch keystore from DB
 *  - decrypt the private key with the supplied password (does NOT persist private key in memory)
 *  - sign the message and return signature
 *
 * Returns an object containing signature bytes (Uint8Array) and base64 representation.
 */
export async function signMessage(
  message: Uint8Array | string,
  password: string
): Promise<{ signature: Uint8Array; signatureBase64: string }> {
  const raw = await getFromDB(STORAGE_KEY)
  if (!raw) throw new Error("No keystore found")
  const parsed = JSON.parse(raw) as KeystoreJSON

  if (parsed.encrypted.hash !== "SHA-256") {
    throw new Error("Unsupported hash type")
  }

  // decrypt private key
  const plain = await decryptWithPassword(password, parsed.encrypted)
  const pk = PrivateKey.fromStringECDSA(plain)

  // normalize message → always Uint8Array
  const dataBytes =
    typeof message === "string"
      ? Uint8Array.from(atob(message), (c) => c.charCodeAt(0)) // base64 → Uint8Array
      : message

  // sign
  const sig = pk.sign(dataBytes) as Uint8Array

  return { signature: sig, signatureBase64: btoa(String.fromCharCode(...sig)) }
}

/**
 * Small helper to generate an ID (hex)
 */
function randomId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}



/////// for edsca key 




/**
 * Represents a Hedera ECDSA key pair.
 */
export interface HederaKeyPair {
  privateKey: string;
  publicKey: string;
}

/**
 * Represents encrypted private key data.
 */
export interface EncryptedPrivateKeyData {
  encryptedPrivateKey: string;
  salt: string; // Base64-encoded
  iv: string;   // Base64-encoded
}

/**
 * Generate a new Hedera ECDSA key pair.   
 * @returns {HederaKeyPair}
 */
export function generateHederaEcdsaAccount(): HederaKeyPair {
  const privateKey = PrivateKey.generateECDSA();
  const publicKey = privateKey.publicKey;

  return {
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
  };
}

/**
 * Encrypt the private key using the user's secret.
 * Uses PBKDF2 + AES with random salt and IV.
 *
 * @param privateKey - The Hedera private key
 * @param userSecret - The user’s secret/passphrase
 * @returns {EncryptedPrivateKeyData}
 */
export function encryptPrivateKey(
  privateKey: string,
  userSecret: string
): EncryptedPrivateKeyData {
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);

  const key = CryptoJS.PBKDF2(userSecret, salt, {
    keySize: 256 / 32,
    iterations: 200000,
  });

  const encrypted = CryptoJS.AES.encrypt(privateKey, key, { iv }).toString();

  return {
    encryptedPrivateKey: encrypted,
    salt: CryptoJS.enc.Base64.stringify(salt),
    iv: CryptoJS.enc.Base64.stringify(iv),
  };
}

/**
 * Decrypt an encrypted private key using the user's secret.
 *
 * @param encryptedPrivateKey - Encrypted AES ciphertext
 * @param userSecret - The user’s secret/passphrase
 * @param saltB64 - The Base64-encoded salt
 * @param ivB64 - The Base64-encoded IV
 * @returns {string} - The decrypted Hedera private key
 */
export function decryptPrivateKey(
  encryptedPrivateKey: string,
  userSecret: string,
  saltB64: string,
  ivB64: string
): string {
  try {
    const salt = CryptoJS.enc.Base64.parse(saltB64);
    const iv = CryptoJS.enc.Base64.parse(ivB64);

    const key = CryptoJS.PBKDF2(userSecret, salt, {
      keySize: 256 / 32,
      iterations: 200000,
    });

    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, key, { iv });
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Invalid secret or corrupted data.");
    }

    return decrypted;
  }  catch (err) {
  if (err instanceof Error) {
    console.error("❌ Failed to decrypt private key:", err.message);
    throw new Error("Decryption failed. " + err.message);
  } else {
    console.error("❌ Unknown error during decryption:", err);
    throw new Error("Decryption failed due to an unknown error.");
  }
}
}
