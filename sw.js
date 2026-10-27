const CACHE='games-v2';
const FILES=["./checkers/checkers.js","./checkers/index.html","./chess/chess.js","./chess/index.html","./icons/icon-192.png","./icons/icon-512.png","./index.html","./js/board3d.js","./js/checkers-rules.js","./js/pieces.js","./js/ui.css","./lib/chess.js","./lib/three.core.js","./lib/three.module.js","./manifest.webmanifest","./pop/index.html",'./','./chess/','./checkers/','./pop/'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
