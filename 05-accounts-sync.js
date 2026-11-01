/* ---------- الحساب والمزامنة السحابية ---------- */
let fa=null,fs=null,fu=null,fbOK=false,sm='',pt=null,busy=0;
const EMPTY=()=>({tasks:[],logs:[],alarms:[],mist:[],id:1});
function sync(m){sm=m;const e=$('#sm');if(e)e.textContent=m;const w=document.getElementById('awm');if(w){w.textContent=m;w.classList.toggle('ok',/^✅/.test(m))}}
/* ---------- تعدد الحسابات والتبديل السريع ---------- */
/* كل حساب إضافي يعمل في تطبيق Firebase مسمّى مستقل، فتبقى جلسته محفوظة ويكون التبديل فورياً */
let addKey='',addPrev=null,accQuiet=0,awAdd=false;
const accList=()=>{try{return JSON.parse(localStorage.getItem('qmrm_accs')||'[]')}catch(e){return[]}};
const accSave=L=>{try{localStorage.setItem('qmrm_accs',JSON.stringify(L))}catch(e){dbg(e)}};
const accAct=()=>{try{return localStorage.getItem('qmrm_acta')||''}catch(e){return''}};
const accCache=uid=>{try{const t=localStorage.getItem('qmrm_u_'+uid);return t?Object.assign(EMPTY(),JSON.parse(t)):null}catch(e){return null}};
const accName=a=>((fu&&a.uid==fu.uid&&prof().name)||a.n||a.name||(a.email||'').split('@')[0]||'—');
const accAv=a=>{const ph=(fu&&a.uid==fu.uid&&prof().photo)||a.photo;return ph?`<img src="${esc(ph)}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover" alt="">`:esc((accName(a)||'?').trim().charAt(0).toUpperCase())};
const accNext=()=>accList().find(a=>{try{return !!firebase.app(a.k).auth().currentUser}catch(e){return false}});
function accSeen(key,u){const L=accList();let e=L.find(a=>a.uid==u.uid);if(!e){e={k:key,uid:u.uid};L.push(e)}e.k=key;e.name=u.displayName||e.name||'';e.email=u.email||e.email||'';e.photo=u.photoURL||e.photo||'';accSave(L)}
function accGone(key){accSave(accList().filter(a=>a.k!==key))}
function accCacheSave(){if(!fu)return;try{localStorage.setItem('qmrm_u_'+fu.uid,JSON.stringify(S))}catch(e){dbg(e)}const L=accList(),e=L.find(a=>a.uid==fu.uid);if(e){e.n=prof().name||e.n||'';accSave(L)}}
function accRemove(uid){const L=accList(),e=L.find(a=>a.uid==uid);accSave(L.filter(a=>a.uid!=uid));try{localStorage.removeItem('qmrm_u_'+uid)}catch(x){dbg(x)}if(e&&e.k!=='[DEFAULT]'){try{firebase.app(e.k).delete()}catch(x){dbg(x)}}}
function accEnter(u){if(S._uid&&S._uid!==u.uid){S=accCache(u.uid)||EMPTY();S._uid=u.uid;S.lang=BOOT_LANG;migrate();try{localStorage.setItem('qmrm',JSON.stringify(S))}catch(e){dbg(e)}applyTheme();draw()}}
function accAttach(key,au){
 au.onAuthStateChanged(u=>{
  if(key===addKey&&u){const d=accList().find(a=>a.uid==u.uid);addKey='';awAdd=false;
   if(d){const p=addPrev||{};fa=p.fa;fs=p.fs;fu=p.fu;try{au.signOut()}catch(e){dbg(e)}try{firebase.app(key).delete()}catch(e){dbg(e)}awHide();toast('هذا الحساب مضاف مسبقاً');accSwitch(d.uid);return}}
  if(u)accSeen(key,u);else if(key!==addKey)accGone(key);
  if(au!==fa||accQuiet)return;
  if(u){fu=u;try{localStorage.setItem('qmrm_acta',u.uid)}catch(e){dbg(e)}accEnter(u);if(u.displayName&&!prof().name)prof().name=u.displayName;awHide();pull()}
  else{fu=null;const o=(key!==addKey)?accNext():null;if(o){accSwitch(o.uid,true);return}if(!awG()||key===addKey)awShow()}
  if(tab=='se')draw()})}
