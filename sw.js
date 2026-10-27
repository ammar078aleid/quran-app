/* مُثبِّت القرآن — عمل بدون إنترنت (ضعه بجانب index.html) */
/* غيّر رقم النسخة C عند أي تعديل على هذا الملف ليتحدّث عند المستخدمين */
const C='qmrm-v4',SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
/* لا يفشل التثبيت كله إذا غاب ملف واحد من القائمة */
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
/* الضغط على إشعار (منبّه/تذكير) يفتح التطبيق أو يعيده للواجهة */
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return self.clients.openWindow('./')}))});
/* بيانات الحساب وتسجيل الدخول لا تُخزَّن أبداً */
const SKIP=/firestore\.googleapis\.com|identitytoolkit|securetoken|apis\.google\.com|accounts\.google\.com|www\.googleapis\.com|firebaseinstallations/;
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(SKIP.test(u.hostname)||u.pathname.startsWith('/__/auth')||u.pathname.startsWith('/__/firebase'))return;
  // الصفحة نفسها: الأحدث من الإنترنت أولاً، وعند انقطاعه النسخة المخزّنة (فيظهر التحديث الجديد مباشرة)
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./index.html',cp)).catch(()=>{});return res}).catch(()=>caches.match('./index.html')));return}
  // باقي الملفات (خطوط، أيقونات، فايربيز): المخزّن أولاً مع تحديثه في الخلفية
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res}).catch(()=>hit);
    return hit||net;
  }));
});
