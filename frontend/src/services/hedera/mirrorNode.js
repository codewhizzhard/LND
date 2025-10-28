const MIRROR_NODE_API_URL = "https://mainnet-public.mirrornode.hedera.com/api/v1";
export async function getAccountIdsFromPublicKey(publicKeyHex) {
    try {
        const res = await fetch(`${MIRROR_NODE_API_URL}/accounts?account.key=${publicKeyHex}`);
        const data = await res.json();
        if (data.accounts && data.accounts.length > 0) {
            return data.accounts.map((acc) => acc.account);
        }
        return [];
    }
    catch (err) {
        console.error("Mirror Node fetch error:", err);
        return [];
    }
}
