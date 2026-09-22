---
layout: null
---
// Retire the old cache-first worker. The editorial site no longer registers it,
// but existing installations can otherwise keep serving an outdated homepage.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith('bazlur-blog-'))
      .map(name => caches.delete(name)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
