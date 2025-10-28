// src/services/accountStorage.ts
export async function saveAccountIdToDb(dbKey: string, accountId: string) {
    localStorage.setItem(dbKey, accountId);
}

export async function getAccountIdFromDb(dbKey: string): Promise<string | null> {
    return localStorage.getItem(dbKey);
}
