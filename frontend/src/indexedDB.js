// indexeddb-helpers.ts
const dbName = "web3AuthHederaDb";
const storeName = "accounts";
const dbVersion = 1;
let db = null;
/**
 * Initializes the IndexedDB database.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = (event) => {
            reject("IndexedDB error: " + event.target.error);
        };
        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            if (!dbInstance.objectStoreNames.contains(storeName)) {
                dbInstance.createObjectStore(storeName, { keyPath: 'loginKey' });
            }
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}
/**
 * Retrieves a Hedera Account ID from IndexedDB.
 * @param {string} loginKey - The unique key for the user (e.g., `google_user@email.com`).
 * @returns {Promise<string | undefined>} A promise that resolves with the account ID or undefined if not found.
 */ // indexeddb-helpers.ts
// ... (existing dbName, storeName, dbVersion, db variable, openDatabase function) ...
export async function getAccountIdFromDb(loginKey) {
    console.log("getAccountIdFromDb called with loginKey:", loginKey); // DEBUG 1
    try {
        const db = await openDatabase();
        console.log("Database opened successfully for getAccountIdFromDb."); // DEBUG 2
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(loginKey);
        return new Promise((resolve) => {
            request.onsuccess = (event) => {
                const result = event.target.result;
                console.log("IndexedDB get() result:", result); // DEBUG 3
                if (result && result.accountId) {
                    console.log("Found accountId:", result.accountId); // DEBUG 4
                    resolve(result.accountId);
                }
                else {
                    console.log("No accountId found for loginKey:", loginKey); // DEBUG 5
                    resolve(undefined);
                }
            };
            request.onerror = (event) => {
                console.error("IndexedDB get() request error:", event.target.error); // DEBUG 6
                resolve(undefined);
            };
        });
    }
    catch (error) {
        console.error("Error retrieving from IndexedDB in getAccountIdFromDb:", error); // DEBUG 7
        return undefined;
    }
}
// ... (saveAccountIdToDb function) ...
/**
 * Saves a Hedera Account ID to IndexedDB.
 * @param {string} loginKey - The unique key for the user.
 * @param {string} accountId - The Hedera Account ID to store.
 * @returns {Promise<void>} A promise that resolves when the save is complete.
 */
export async function saveAccountIdToDb(loginKey, accountId) {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        objectStore.put({ loginKey, accountId });
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = (event) => {
                reject("Error saving to IndexedDB: " + event.target.error);
            };
        });
    }
    catch (error) {
        console.error("Error saving to IndexedDB:", error);
    }
}
