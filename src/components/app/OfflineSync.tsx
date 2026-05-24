"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { flushQueue, pendingCount } from "@/lib/offline-queue";

/**
 * Mounts globally in AppShell. Watches for online/offline transitions
 * and flushes the offline write queue on reconnect. Shows a tiny status
 * pill — "offline · N queued" while offline; "synced ✓ N" briefly after
 * a successful flush.
 *
 * No noise. No banners that shove content. Just a quiet floating chip.
 */
export default function OfflineSync() {
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [synced, setSynced] = useState<number | null>(null);

  useEffect(() => {
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    pendingCount().then(setQueued);

    async function onOnline() {
      setOnline(true);
      const n = await flushQueue();
      const after = await pendingCount();
      setQueued(after);
      if (n > 0) {
        setSynced(n);
        // Refresh server-rendered surfaces so the new state appears
        router.refresh();
        setTimeout(() => setSynced(null), 4000);
      }
    }
    function onOffline() {
      setOnline(false);
    }
    function onQueued() {
      pendingCount().then(setQueued);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("aoj:queued", onQueued);
    // Periodic flush in case 'online' didn't fire (some browsers miss it
    // on flaky connections). Cheap — just a single getAll.
    const interval = setInterval(async () => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        const n = await flushQueue();
        const after = await pendingCount();
        setQueued(after);
        if (n > 0) {
          setSynced(n);
          router.refresh();
          setTimeout(() => setSynced(null), 4000);
        }
      }
    }, 30000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("aoj:queued", onQueued);
      clearInterval(interval);
    };
  }, [router]);

  if (online && queued === 0 && synced === null) return null;
  const offlineLabel = !online
    ? queued > 0
      ? `Offline · ${queued} queued`
      : "Offline"
    : null;
  const syncedLabel = synced !== null ? `Synced · ${synced}` : null;
  const queuedLabel =
    online && queued > 0 && synced === null ? `${queued} queued` : null;
  const label = offlineLabel ?? syncedLabel ?? queuedLabel;
  if (!label) return null;
  const tone =
    synced !== null
      ? "bg-cyan-deep text-white"
      : !online
        ? "bg-navy text-white"
        : "bg-white text-navy ring-1 ring-navy/15";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold tracking-wide shadow-lg ${tone} lg:bottom-6`}
    >
      <span aria-hidden className="mr-1.5">
        {synced !== null ? "✓" : !online ? "○" : "↻"}
      </span>
      {label}
    </div>
  );
}
