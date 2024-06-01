import { precacheAndRoute } from 'workbox-precaching';

// Define the list of URLs to precache
const urlsToCache = [
  // Add URLs to precache here
  '/index.html',
  '/styles.css',
  // Add more URLs as needed
];

self.__WB_MANIFEST = urlsToCache;
precacheAndRoute(urlsToCache);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
