import { useState } from "react";
import { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod, HederaChainId } from "@hashgraph/hedera-wallet-connect";
import { LedgerId } from "@hashgraph/sdk";
let connector;
export function useHederaWallet(projectId) {
    const [accountId, setAccountId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const connect = async () => {
        try {
            setLoading(true);
            setError(null);
            const metadata = {
                name: import.meta.env.VITE_APP_NAME || "Hedera DApp",
                description: "Test Hedera wallet connection",
                url: "https://example.com",
                icons: ["https://example.com/icon.png"],
            };
            connector = new DAppConnector(metadata, LedgerId.MAINNET, projectId, Object.values(HederaJsonRpcMethod), [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged], [HederaChainId.Testnet, HederaChainId.Mainnet]);
            // Initialize connector
            await connector.init({ logger: "error" });
            // Open wallet modal and get the session
            const session = await connector.openModal();
            /* if (session && session.accounts && session.accounts.length > 0) {
              setAccountId(session.accounts[0]);
              console.log("Connected account:", session.accounts[0]);
            } else {
              setError("No accounts returned from wallet");
            } */
        }
        catch (err) {
            console.error(err);
            setError(err.message || "Unknown error");
        }
        finally {
            setLoading(false);
        }
    };
    return { accountId, connect, loading, error };
}
