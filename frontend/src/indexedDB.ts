// indexeddb-helpers.ts

const dbName = "web3AuthHederaDb";
const storeName = "accounts";
const dbVersion = 1;

let db: IDBDatabase | null = null;

/**
 * Initializes the IndexedDB database.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request: IDBOpenDBRequest = indexedDB.open(dbName, dbVersion);

    request.onerror = (event: Event) => {
      reject("IndexedDB error: " + (event.target as IDBRequest).error);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const dbInstance = (event.target as IDBRequest).result as IDBDatabase;
      if (!dbInstance.objectStoreNames.contains(storeName)) {
        dbInstance.createObjectStore(storeName, { keyPath: 'loginKey' });
      }
    };

    request.onsuccess = (event: Event) => {
      db = (event.target as IDBRequest).result as IDBDatabase;
      resolve(db);
    };
  });
}

/**
 * Retrieves a Hedera Account ID from IndexedDB.
 * @param {string} loginKey - The unique key for the user (e.g., `google_user@email.com`).
 * @returns {Promise<string | undefined>} A promise that resolves with the account ID or undefined if not found.
 */// indexeddb-helpers.ts

// ... (existing dbName, storeName, dbVersion, db variable, openDatabase function) ...

export async function getAccountIdFromDb(loginKey: string): Promise<string | undefined> {
  console.log("getAccountIdFromDb called with loginKey:", loginKey); // DEBUG 1

  try {
    const db = await openDatabase();
    console.log("Database opened successfully for getAccountIdFromDb."); // DEBUG 2

    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request: IDBRequest = objectStore.get(loginKey);

    return new Promise((resolve) => {
      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        console.log("IndexedDB get() result:", result); // DEBUG 3

        if (result && result.accountId) {
          console.log("Found accountId:", result.accountId); // DEBUG 4
          resolve(result.accountId);
        } else {
          console.log("No accountId found for loginKey:", loginKey); // DEBUG 5
          resolve(undefined);
        }
      };
      request.onerror = (event: Event) => { // Added type for event
        console.error("IndexedDB get() request error:", (event.target as IDBRequest).error); // DEBUG 6
        resolve(undefined);
      };
    });
  } catch (error) {
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
export async function saveAccountIdToDb(loginKey: string, accountId: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    objectStore.put({ loginKey, accountId });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (event: Event) => {
        reject("Error saving to IndexedDB: " + (event.target as IDBTransaction).error);
      };
    });
  } catch (error) {
    console.error("Error saving to IndexedDB:", error);
  }
}

