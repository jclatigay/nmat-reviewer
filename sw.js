const CACHE_NAME = 'nmat-reviewer-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/tokens.css',
  './css/layout.css',
  './css/components.css',
  './css/exam-ui.css',
  './js/app.js',
  './js/router.js',
  './js/config.js',
  './js/views/home.js',
  './js/views/subjectSelect.js',
  './js/views/modeSelect.js',
  './js/views/session.js',
  './js/views/results.js',
  './js/views/review.js',
  './js/components/choiceList.js',
  './js/components/confirmModal.js',
  './js/components/examHeader.js',
  './js/components/progressBar.js',
  './js/components/questionPalette.js',
  './js/services/questionLoader.js',
  './js/services/sessionStore.js',
  './js/services/scoring.js',
  './js/services/timer.js',
  './js/utils/dom.js',
  './js/utils/format.js',
  './assets/images/icon.svg',
  './assets/images/ir-008-rotation-series.svg',
  './assets/images/ir-012-series.svg',
  './assets/images/ir-015-grouping.svg',
  './assets/images/ir-018-series.svg',
  './assets/images/ir-020-grouping.svg',
  './assets/images/ir-021-series.svg',
  './assets/images/ir-024-grouping.svg',
  './assets/images/ir-027-grouping.svg',
  './assets/images/ir-030-rotation.svg',
  './data/subjects.json',
  './data/questions/biology.json',
  './data/questions/chemistry.json',
  './data/questions/inductive-reasoning.json',
  './data/questions/perceptual-acuity.json',
  './data/questions/physics.json',
  './data/questions/quantitative.json',
  './data/questions/social-science.json',
  './data/questions/verbal.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return caches.match('./');
        });
    })
  );
});
