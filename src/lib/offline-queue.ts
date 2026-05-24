"use client";

/**
 * Offline write queue (Build Directive §10.2).
 *
 * When the user is offline (or a network request fails), POST-ish writes
 * are persisted to IndexedDB and replayed on the next 'online' event.
 * Reads are not queued — they just fail gracefully.
 *
 * The queue is a single IndexedDB object store with auto-increment keys
 * so order is preserved (FIFO). Each entry records { url, method, body,
 * kind, ts }. Kinds we know how to queue:
 *
 *   "list-of-joy"  – POST /api/curriculum/list-of-joy
 *   "joy-pulse"    – POST /api/joy-pulse
 *   "challenge"    – POST /api/curriculum/challenge/* (day check-in, ITT)
 *
 * UX: components that use queuedFetch get a "queued" response back when
 * offline. They show a soft "queued for sync" pill instead of a
 * celebration. OfflineSync (mounted in AppShell) replays on 'online' and
 * fires a single quiet "synced" toast.
 */

const DB_NAME = "aoj-offline";
const STORE = "writes";

export type QueueKind = "list-of-joy" | "joy-pulse" | "challenge" | "itt-loop";

export interface QueuedWrite {
  id?: number;
  kind: QueueKind;
  url: string;
  method: string;
  body: string;
  ts: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("No IndexedDB"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueue(write: Omit<QueuedWrite, "id">): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add(write);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function readAll(): Promise<QueuedWrite[]> {
  const db = await openDb();
  const items = await new Promise<QueuedWrite[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedWrite[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items;
}

async function deleteOne(id: number): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function pendingCount(): Promise<number> {
  try {
    const all = await readAll();
    return all.length;
  } catch {
    return 0;
  }
}

/**
 * Drop-in fetch wrapper. On network failure, queues the write and returns
 * a synthetic Response with status 202 and a body of `{ queued: true }`.
 *
 * Only enqueues POST-ish writes whose `kind` is known.
 */
export async function queuedFetch(
  url: string,
  init: RequestInit & { kind?: QueueKind } = {},
): Promise<Response> {
  const { kind, ...rest } = init;
  const method = (rest.method ?? "GET").toUpperCase();
  const isWrite = method !== "GET" && method !== "HEAD";
  const queueable = isWrite && !!kind;

  if (typeof navigator !== "undefined" && !navigator.onLine && queueable) {
    await enqueue({
      kind: kind!,
      url,
      method,
      body: typeof rest.body === "string" ? rest.body : "",
      ts: Date.now(),
    });
    return new Response(JSON.stringify({ queued: true }), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return await fetch(url, rest);
  } catch (err) {
    if (queueable) {
      await enqueue({
        kind: kind!,
        url,
        method,
        body: typeof rest.body === "string" ? rest.body : "",
        ts: Date.now(),
      });
      return new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw err;
  }
}

/**
 * Replay any queued writes in order. Returns the number successfully
 * flushed. Stops on the first network failure so order is preserved.
 */
export async function flushQueue(): Promise<number> {
  let flushed = 0;
  try {
    const all = await readAll();
    all.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    for (const w of all) {
      try {
        const res = await fetch(w.url, {
          method: w.method,
          headers: { "Content-Type": "application/json" },
          body: w.body,
        });
        if (!res.ok && res.status >= 500) {
          // Server error — stop and try again later
          break;
        }
        // 4xx is considered "permanently failed" — drop it so it doesn't
        // poison the queue. The user already moved on.
        if (typeof w.id === "number") await deleteOne(w.id);
        flushed++;
      } catch {
        // Network failure — stop and retry later
        break;
      }
    }
  } catch {
    // IDB unavailable — nothing to do
  }
  return flushed;
}
