// POKAŽDÉ, KDYŽ ZMĚNÍTE DATA NEBO HTML, ZVYŠTE TOTO ČÍSLO (v1 -> v2 -> v3...)
const VERSION = 'v2'; 
const CACHE_NAME = 'sklad-app-' + VERSION;

const ASSETS = [
  './',
  './index.html',
  './data.csv',
  './manifest.json',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'
];

// 1. INSTALACE: Uloží nové soubory a okamžitě převezme kontrolu (skipWaiting)
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Důležité: Nečekat na zavření záložek, hned se instalovat
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Ukládám novou verzi:', VERSION);
      return cache.addAll(ASSETS);
    })
  );
});

// 2. AKTIVACE: Smaže staré verze cache a převezme kontrolu nad stránkou
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Pokud klíč cache neodpovídá aktuální verzi, smaž ho
          if (key !== CACHE_NAME) {
            console.log('Mazání staré cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Okamžitě začít ovládat všechny otevřené stránky
    })
  );
});

// 3. FETCH: Pokud jsme offline, vrať cache. Pokud jsme online, zkus síť.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Vrať z cache pokud existuje, jinak stahuj
      return response || fetch(e.request);
    })
  );
});
