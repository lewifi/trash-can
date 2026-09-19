/*
 * Service worker for trash-can.net.
 *
 * The point of this file is the buried world: it is the heaviest page on the
 * site and the one most likely to be opened on a phone with a bad connection.
 * Everything here is arranged so a second visit is instant WITHOUT ever being
 * able to serve someone a stale build, which is the usual way service workers
 * ruin a live site.
 *
 * How staleness is avoided, in order of how much it matters:
 *
 *  1. HTML is network first. A deploy changes index.html, and index.html is
 *     what names the hashed asset bundles, so a reachable network always wins
 *     and the cache is only a fallback for being offline.
 *  2. Vite's assets carry a content hash in the filename, so they are
 *     immutable. Cache first is correct for them and cannot go stale: a new
 *     build simply asks for a different URL.
 *  3. secretworld.html is NOT hashed (it is served raw out of public/), so it
 *     is network first too. Caching it hard would freeze the world at whatever
 *     build a player first saw.
 *  4. Every cache is keyed by VERSION. Bump it and activate wipes everything
 *     that does not match, so there is no way to accumulate old junk.
 *  5. /api/* is never touched. Dumps, the leaderboard and the roast endpoints
 *     are dynamic and a cached answer would be a bug.
 *
 * Audio is deliberately NOT cached. Media elements fetch with Range headers and
 * the Cache API refuses to store the 206 responses that come back, so trying
 * would fail quietly and waste effort. The three tracks are also about thirty
 * megabytes together, which is not a polite thing to force into someone's
 * storage quota.
 *
 * Keep VERSION in step with APP_VERSION in src/App.tsx.
 */

var VERSION = "2.10.0";
var SHELL = "shell-" + VERSION;   // pages and the app shell
var STATIC = "static-" + VERSION; // hashed bundles, icons, cursors, the CDN copy of three

// Worth having before the network is gone. Deliberately small: the hashed
// bundles are not listed because their names are only known at build time, and
// they populate themselves on first visit anyway.
var PRECACHE = [
  "/",        // the buried world: the landing page
  "/oracle",  // the app shell, and the offline fallback for unknown routes
  "/site.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/axe-cursor.png",
  "/axe-cursor-active.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(SHELL)
      .then(function (cache) {
        // addAll is all-or-nothing, and one missing icon should not stop the
        // whole worker installing, so they go in individually.
        return Promise.all(
          PRECACHE.map(function (url) {
            return cache.add(new Request(url, { cache: "reload" })).catch(function () {});
          })
        );
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== SHELL && key !== STATIC) return caches.delete(key);
            return null;
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

function networkFirst(request, cacheName) {
  return fetch(request)
    .then(function (response) {
      if (response && response.ok && response.type === "basic") {
        var copy = response.clone();
        caches.open(cacheName).then(function (c) {
          c.put(request, copy).catch(function () {});
        });
      }
      return response;
    })
    .catch(function () {
      return caches.match(request).then(function (hit) {
        // An unknown path offline still deserves the app shell rather than the
        // browser's error page: the SPA can render from there. That is /oracle,
        // not "/" — the root is the buried world.
        return hit || caches.match("/oracle");
      });
    });
}

function cacheFirst(request, cacheName) {
  return caches.match(request).then(function (hit) {
    if (hit) return hit;
    return fetch(request).then(function (response) {
      // Opaque responses (the CDN copy of three) have status 0 but are still
      // worth keeping; anything that actually failed is not.
      if (response && (response.ok || response.type === "opaque")) {
        var copy = response.clone();
        caches.open(cacheName).then(function (c) {
          c.put(request, copy).catch(function () {});
        });
      }
      return response;
    });
  });
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  // Never cache the API, and never get in its way.
  if (url.origin === self.location.origin && url.pathname.indexOf("/api/") === 0) return;

  // Range requests (audio and video seeking) must go straight to the network:
  // the Cache API cannot store the partial responses they produce.
  if (request.headers.get("range")) return;

  // Audio is streamed, never stored. See the note at the top.
  if (/\.(mp3|m4a|ogg|wav)$/i.test(url.pathname)) return;

  // three.js from the CDN: immutable at a pinned version, so keep it. This is
  // what lets the world boot at all on a bad connection.
  if (url.origin === "https://cdnjs.cloudflare.com") {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Hashed build output is immutable, so it can be served from cache outright.
  if (url.pathname.indexOf("/assets/") === 0) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // Icons, cursors and the manifest: small, stable, and fine from cache with a
  // refresh happening quietly behind it.
  if (/\.(png|svg|ico|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(function (hit) {
        var live = fetch(request)
          .then(function (response) {
            if (response && response.ok) {
              var copy = response.clone();
              caches.open(STATIC).then(function (c) {
                c.put(request, copy).catch(function () {});
              });
            }
            return response;
          })
          .catch(function () {
            return hit;
          });
        return hit || live;
      })
    );
    return;
  }

  // Pages, and the unhashed world with them: the network decides, always.
  if (request.mode === "navigate" || /\.html$/i.test(url.pathname) || url.pathname === "/secretroom") {
    event.respondWith(networkFirst(request, SHELL));
  }
});
