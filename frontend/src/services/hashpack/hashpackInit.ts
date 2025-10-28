import { HashConnect, type SessionData } from "hashconnect";
import { LedgerId } from "@hashgraph/sdk";


// App metadata for HashConnect pairing
const appMetadata = {
  name: import.meta.env.VITE_APP_NAME,
  description: "Secure cross-project Hedera wallet connection for DApps",
  icons:["https://yourdomain.com/assets/icons/hedera-icon.png"] ,
  url: "https://example.com",
};

let hashconnect: HashConnect;
let pairingData: SessionData | null = null;

export async function initHashConnect(projectId: string, network = LedgerId.MAINNET) {
  hashconnect = new HashConnect(network, "d2c179709ec9efda0c671e6850f48bfc", appMetadata, true);
  
  await hashconnect.init();
  return hashconnect.openPairingModal;
}


export function openPairingModal() {
  if (!hashconnect) throw new Error("HashConnect not initialized");
  hashconnect.openPairingModal();
}

export function onPairing(callback: (data: SessionData) => void) {
  if (!hashconnect) throw new Error("HashConnect not initialized");
  hashconnect.pairingEvent.on((data) => {
    pairingData = data;
    callback(data);
  });
}

/**
 * Sign a challenge message with the paired account
 */

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// hashpackInit.ts
export async function signChallenge(message: string) {
  if (!pairingData) throw new Error("No wallet paired");
  const accountId = pairingData.accountIds[0]; // pick first account

  const signer = hashconnect.getSigner(accountId as any);

  const messageBytes = new TextEncoder().encode(message);
  const signedArray = await signer.sign([messageBytes]);

  // signedArray[0] is a SignerSignature object
  const signatureBytes = signedArray[0].signature; // <- Uint8Array

  return { accountId, signature: signatureBytes };
}



// helper function to convert Uint8Array to hex string
export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
