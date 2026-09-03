/* Service worker: makes the site open instantly and work with no connection.
 *
 * The cache name carries a version. Changing it is what triggers an update: a byte-different
 * sw.js makes the browser install this file as a new worker, `install` fills a brand-new cache
 * under the new name, and `activate` deletes every cache that is not it. Bump BUILD whenever
 * anything under site/ changes — it is the same discipline as the ?v= query in index.html, and
 * the two are bumped together.
 *
 * Strategies, chosen per file type rather than one rule for everything:
 *
 *   HTML  — network first. The page shell is what carries the ?v= references to css/js, so a
 *           stale shell would keep pointing at old assets. Falls back to cache offline.
 *   data  — cache first, refreshed in the background (stale-while-revalidate). Recipes and tips
 *           are large and change rarely; showing yesterday's copy for one paint while today's
 *           downloads is the whole reason the app feels instant.
 *   css/js— cache first, no revalidation needed: they are versioned by ?v=, so a changed file
 *           is a different URL and simply misses the cache.
 *
 * Deliberately NOT cached: the two source archives (source.html, source_tips.html, ~1.4 MB) —
 * they are only reached by the "View original source" link, so paying for them on every install
 * would nearly double the offline footprint for a page most readers never open. They fall
 * through to the network and are simply unavailable offline.
 */

const BUILD = "v40";
const CACHE = `bakestack-${BUILD}`;

// Everything needed to render the app offline in the language most visitors use. The other
// language's data is not precached: it is fetched at idle by the page itself and lands in the
// cache through the same fetch handler, so it becomes available offline once used.
const PRECACHE = [
  "./",
  "./index.html",
  `./css/tokens.css?v=${BUILD.slice(1)}`,
  `./css/app.css?v=${BUILD.slice(1)}`,
  `./js/density.js?v=${BUILD.slice(1)}`,
  `./js/data.js?v=${BUILD.slice(1)}`,
  `./js/i18n.js?v=${BUILD.slice(1)}`,
  `./js/state.js?v=${BUILD.slice(1)}`,
  `./js/app.js?v=${BUILD.slice(1)}`,
  "./icon.svg",
  "./data/recipes.json",
  "./data/tips.json",
  "./data/tags.json",
  "./data/tags_en.json",
  "./data/tags_lt.json",
  "./data/prices.json",
  "./data/density.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll is atomic — one 404 would reject the whole install and leave the old worker in
      // place, which is the safe failure. Individual failures are tolerated instead so a single
      // renamed data file cannot permanently block updates for everyone.
      Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {})
        )
      )
    )
  );
  // Do NOT skipWaiting here. The new worker waits until the page asks for it, so a reader is
  // never swapped onto new code mid-recipe; index.html shows the "new version" prompt and
  // posts SKIP_WAITING when the reader accepts.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

const isData = (url) => url.pathname.includes("/data/");
const isAsset = (url) => /\.(css|js|svg)$/.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only this origin. Fonts come from Google/Fontshare and are left to the browser's own HTTP
  // cache: they are opaque cross-origin responses, which cannot be inspected for success and
  // would silently poison the cache with error pages.
  if (url.origin !== self.location.origin) return;

  // The two source archives: never cached, always straight to the network.
  if (/source(_tips)?\.html$/.test(url.pathname)) return;

  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  if (isData(url)) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  if (isAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});
