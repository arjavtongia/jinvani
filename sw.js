/*
 * Offline support. Every file is saved on the phone the first time the app opens,
 * so it keeps working without internet. Saved copies are refreshed in the
 * background whenever there is internet, so text corrections reach everyone.
 * Change VERSION when adding or removing files in the list below.
 */
const VERSION = 'jinvani-v4';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/strings.js',
  'js/icons.js',
  'js/translit.js',
  'js/panchang.js',
  'js/drawings.js',
  'js/app.js',
  'content/books.json',
  'content/categories.json',
  'content/chitra.json',
  'content/namokar.txt',
  'content/darshan-path.txt',
  'content/darshan-stuti.txt',
  'content/bhaktamar.txt',
  'content/barah-bhavana.txt',
  'content/tattvarth-sutra.txt',
  'content/mandir-darshan.txt',
  'content/pooja-vidhi.txt',
  'fonts/noto-serif-devanagari-devanagari-400-normal.woff2',
  'fonts/noto-serif-devanagari-devanagari-600-normal.woff2',
  'fonts/noto-serif-devanagari-latin-400-normal.woff2',
  'fonts/noto-serif-devanagari-latin-600-normal.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  /* Page loads always get the app shell, so deep links work offline too. */
  const key = req.mode === 'navigate' ? './' : req;

  event.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(key, { ignoreSearch: true }).then(cached => {
        const fresh = fetch(req.mode === 'navigate' ? './' : req, { cache: 'no-cache' })
          .then(res => {
            if (res && res.ok) cache.put(key, res.clone());
            return res;
          })
          .catch(() => cached);
        if (cached) {
          event.waitUntil(fresh.catch(() => {}));
          return cached;
        }
        return fresh;
      })
    )
  );
});
