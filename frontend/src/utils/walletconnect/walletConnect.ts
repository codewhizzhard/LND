import { HashConnect } from "hashconnect";
import { LedgerId } from "@hashgraph/sdk";

// dApp metadata matching HashConnect v3’s DappMetadata
const appMetadata = {
  name: "My Hedera dApp",
  description: "Demo app using HashConnect v3",
  icons: ["https://example.com/icon.png"],  // <-- array
  url: "http://localhost:5173"
};

// ledgerId from @hashgraph/sdk
const ledgerId = LedgerId.TESTNET;

// your project ID or whatever unique ID
const projectId = import.meta.env.VITE_WALLETCONNECT_ID

// Create instance; constructor signature in v3 expects these
export const hashconnect = new HashConnect(ledgerId, projectId, appMetadata, true);

export async function initHashConnect() {
  // Register your event handlers first
  hashconnect.pairingEvent.on((pairingData) => {
    console.log("✅ Pairing event:", pairingData);
  });
  hashconnect.connectionStatusChangeEvent.on((status) => {
    console.log("🔄 Connection status:", status);
  });

  // Initialize HashConnect
  await hashconnect.init();

  // Automatically open the pairing UI (QR + extension)
  hashconnect.openPairingModal();

  return { hashconnect };
}
