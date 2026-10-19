/* RUNK 서비스 워커: 한 번 열면 오프라인에서도 실행.
 * 네트워크 우선(새 버전이 있으면 바로 반영, 깃허브 페이지 HTTP 캐시 10분도 건너뜀) → 실패하면 캐시.
 * CACHE 값은 빌드 때 바뀐다(make_pwa.py). 구조는 컬러소트 브레이커 pwa/sw.js와 같다. */
const CACHE = 'runk-20261019173849';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    (same ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(e.request)).then((res) => {
      if (res.ok && same) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
