const CACHE = 'mylifeos-public-v1';
const PUBLIC_FILES = ['/offline.html', '/icons/app-180.png', '/icons/app-192.png', '/icons/app-512.png', '/icons/app.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC_FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mylifeos-public-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim(),
  ]));
});
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Supabase/Auth, external requests and all mutations always use the network.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match('/offline.html')) || Response.error()));
    return;
  }
  if (!url.pathname.startsWith('/assets/') && !PUBLIC_FILES.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      await cache.put(request, response.clone());
      const keys = await cache.keys();
      const assets = keys.filter(key => new URL(key.url).pathname.startsWith('/assets/'));
      await Promise.all(assets.slice(0, Math.max(0, assets.length - 60)).map(key => cache.delete(key)));
    }
    return response;
  })());
});