function accBoot(dA,dF){const L=accList(),want=L.find(a=>a.uid===accAct());fa=dA;fs=dF;
 L.filter(a=>a.k!=='[DEFAULT]').forEach(a=>{try{const ap=firebase.initializeApp(FB,a.k);if(want&&want.k===a.k){fa=ap.auth();fs=ap.firestore()}accAttach(a.k,ap.auth())}catch(e){dbg(e)}});
 accAttach('[DEFAULT]',dA)}
async function accSwitch(uid,noPush){
 const a=accList().find(x=>x.uid==uid);if(!a||(fu&&fu.uid==uid&&!noPush))return;
 let ap;try{ap=firebase.app(a.k)}catch(e){dbg(e)}
 const au=ap&&ap.auth(),u=au&&au.currentUser;
 if(!u){accGone(a.k);toast('انتهت جلسة هذا الحساب، أضفه من جديد');if(tab=='se')draw();return}
 if(!noPush&&fu){clearTimeout(pt);try{await pushNow()}catch(e){dbg(e)}accCacheSave()}
 fa=au;fs=ap.firestore();fu=u;try{localStorage.setItem('qmrm_acta',uid)}catch(e){dbg(e)}
 S=accCache(uid)||EMPTY();S._uid=uid;S.lang=BOOT_LANG;migrate();try{localStorage.setItem('qmrm',JSON.stringify(S))}catch(e){dbg(e)}
 pvOk=false;arPvOpen=false;tab='home';$('#sh').innerHTML='';awHide();applyTheme();draw();toast('تم التبديل إلى '+accName(a));pull()}
function accTap(uid){$('#sh').innerHTML='';if(!fu||fu.uid!=uid)accSwitch(uid)}
async function accAdd(){if(!fbOK||!fu||busy)return;
 try{clearTimeout(pt);await pushNow()}catch(e){dbg(e)}accCacheSave();
 const k='a'+Date.now().toString(36),ap=firebase.initializeApp(FB,k);
 addPrev={fa,fs,fu};addKey=k;fa=ap.auth();fs=ap.firestore();fu=null;accAttach(k,fa);
 $('#sh').innerHTML='';sync('');awMode='in';awAdd=true;awShow()}
function accCancelAdd(){if(!addKey)return;const k=addKey;addKey='';awAdd=false;const p=addPrev||{};fa=p.fa;fs=p.fs;fu=p.fu;try{firebase.app(k).delete()}catch(e){dbg(e)}sync('');awHide();draw()}
function accBar(){const L=accList();if(!fu||!L.length)return '';
 const cell=(on,inner,label,f,dash)=>`<div onclick="${f}" style="text-align:center;width:62px;cursor:pointer"><div style="width:46px;height:46px;margin:0 auto 3px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;box-sizing:border-box;${dash?'border:2px dashed var(--bd);color:var(--pri)':'background:var(--pri);color:var(--on);font-weight:700;font-size:19px;border:3px solid '+(on?'var(--gold)':'transparent')}">${inner}</div><div style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${on?'font-weight:700':'opacity:.8'}">${label}</div></div>`;
 return `<div class="dsec">الحسابات</div><div style="display:flex;gap:10px;padding:2px 16px 12px;flex-wrap:wrap;align-items:flex-start">${L.map(a=>cell(a.uid==fu.uid,accAv(a),esc(accName(a)),`accTap('${a.uid}')`)).join('')}${cell(0,svg('plus'),'إضافة حساب','accAdd()',1)}</div>`}
