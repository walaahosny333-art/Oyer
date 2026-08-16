const CACHE="tfv-shell-v2";
const APP=["./","./index.html","./manifest.webmanifest","./sw.js"];
const OCR=[
  "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",
  "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",
  "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core.wasm.js",
  "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-simd.wasm.js",
  "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-lstm.wasm.js",
  "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-simd-lstm.wasm.js",
  "https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz"
];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(async c=>{
    await c.addAll(APP);
    // Best effort: cross-origin resources may be opaque or unavailable; Tesseract also caches language data in IndexedDB.
    await Promise.allSettled(OCR.map(u=>fetch(u,{mode:"cors"}).then(r=>{if(r.ok)return c.put(u,r.clone())})));
    self.skipWaiting();
  }));
});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  const u=e.request.url;
  if(u.startsWith(self.location.origin) || OCR.includes(u)){
    e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
      if(r.ok){const cp=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cp));}
      return r;
    })));
  }
});
