const DB_NAME = 'mugina_offline';
const DB_VERSION = 1;
const TICKETS_STORE = 'event_tickets';
const SCAN_QUEUE_STORE = 'scan_queue';

let db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(TICKETS_STORE)) {
        const store = database.createObjectStore(TICKETS_STORE, { keyPath: 'eventId' });
        store.createIndex('eventId', 'eventId', { unique: true });
      }
      if (!database.objectStoreNames.contains(SCAN_QUEUE_STORE)) {
        database.createObjectStore(SCAN_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function cacheEventTickets(eventId: string, tickets: Array<{ id: string; isUsed: boolean }>) {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction(TICKETS_STORE, 'readwrite');
    const store = tx.objectStore(TICKETS_STORE);
    store.put({ eventId, tickets, cachedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedEventTickets(eventId: string): Promise<Array<{ id: string; isUsed: boolean }> | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(TICKETS_STORE, 'readonly');
    const store = tx.objectStore(TICKETS_STORE);
    const request = store.get(eventId);
    request.onsuccess = () => resolve(request.result?.tickets || null);
    request.onerror = () => reject(request.error);
  });
}

export async function markTicketUsedOffline(eventId: string, ticketId: string) {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction(TICKETS_STORE, 'readwrite');
    const store = tx.objectStore(TICKETS_STORE);
    const request = store.get(eventId);
    request.onsuccess = () => {
      const record = request.result;
      if (record) {
        record.tickets = record.tickets.map((t: any) =>
          t.id === ticketId ? { ...t, isUsed: true } : t
        );
        store.put(record);
      }
      tx.oncomplete = () => resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export interface OfflineScan {
  qrPayload: string;
  eventId: string;
  scannedAt: string;
  localResult: 'valid' | 'already_used' | 'invalid';
}

export async function queueOfflineScan(scan: OfflineScan) {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction(SCAN_QUEUE_STORE, 'readwrite');
    tx.objectStore(SCAN_QUEUE_STORE).add(scan);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineScanQueue(): Promise<Array<OfflineScan & { id: number }>> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(SCAN_QUEUE_STORE, 'readonly');
    const request = tx.objectStore(SCAN_QUEUE_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearScanQueue() {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction(SCAN_QUEUE_STORE, 'readwrite');
    tx.objectStore(SCAN_QUEUE_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
