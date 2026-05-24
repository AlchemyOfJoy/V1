/* eslint-disable */
/* global self, clients */
/* Service worker for The Alchemy of Joy.
 *
 * Scope: minimal — push delivery + click handling. Not a full PWA
 * caching strategy. Offline writes are queued in IndexedDB by the app's
 * own offline-queue.ts, which doesn't need the SW.
 *
 * Each push payload is { title, body, url }. The notification opens the
 * given URL on tap (or focuses the existing tab if already open).
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "The Alchemy of Joy", body: "", url: "/home" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png",
      badge: "/icon.png",
      data: { url: data.url },
      tag: "aoj-" + (data.title || "default"),
      renotify: false,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/home";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(target);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(target);
        }
      }),
  );
});
