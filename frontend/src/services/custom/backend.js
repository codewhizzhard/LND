/**
 * Get accountId from backend using publicKey
 * @param publicKey Hex string of the user's Hedera public key
 * @returns accountId or null if not found
 */
export async function getAccountIdFromBackend(publicKey, phoneHash) {
    try {
        const res = await fetch("/get-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey, phoneHash }),
        });
        if (!res.ok)
            throw new Error(`Backend GET account failed: ${res.statusText}`);
        const data = await res.json();
        return data.accountId || null;
    }
    catch (err) {
        console.error("Error fetching account from backend:", err);
        return null;
    }
}
/**
 * Create a new account on the backend using publicKey
 * @param publicKey Hex string of the user's Hedera public key
 * @returns newly created accountId
 */
export async function createAccountOnBackend(publicKey, phoneHash) {
    try {
        const res = await fetch("/create-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey, phoneHash }),
        });
        if (!res.ok)
            throw new Error(`Backend CREATE account failed: ${res.statusText}`);
        const data = await res.json();
        if (!data.accountId)
            throw new Error("No accountId returned from backend");
        return data.accountId;
    }
    catch (err) {
        console.error("Error creating account on backend:", err);
        throw err;
    }
}
/**
 * Unified backend helper for self-custodian or cross-project flow
 */
const verifyAndGetAccountId = async (publicKey, signature, challenge) => {
    if (signature && challenge) {
        // Call your backend endpoint to verify signature + challenge
        const res = await fetch("/api/verify-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey, signature, challenge }),
        });
        const data = await res.json();
        if (data.accountId)
            return data.accountId;
    }
};
export async function getOrCreateAccountOnBackend({ publicKey, signature, challenge, }) {
    // If signature & challenge are provided, you can optionally verify on backend
    // Otherwise just create / fetch account for self-custodian
    if (signature && challenge) {
        // send signature & challenge to backend for verification
        const verifiedAccountId = await verifyAndGetAccountId(publicKey, signature, challenge);
        if (verifiedAccountId)
            return verifiedAccountId;
    }
    // fallback: self-custodian flow
    let accountId = await getAccountIdFromBackend(publicKey);
    if (!accountId) {
        accountId = await createAccountOnBackend(publicKey);
    }
    return accountId;
}
