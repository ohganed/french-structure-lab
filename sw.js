'use strict';
const CACHE='fsl-cache-v0.9.0';
const CORE=['./','./index.html','./app.js','./data.js','./curriculum.js','./learning-insights.js','./styles.css','./exam.html','./exam.js','./exam-data.js','./exam-expansion.js','./exam.css','./language-mode.js','./immersion-levels.js','./cognition-language.js','./cognition.html','./manifest.webmanifest','./favicon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fsl-cache-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{if(resp.ok){const clone=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});}return resp;})));});