function accCard(){const L=accList();if(!fu)return '';
 return `<div class="ph">الحسابات</div><div class="pcard">${L.map(a=>`<div class="prow act" onclick="accTap('${a.uid}')"><span class="pi" style="overflow:hidden;font-weight:700">${accAv(a)}</span><span class="pl">${esc(accName(a))}<br><small class="m" dir="ltr">${esc(a.email)}</small></span><b style="color:var(--pri)">${fu&&a.uid==fu.uid?'✓':''}</b></div>`).join('')}<div class="prow act" onclick="accAdd()"><span class="pi">${svg('plus')}</span><span class="pl">إضافة حساب</span><span class="ch">${svg('chev')}</span></div></div>`}
function fbInit(){
 if(!FB.apiKey||!window.firebase)return;
    if(!awG()){awSplash();setTimeout(()=>{const a=document.getElementById('aw');if(a&&a.querySelector&&a.querySelector('.awspin'))awHide()},6000)}
    try{firebase.initializeApp(FB);const dA=firebase.auth(),dF=firebase.firestore();fbOK=true;accBoot(dA,dF)}catch(e){dbg(e)}}
/* ===== المزامنة: تلقائية دائماً + تتجدد لحالها ===== */
const INL=300000,PART=300000;let pushing=false,again=false,pushFail=0,unsub=null,dnTry=0;
function cutParts(d){const a=[];let i=0;while(i<d.length){let j=Math.min(d.length,i+PART);if(j<d.length){const c=d.charCodeAt(j-1);if(c>=0xD800&&c<=0xDBFF)j--}a.push(d.slice(i,j));i=j}return a}
let synDis='';
function synBar(m,bad){let e=document.getElementById('syb');if(!m){synDis='';if(e)e.remove();return}
 if(m===synDis)return;
 if(!e){e=document.createElement('div');e.id='syb';e.setAttribute('role','status');e.style.cssText='position:fixed;inset-inline:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:25;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.5;box-shadow:0 4px 18px #0004;text-align:center;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab';document.body.appendChild(e);
  let x0=null,dx=0;
  const fin=r=>{if(x0===null)return;x0=null;if(Math.abs(dx)>70){synDis=e.dataset.m||'';e.style.transition='transform .2s,opacity .2s';e.style.transform='translateX('+(dx>0?'':'-')+'110%)';e.style.opacity='0';setTimeout(()=>{if(e.parentNode&&e.style.opacity==='0')e.remove()},220)}else{e.style.transition='transform .2s,opacity .2s';e.style.transform='';e.style.opacity=''}dx=0};
  e.addEventListener('pointerdown',ev=>{x0=ev.clientX;dx=0;e.style.transition='none';try{e.setPointerCapture(ev.pointerId)}catch(_){}});
  e.addEventListener('pointermove',ev=>{if(x0===null)return;dx=ev.clientX-x0;e.style.transform='translateX('+dx+'px)';e.style.opacity=String(Math.max(.25,1-Math.abs(dx)/260))});
  e.addEventListener('pointerup',fin);e.addEventListener('pointercancel',fin)}
 e.dataset.m=m;e.style.background=bad?'var(--bad)':'var(--card)';e.style.color=bad?'#fff':'var(--tx)';e.textContent=m}
function pushBad(e){const c=(e&&e.code)||'';let m,bad=1;
 if(c==='permission-denied')m='تعذّر رفع بياناتك: صلاحيات Firestore تحتاج تحديثاً (أضف قاعدة parts)';
 else if(c==='invalid-argument'||/size|large|exceed/i.test((e&&e.message)||''))m='تعذّر رفع بياناتك: حجم البيانات كبير، احذف بعض الصور من الدفاتر';
 else if(c==='unavailable'||c==='deadline-exceeded'||c==='network-request-failed'){m='لا يوجد اتصال بالإنترنت، ستُرفع تغييراتك تلقائياً عند عودته';bad=0}
 else m='تعذّرت المزامنة ('+(c||(e&&e.message)||'?')+')، سنعيد المحاولة تلقائياً';
 sync('⚠️ '+m);synBar(m,bad)}
