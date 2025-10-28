// src/utils/crypto.ts
// WebCrypto helpers: PBKDF2 -> AES-GCM (256) encryption, TypeScript-safe BufferSource usage

export type EncryptedPayload = {
  cipher: string;   // base64
  iv: string;       // base64
  salt: string;     // base64
  kdf: "pbkdf2";
  iterations: number;
  hash: "SHA-256";
};

const ITERATIONS = 100_000;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password), // BufferSource
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Ensure BufferSource type by making a Uint8Array view
  const saltView = new Uint8Array(salt);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltView,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptWithPassword(
  password: string,
  plaintext: string
): Promise<EncryptedPayload> {
  const salt = new Uint8Array(crypto.getRandomValues(new Uint8Array(16)));
  const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(12)));
  const key = await deriveKeyFromPassword(password, salt);

  const data = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, // safe Uint8Array
    key,
    data
  );

  return {
    cipher: toBase64(new Uint8Array(cipherBuffer)),
    iv: toBase64(iv),
    salt: toBase64(salt),
    kdf: "pbkdf2",
    iterations: ITERATIONS,
    hash: "SHA-256",
  };
}

export async function decryptWithPassword(
  password: string,
  payload: EncryptedPayload
): Promise<string> {
  if (payload.hash !== "SHA-256") {
    throw new Error(`Unsupported hash type: ${payload.hash}`);
  }

  // Always normalize to Uint8Array (BufferSource-compatible)
  const salt = new Uint8Array(fromBase64(payload.salt));
  const iv = new Uint8Array(fromBase64(payload.iv));
  const cipherBytes = new Uint8Array(fromBase64(payload.cipher));
console.log("more:", salt, iv, cipherBytes)
  const key = await deriveKeyFromPassword(password, salt);
  console.log("key:", key)
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv }, // iv is now a proper Uint8Array
    key,
    cipherBytes
  );
  console.log("pla:", plainBuffer)
  return new TextDecoder().decode(plainBuffer);
}

// 
export function generateChallenge(): string {
    const nonce = crypto.getRandomValues(new Uint32Array(1))[0];
    const timestamp = Date.now();
    return `Access Project X at ${timestamp} with nonce ${nonce}`;
}

// 

