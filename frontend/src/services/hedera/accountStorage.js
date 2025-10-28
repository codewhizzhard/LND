// src/services/accountStorage.ts
export async function saveAccountIdToDb(dbKey, accountId) {
    localStorage.setItem(dbKey, accountId);
}
export async function getAccountIdFromDb(dbKey) {
    return localStorage.getItem(dbKey);
}