async function pushNow(strict){
 if(!fu||!fs)return false;
 if(pushing){again=true;if(!strict)return false;while(pushing)await new Promise(r=>setTimeout(r,200))}
 pushing=true;let ok=false;
 try{
  do{again=false;
   const uid=fu.uid,d=JSON.stringify(S),u=S._u||Date.now(),ref=fs.collection('users').doc(uid);
   if(d.length<=INL)await ref.set({d,u,n:0});
   else{const ps=cutParts(d),bt=fs.batch(),pc=ref.collection('parts');ps.forEach((x,i)=>bt.set(pc.doc('p'+i),{s:x,u}));bt.set(ref,{d:'',u,n:ps.length});await bt.commit()}
  }while(again);
  ok=true;pushFail=0;synBar('');sync('تمت المزامنة ✅')
 }catch(e){pushFail++;pushBad(e);const c=e&&e.code;if(c!=='permission-denied'&&c!=='invalid-argument')setTimeout(()=>{if(fu&&!pt&&!pushing)pushNow()},Math.min(60000,4000*Math.pow(2,Math.min(pushFail,4))))}
 finally{pushing=false}
 return ok}
function push(){if(!fu)return;clearTimeout(pt);pt=setTimeout(()=>{pt=null;pushNow()},1500)}
async function readCloud(uid){
 for(let t=0;t<2;t++){
  const ref=fs.collection('users').doc(uid),r=await ref.get();
  if(!r.exists)return null;
  const c=r.data();let d=c.d||'';
  if(c.n>0){const q=await ref.collection('parts').get(),m={};q.forEach(x=>{m[x.id]=x.data()});const a=[];let bad=0;
   for(let i=0;i<c.n;i++){const x=m['p'+i];if(!x||x.u!==c.u){bad=1;break}a.push(x.s)}
   if(bad){if(t==0){await new Promise(r=>setTimeout(r,900));continue}throw{code:'parts-mismatch'}}
   d=a.join('')}
  return{d,u:c.u||0}}
 return null}
function localExtra(cl){const ids=a=>new Set((a||[]).map(x=>x.id)),n=ids(cl.nbs),t=ids(cl.tasks);return(S.nbs||[]).some(x=>!n.has(x.id))||(S.tasks||[]).some(x=>!t.has(x.id))}
function adopt(cl,warn){
 const extra=warn&&localExtra(cl);
 if(extra){try{localStorage.setItem('qmrm_prev_'+fu.uid,JSON.stringify({at:Date.now(),s:S}))}catch(e){dbg(e)}}
 S=Object.assign(EMPTY(),cl);S._uid=fu.uid;S.lang=BOOT_LANG;migrate();
 try{localStorage.setItem('qmrm',JSON.stringify(S))}catch(e){dbg(e)}
 idb.set('S',JSON.stringify(S)).catch(()=>{});applyTheme();draw();
 if(extra){synBar('وُجدت بيانات على هذا الجهاز غير موجودة في السحابة. يمكنك استعادتها من الإعدادات ← استعادة بيانات الجهاز.',1);setTimeout(()=>synBar(''),15000)}}
const editingNow=()=>{const a=document.activeElement;return !!a&&(a.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(a.nodeName||''))};
async function syncDown(){
 if(!fu||!fs||pushing||pt)return;
 const uid=fu.uid;
 try{const c=await readCloud(uid);if(!c||!fu||fu.uid!==uid||pt||pushing)return;
  if(c.u>(S._u||0)){
   if(editingNow()&&dnTry<10){dnTry++;setTimeout(syncDown,3000);return}
   dnTry=0;adopt(JSON.parse(c.d),0);sync('تم تحديث بياناتك من السحابة ☁️')}
 }catch(e){dbg(e)}}
