// 弱网缓存（Service Worker）
//
// - 页面：先从网上取最新的，取不到再用上次看过的。
// - 带哈希的样式、脚本、字体：内容不会变，直接用缓存。
// - 图片：有缓存就直接用；缓存超过一周时，先用旧的，同时在后台更新。
//
// 如果哪天需要停用，把这个文件换成：
//   self.addEventListener('install', () => self.skipWaiting());
//   self.addEventListener('activate', () => self.registration.unregister());

const VERSION = 'v1';
const STATIC = `static-${VERSION}`;
const MEDIA = `media-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const MEDIA_LIMIT = 500;
const MEDIA_MAX_AGE = 7 * 24 * 3600 * 1000;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = [STATIC, MEDIA, PAGES];
      for (const key of await caches.keys()) if (!keep.includes(key)) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (/^\/(_astro|fonts)\//.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (/^\/(thumbs|images|art)\//.test(url.pathname) || /\.(webp|png|jpe?g|ico)$/.test(url.pathname)) {
    event.respondWith(media(event, request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) || (await cache.match('/'));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function refresh(request) {
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    // 不等写完缓存，先把图片交给页面
    caches.open(MEDIA).then(async (cache) => {
      await cache.put(request, copy);
      if (Math.random() < 0.05) await trim(cache);
    });
  }
  return response;
}

async function media(event, request) {
  const cached = await caches.match(request, { cacheName: MEDIA });
  if (!cached) return refresh(request);
  const age = Date.now() - Date.parse(cached.headers.get('date') || '');
  if (!(age < MEDIA_MAX_AGE)) event.waitUntil(refresh(request).catch(() => {}));
  return cached;
}

async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MEDIA_LIMIT))) await cache.delete(key);
}
