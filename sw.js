/* Service Worker — مُثبِّت القرآن. النسخة: b813fbd3 */
const CACHE='qm-b813fbd3',FONTS='qm-fonts';
const SHELL=['./','index.html','app.css?v=b813fbd3','app.js?v=b813fbd3','i18n-en.js?v=b813fbd3','manifest.webmanifest','icon-192.png','privacy.html','terms.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))))});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('qm-')&&k!==CACHE&&k!==FONTS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){
  if(r.mode==='navigate'){
   const home=/\/(index\.html)?$/.test(u.pathname);
   e.respondWith(fetch(r).then(x=>{if(home&&x.ok){const cp=x.clone();caches.open(CACHE).then(c=>c.put('index.html',cp))}return x}).catch(()=>caches.match(home?'index.html':r).then(x=>x||caches.match('index.html'))));return}
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok){const cp=x.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return x})));return}
 if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
  e.respondWith(caches.open(FONTS).then(c=>c.match(r).then(h=>{const n=fetch(r).then(x=>{if(x.ok||x.type==='opaque')c.put(r,x.clone());return x}).catch(()=>h);return h||n})))}
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs[0];return c?c.focus():self.clients.openWindow('./')}))});