function listen(){
 if(unsub){try{unsub()}catch(e){dbg(e)}unsub=null}
 if(!fu||!fs)return;const uid=fu.uid;
 try{unsub=fs.collection('users').doc(uid).onSnapshot(sn=>{if(!fu||fu.uid!==uid||sn.metadata.hasPendingWrites)return;const c=sn.data();if(c&&(c.u||0)>(S._u||0))syncDown()},()=>{})}catch(e){dbg(e)}}
async function pull(){
 try{await idbReady;const uid=fu.uid,c=await readCloud(uid);
  if(!fu||fu.uid!==uid)return;
  if(c){const cl=JSON.parse(c.d);
   if(S._uid!==uid||c.u>(S._u||0)){adopt(cl,1);sync('تم تحميل بياناتك من السحابة ☁️');listen();return}}
  S._uid=uid;save();sync('تمت المزامنة ✅');listen()
 }catch(e){pushBad(e)}}
function prevGet(){try{const t=localStorage.getItem('qmrm_prev_'+(fu&&fu.uid));return t?JSON.parse(t):null}catch(e){return null}}
function restorePrev(){const p=prevGet();if(!p||!fu)return;
 ask('استعادة بيانات هذا الجهاز التي كانت قبل التحميل من السحابة؟ ستُرفع إلى حسابك.',()=>{S=Object.assign(EMPTY(),p.s);S._uid=fu.uid;S.lang=BOOT_LANG;migrate();try{localStorage.removeItem('qmrm_prev_'+fu.uid)}catch(e){dbg(e)}save();applyTheme();draw();toast('تمت الاستعادة')},'نعم، استعد')}
const ERR={'auth/invalid-email':'البريد غير صحيح','auth/invalid-credential':'البريد أو كلمة المرور غير صحيحة','auth/user-not-found':'لا يوجد حساب بهذا البريد','auth/wrong-password':'كلمة المرور غير صحيحة','auth/email-already-in-use':'هذا البريد مسجّل مسبقاً، سجّل الدخول','auth/weak-password':'كلمة المرور ضعيفة (6 أحرف على الأقل)','auth/network-request-failed':'تحقق من الإنترنت','auth/missing-password':'اكتب كلمة المرور','auth/missing-email':'اكتب بريدك الإلكتروني','auth/operation-not-allowed':'تسجيل الدخول بالبريد غير مفعّل في Firebase','auth/too-many-requests':'محاولات كثيرة، انتظر قليلاً','auth/unauthorized-domain':'هذا النطاق غير مصرّح به في Firebase','auth/internal-error':'خطأ داخلي في Firebase','bad-username':'اسم المستخدم من 3 إلى 20 حرفاً: أحرف إنجليزية صغيرة وأرقام و _ و .','username-taken':'اسم المستخدم محجوز، اختر اسماً آخر','username-notfound':'اسم المستخدم غير موجود','permission-denied':'غير مسموح: حدّث قواعد Firestore (القواعد الجديدة في شرح التحديث)','auth/popup-closed-by-user':'أُغلقت نافذة Google قبل إتمام الدخول','auth/popup-blocked':'المتصفح حظر النافذة، اسمح بالنوافذ المنبثقة وأعد المحاولة','auth/cancelled-popup-request':'أُلغيت المحاولة، أعد المحاولة','auth/account-exists-with-different-credential':'هذا البريد مسجّل بطريقة دخول أخرى'};
const er=e=>sync('⚠️ '+(ERR[e.code]||'حدث خطأ')+' ('+(e.code||e.message)+')');
const unOk=u=>/^[a-z0-9_.]{3,20}$/.test(u);
async function unGet(u){const d=await fs.collection('usernames').doc(u).get();return d.exists?d.data():null}
async function claimUn(raw){const u=String(raw||'').trim().toLowerCase(),cu=(fa&&fa.currentUser)||fu;if(!unOk(u))throw{code:'bad-username'};if(!cu)throw{code:'auth/requires-recent-login'};const ref=fs.collection('usernames').doc(u);
 await fs.runTransaction(async tx=>{const d=await tx.get(ref);if(d.exists&&d.data().uid!==cu.uid)throw{code:'username-taken'};tx.set(ref,{uid:cu.uid,email:cu.email})});
 const old=prof().user;if(old&&old!==u){try{await fs.collection('usernames').doc(old).delete()}catch(e){dbg(e)}}prof().user=u;save()}
