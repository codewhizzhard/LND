/* import { useState } from "react";
import { generateChallenge } from "@/utils/crypto";
import { 
  initHashConnect, 
  openPairingModal, 
  onPairing, 
  signChallenge, 
  uint8ArrayToHex 
} from "@/services/hashpack/hashpackInit";
import { getOrCreateAccountOnBackend } from "@/services/custom/backend";
    
 

export function useHederaCrossProject(projectId: string) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Init HashConnect
      await initHashConnect(projectId);

      // 2️⃣ Listen for pairing
      onPairing(async () => {
        const challengeMessage = generateChallenge();

        // 3️⃣ Sign the challenge
        const { accountId: signedAccountId, signature: rawSignature } = await signChallenge(challengeMessage);

        // 4️⃣ Convert signature to string
        const signature = uint8ArrayToHex(rawSignature.signature);

        // 5️⃣ Send to backend
        const backendAccountId = await getOrCreateAccountOnBackend({
          publicKey: signedAccountId,
          signature,
          challenge: challengeMessage,
        });

        // 6️⃣ Save accountId locally
        localStorage.setItem("hedera-accountId", backendAccountId);
        setAccountId(backendAccountId);
      });

      // 3️⃣ Open pairing modal
      openPairingModal();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { accountId, connect, loading, error };
}
 */