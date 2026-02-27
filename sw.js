const CACHE_NAME = 'simplespil-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/shared/style.css',
  '/shared/stats.js',
  '/jump/index.html',
  '/jump/jump.css',
  '/jump/jump.js',
  '/puzzle/index.html',
  '/puzzle/puzzle.css',
  '/puzzle/puzzle.js',
  '/labyrinth/index.html',
  '/labyrinth/labyrinth.css',
  '/labyrinth/labyrinth.js',
  '/fourinarow/index.html',
  '/fourinarow/fourinarow.css',
  '/fourinarow/fourinarow.js',
  '/dressup/index.html',
  '/dressup/dressup.css',
  '/dressup/dressup.js',
  '/tetris/index.html',
  '/tetris/tetris.css',
  '/tetris/tetris.js',
  '/whacamole/index.html',
  '/whacamole/whacamole.css',
  '/whacamole/whacamole.js',
  '/catch/index.html',
  '/catch/catch.css',
  '/catch/catch.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