async function resolveEmail(id){id=id.trim();if(id.includes('@'))return id;const d=await unGet(id.toLowerCase());if(!d)throw{code:'username-notfound'};return d.email}
async function unSave(){try{await claimUn($('#unin').value);toast('تم حفظ اسم المستخدم');draw()}catch(e){er(e)}}
async function doIn(id,p){if(!id||!p){sync('⚠️ اكتب البريد أو اسم المستخدم وكلمة المرور');return}if(busy)return;busy=1;sync('⏳ جارٍ تسجيل الدخول...');try{const m=await resolveEmail(id);await fa.signInWithEmailAndPassword(m,p);sync('✅ تم تسجيل الدخول')}catch(e){er(e)}busy=0}
async function aIn(){return doIn($('#ae').value.trim(),$('#ap').value)}
async function doUp(m,u,p){if(!m.includes('@')||!p){sync('⚠️ لإنشاء حساب اكتب بريدك الإلكتروني وكلمة المرور');return}if(!unOk(u)){er({code:'bad-username'});return}sync('⏳ جارٍ إنشاء الحساب...');
 try{if(await unGet(u))throw{code:'username-taken'};await fa.createUserWithEmailAndPassword(m,p);await claimUn(u);sync('✅ تم إنشاء الحساب باسم المستخدم @'+u)}catch(e){er(e)}}
async function aUp(){return doUp($('#ae').value.trim(),$('#au').value.trim().toLowerCase(),$('#ap').value)}
async function doRs(id){if(!id){sync('⚠️ اكتب بريدك أو اسم المستخدم');return}if(busy)return;busy=1;sync('⏳ جارٍ إرسال الرابط...');
 try{const m=await resolveEmail(id);try{fa.languageCode='ar'}catch(e){dbg(e)}
  try{const ms=await fa.fetchSignInMethodsForEmail(m);if(ms.length&&!ms.includes('password')){sync('ℹ️ هذا البريد مسجّل بواسطة Google فقط: ادخل بزر Google ثم أنشئ كلمة مرور من «إعدادات الحساب».');try{fa.languageCode='ar'}catch(e){dbg(e)}busy=0;return}}catch(e){dbg(e)}
  await fa.sendPasswordResetEmail(m,{url:location.origin+location.pathname,handleCodeInApp:false});
  sync('✅ تم إرسال رسالة إلى \u2066'+m.slice(0,3)+'*'.repeat(Math.max(0,m.length-3))+'\u2069 — لم تصلك؟ افحص البريد المزعج (Spam). وإن كان حسابك عبر Google فادخل بزر Google.')}catch(e){er(e)}try{fa.languageCode='ar'}catch(e){dbg(e)}busy=0}
async function aRs(){return doRs($('#ae').value.trim())}
async function out(){
 clearTimeout(pt);pt=null;if(!(await pushNow(true))){tab='se';draw();sync('تعذّر رفع بياناتك، لم يتم الخروج ⚠️');return}
 const uid=fu.uid;accQuiet=1;
 try{await fa.signOut()}catch(e){dbg(e)}
 accRemove(uid);const o=accNext();$('#sh').innerHTML='';
 if(o){accQuiet=0;await accSwitch(o.uid,true);return}
 fa=firebase.auth();fs=firebase.firestore();fu=null;
 S=EMPTY();clearTimeout(idbT);idb.del('S').catch(()=>{});try{localStorage.removeItem('qmrm');localStorage.removeItem('qmrm_guest');localStorage.removeItem('qmrm_acta')}catch(e){dbg(e)}
 accQuiet=0;draw();awMode='in';awShow()}
