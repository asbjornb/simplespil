const CACHE_NAME = 'simplespil-v2';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/shared/style.css',
  '/shared/stats.js',
  '/jump/index.html',
  '/jump/jump.css',
  '/jump/jump.js',
  '/jump/icon.js',
  '/puzzle/index.html',
  '/puzzle/puzzle.css',
  '/puzzle/puzzle.js',
  '/puzzle/icon.js',
  '/labyrinth/index.html',
  '/labyrinth/labyrinth.css',
  '/labyrinth/labyrinth.js',
  '/labyrinth/icon.js',
  '/fourinarow/index.html',
  '/fourinarow/fourinarow.css',
  '/fourinarow/fourinarow.js',
  '/fourinarow/icon.js',
  '/dressup/index.html',
  '/dressup/dressup.css',
  '/dressup/dressup.js',
  '/dressup/icon.js',
  '/tetris/index.html',
  '/tetris/tetris.css',
  '/tetris/tetris.js',
  '/tetris/icon.js',
  '/whacamole/index.html',
  '/whacamole/whacamole.css',
  '/whacamole/whacamole.js',
  '/whacamole/icon.js',
  '/catch/index.html',
  '/catch/catch.css',
  '/catch/catch.js',
  '/catch/icon.js',
  '/memory/index.html',
  '/memory/memory.js',
  '/memory/memory.css',
  '/memory/icon.js',
  '/match/index.html',
  '/match/match.css',
  '/match/match.js',
  '/match/icon.js',
  '/candy/index.html',
  '/candy/candy.css',
  '/candy/candy.js',
  '/candy/icon.js',
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
