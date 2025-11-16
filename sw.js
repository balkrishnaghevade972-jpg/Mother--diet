/* Simple Service Worker: caches assets for offline and responds to show-notification messages */

const CACHE_NAME = 'md-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // add additional assets (icons, css) if you create them
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

/* fetch handler: prefer cache, fallback to network */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

/* handle messages from page */
self.addEventListener('message', event => {
  if(!event.data) return;
  if(event.data.type === 'show-notification'){
    const title = 'Diet Reminder';
    const options = {
      body: event.data.body || 'Time for your healthy habit',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { dateOfArrival: Date.now(), primaryKey: 1 }
    };
    self.registration.showNotification(title, options);
  }
});

/* handle push event (requires server-side push) */
self.addEventListener('push', function(event) {
  let payload = {};
  try { payload = event.data.json(); } catch(e){ payload = { body: event.data.text() }; }
  const title = payload.title || 'Diet Reminder';
  const options = {
    body: payload.body || 'Time for your healthy habit',
    icon: '/icons/icon-192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
