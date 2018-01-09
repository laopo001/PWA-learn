import {
  Promise
} from "q";
import {
  Client
} from "_debugger";

var VERSION = 'v0';

var cacheFiles = [
  '/vendor.bundle.js'
];

var hostReg = /localhost/;

self.addEventListener('install', function (evt) {
  console.log('installing…');
  evt.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener('activate', function (event) {
  console.log('activating…');
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== VERSION) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});


self.addEventListener('fetch', function (evt) {
  // console.log(evt.request.url);
  evt.respondWith(
    caches.match(evt.request).then(function (response) {
      if (response) {
        return response;
      }
      var request = evt.request.clone();
      return fetch(request).then(function (response) {
        if (response && response.status === 200 && response.url.match(hostReg)) {
          var responseClone = response.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put(evt.request, responseClone);
          });
        }
        return response;
      });
    })
  )
});
