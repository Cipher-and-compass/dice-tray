// Hero's Dice Tray: offline support. Keeps a copy of the app on the phone.
// When you change any file, bump VERSION so phones fetch the new copy.
const VERSION = "dice-tray-v4";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png", "icons/favicon-32.png",
  "fonts/alegreya-sc-latin-500-normal.woff2", "fonts/alegreya-sc-latin-700-normal.woff2",
  "fonts/alegreya-sc-latin-800-normal.woff2", "fonts/alegreya-latin-400-normal.woff2",
  "fonts/alegreya-latin-600-normal.woff2", "fonts/alegreya-latin-400-italic.woff2",
  "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Only this app's own files are ever served; nothing is sent anywhere.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
