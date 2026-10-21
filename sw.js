// Bump VERSION whenever the app changes, together with APP_VERSION in index.html, to the same number:
// the install checks they match.
const VERSION = 'phase10-tracker-v6';
// Every file the app needs offline. Add any new file here.
const CORE = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './fonts/Jost-Variable.woff2'
];

// cache: 'reload' skips the phone's web cache, so a new version never stores stale files (Swipe Snake v5 lesson).
// Install: fetch every file fresh and store it under its plain address.
// - cache: 'reload' skips the phone's own web cache.
// - ?v=<VERSION> makes each address new to GitHub Pages' CDN, which can otherwise serve the
//   previous version's files for a few minutes after a deploy (Pocket Factory got stuck that way).
// - Finally, check index.html really is this version; if not, fail the install so the phone
//   tries again on its next update check rather than installing old files.
const APP_VERSION = VERSION.replace('phase10-tracker-v', '');
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await Promise.all(CORE.map(async u => {
      const res = await fetch(new Request(`${u}?v=${VERSION}`, { cache: 'reload' }));
      if (!res.ok) throw new Error(`${u}: ${res.status}`);
      await c.put(u, res);
    }));
    const page = await (await c.match('./index.html')).text();
    if (!page.includes(`APP_VERSION = '${APP_VERSION}'`)) {
      await caches.delete(VERSION);
      throw new Error('fetched files are from an older version; will retry');
    }
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

// Cache-first, filling the cache as we go; fall back to the app page when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
