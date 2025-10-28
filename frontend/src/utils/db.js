// src/utils/db.ts
import { openDB } from "idb";
const DB_NAME = "hedera_wallet_db";
const DB_VERSION = 1;
const STORE_NAME = "keystore";
export async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}
export async function saveToDB(key, value) {
    const db = await getDB();
    await db.put(STORE_NAME, value, key);
}
export async function getFromDB(key) {
    const db = await getDB();
    return (await db.get(STORE_NAME, key)) ?? null;
}
export async function deleteFromDB(key) {
    const db = await getDB();
    await db.delete(STORE_NAME, key);
}