/* ---------- منتقي اللون الطيفي ---------- */
const hsv2hex=(h,s,v)=>{const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return'#'+[f(5),f(3),f(1)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
const hex2hsv=hx=>{const n=parseInt(hx.slice(1),16),r=(n>>16)/255,g=((n>>8)&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){h=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,mx?d/mx:0,mx]};
let cT='app',cH=140,cS=1,cV=.6;
function colSheet(t){cT=t;const hx=x=>(typeof x=='string'&&/^#[0-9a-f]{6}$/i.test(x))?x:'#1565c0',pg=()=>{const n=nbCP();return n.pc!=null?n.pc:nbK().pc};const cur=t=='app'?hx(th().custom||thPal(thCur(),false).pri):(t=='pen'||t=='txt')?hx(nbCol):t=='cov'?hx(nbK().c):hx(pg()||'#ffffff');[cH,cS,cV]=hex2hsv(cur);colRender()}
function colRender(){const hx=hsv2hex(cH,cS,cV);$('#sh').innerHTML=shW(`<b>اختيار اللون</b>${cT=='cov'?`<div id="cvprev" style="max-width:150px;margin:8px auto">${cover({...nbK(),c:hx},'')}</div>`:''}<div class="m" style="margin-top:8px">تدرج اللون</div><input type="range" class="cr" id="cr1" min="0" max="360" value="${Math.round(cH)}" oninput="colSet()" style="background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)">
 <div class="m">تشبع اللون</div><input type="range" class="cr" id="cr2" min="0" max="100" value="${Math.round(cS*100)}" oninput="colSet()" style="background:linear-gradient(90deg,#fff,${hsv2hex(cH,1,1)})">
 <div class="m">القيمة</div><input type="range" class="cr" id="cr3" min="0" max="100" value="${Math.round(cV*100)}" oninput="colSet()" style="background:linear-gradient(90deg,#000,${hsv2hex(cH,1,1)})">
 <div class="row" style="margin:8px 0"><div id="crp" style="width:56px;height:56px;border-radius:12px;border:2px solid var(--bd);background:${hx}"></div><b id="crh" dir="ltr">${hx}</b></div><button type="button" onclick="colApply()">تعيين</button><button type="button" class="g" onclick="colCancel()">إلغاء</button>`)}
function colSet(){cH=+$('#cr1').value;cS=$('#cr2').value/100;cV=$('#cr3').value/100;const hx=hsv2hex(cH,cS,cV),pure=hsv2hex(cH,1,1);$('#crp').style.background=hx;$('#crh').textContent=hx;$('#cr2').style.background='linear-gradient(90deg,#fff,'+pure+')';$('#cr3').style.background='linear-gradient(90deg,#000,'+pure+')';
 if(cT=='cov'){const e=$('#cvprev .cov');if(e&&e.style&&e.style.setProperty)e.style.setProperty('--cc',hx)}
 else if(cT=='app')applyTheme(hx);
 else if(cT=='pg'){const ta=document.querySelectorAll('#nbpg .rt')[nbPi],w=ta&&ta.parentNode;if(w&&w.style)w.style.backgroundColor=hx}}
function colCancel(){$('#sh').innerHTML='';if(cT=='app')applyTheme();else if(cT=='pg')draw()}
function colApply(){const hx=hsv2hex(cH,cS,cV);$('#sh').innerHTML='';
 if(cT=='app'){th().custom=hx;th().acc=-1;save();applyTheme();draw()}
 else if(cT=='txt'){nbTxtColor(hx)}
 else if(cT=='pen'){nbCol=hx;draw()}
 else if(cT=='pg'){nbCP().pc=hx;nbMark('pc');save();draw()}
 else{nbK().c=hx;save();draw();nbEditCover(nbEd)}}
