// utils/errorUtils.ts

/**
 * Safely extracts a string message from an unknown error type.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    // Handle cases where the error is an object with a message property.
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
        return (error as { message: string }).message;
    }
    return 'An unexpected error occurred.';
}


// src/utils/hederaBalance.ts
export async function getHederaBalance(accountId: string): Promise<number> {
  if (!accountId) throw new Error("Account ID is required");

  const url = `https://testnet.mirrornode.hedera.com/api/v1/balances?account.id=${accountId}`;

  try {
    const res = await fetch(url);
    console.log("balance:", res)
    if (!res.ok) {
      throw new Error(`Mirror Node error: ${res.status}`);
    }

    const data = await res.json();
    // Response format: { balances: [{ account: "0.0.12345", balance: 100000000, tokens: [...] }], timestamp: "..." }
    const balanceTinybars = data.balances?.[0]?.balance ?? 0;
    const balanceHbar = balanceTinybars / 100_000_000; // convert tinybars to HBAR

    return balanceHbar;
  } catch (err: any) {
    console.error("Failed to fetch balance:", err);
    throw new Error("Unable to fetch balance");
  }
}
