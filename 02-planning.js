/* ---------- جدول المراجعة: خطة شهرية بأجزائك المحفوظة (من خريطة الأجزاء) ---------- */
const rvDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
const rvMem=()=>[...Array(30)].map((_,i)=>i+1).filter(j=>jmM(j)==2);
const rvN=()=>Math.max(1,Math.min(10,Math.floor(+S.rvn)||1));
const rvLast=j=>{const J=(S.juz||{})[j]||{};return J.last?rvDay(new Date(J.last)):null};
const rvOrd=(mem,L)=>mem.slice().sort((a,b)=>(L[a]?L[a].getTime():-1)-(L[b]?L[b].getTime():-1)||a-b);
function rvPlan(n){const mem=rvMem(),N=Math.min(rvN(),mem.length||1),t=rvDay(new Date()),tk=t.getTime(),L={};mem.forEach(j=>L[j]=rvLast(j));
 const isT=j=>L[j]&&L[j].getTime()==tk,dn=mem.filter(isT),td=[...dn,...rvOrd(mem.filter(j=>!isT(j)),L).slice(0,Math.max(0,N-dn.length))],pend=td.filter(j=>!isT(j));
 const days=[{d:t,juz:td,pend,done:dn,off:false}];td.forEach(j=>L[j]=t);
 for(let k=1;k<n;k++){const d=new Date(t);d.setDate(t.getDate()+k);
  if(S.skipFri&&d.getDay()==5){days.push({d,juz:[],off:true});continue}
  const pk=rvOrd(mem,L).slice(0,N);pk.forEach(j=>L[j]=d);days.push({d,juz:pk.slice().sort((a,b)=>a-b),off:false})}
 return days}
const rvDue=()=>rvPlan(1)[0].pend;
const rvGap=()=>{const M=rvMem().length;return M?Math.ceil(M/Math.min(rvN(),M)):0};
const rvDT=n=>n==1?'يوم':n==2?'يومان':n<=10?n+' أيام':n+' يوماً';
const rvCard=()=>{const n=rvDue().length;return n?`<div class="c" onclick="go('rv')" style="cursor:pointer;border-color:var(--pri)"><div class="row sp"><b>🗓 جدول المراجعة</b><span class="ch">${svg('chev')}</span></div><div class="m">${n==1?'جزء واحد':n==2?'جزءان':n<=10?n+' أجزاء':n+' جزءاً'} للمراجعة اليوم</div></div>`:''};
function rvRev(j){jAdd(j,1);toast('سُجّلت مراجعة الجزء '+j);draw()}
function rvTask(j){if((S.tasks||[]).some(t=>!t.arch&&t.type=='مراجعة'&&t.j==j&&!t.pg&&!t.js&&!t.sur)){toast('المراجعة موجودة في مهامك');return}
 S.tasks.push({id:S.id++,s:'الجزء '+j,j:j,tm:null,a:1,b:1,type:'مراجعة',stage:0,next:new Date().toISOString(),g:1});save();toast('أُضيف الجزء '+j+' إلى مهام اليوم');draw()}
function rvUndo(j){jSub(j);toast('أُلغيت مراجعة الجزء '+j)}
function rvSetN(v){S.rvn=Math.max(1,Math.min(10,+v||1));save();draw()}
function revPage(){
 const mem=rvMem(),M=mem.length,head=`<div class="row sp" style="padding:4px 14px"><b style="font-size:18px">جدول المراجعة</b><button type="button" class="g" onclick="go('home')">رجوع</button></div>`;
 if(!M)return head+`<div class="c m">لا أجزاء محفوظة بعد. افتح خريطة الأجزاء وحدّد الأجزاء التي حفظتها، فأضع لك خطة شهرية لمراجعتها بحيث لا يُنسى جزء.<button type="button" style="width:100%;margin-top:8px" onclick="go('jm')">فتح خريطة الأجزاء</button></div>`;
 const N=Math.min(rvN(),M),P=rvPlan(30),T=P[0],cyc=Math.ceil(M/N),nm=a=>a.length==1?'الجزء '+a[0]:'الأجزاء '+a.join('، '),
  opts=[...Array(Math.min(10,M))].map((_,i)=>`<option value="${i+1}" ${i+1==N?'selected':''}>${i+1}</option>`).join('');
 return head+`<div class="c"><b>حفظت ${M==1?'جزءاً واحداً':M==2?'جزأين':M<=10?M+' أجزاء':M+' جزءاً'}</b>
 <div class="row" style="flex-wrap:nowrap;gap:8px;align-items:center;margin:8px 0"><span class="m" style="white-space:nowrap">كم جزءاً تراجع في اليوم؟</span><select onchange="rvSetN(this.value)" style="margin:0">${opts}</select></div>
 <div class="m">بهذه الخطة يعود إليك كل جزء كل ${rvDT(cyc)} تقريباً. تُراجَع الأجزاء كلها بالترتيب، الأقدم مراجعةً أولاً، فلا يُنسى جزء.</div></div>
 <div class="c"><b>مراجعة اليوم</b><div class="m">${T.pend.length?'تبقّى '+T.pend.length+' من '+T.juz.length:'أتممت مراجعة اليوم، بارك الله فيك 🌿'}</div>${T.juz.map(j=>{const dn=T.done.includes(j),ag=jmAge(j);
  return `<div class="row" style="flex-wrap:nowrap;gap:8px;padding:8px 0;border-top:1px solid var(--bd)"><div style="flex:1"><b>الجزء ${j}</b><div class="m">${exPages(j)} صفحة • ${ag===null?'لم يُراجع بعد':'آخر مراجعة '+(ag==0?'اليوم':'قبل '+ag+' يوم')}</div></div>${dn?'<span class="row" style="gap:8px;flex-wrap:nowrap"><span class="m" style="color:var(--pri);font-weight:700">✅ تمت</span><button type="button" class="g" style="padding:6px 12px" onclick="rvUndo('+j+')">↩ تراجع</button></span>':`<span class="row" style="gap:6px;flex-wrap:nowrap"><button type="button" class="g" style="padding:6px 12px" onclick="rvTask(${j})">➕ إضافة إلى المهام</button><button type="button" style="padding:6px 12px" onclick="rvRev(${j})">✅ راجعته</button></span>`}</div>`}).join('')}</div>
 <div class="c"><b>الخطة الشهرية</b><div class="m" style="margin-bottom:4px">الأيام الثلاثون القادمة، وتتحدّث تلقائياً كلما سجّلت مراجعة.</div>${P.map((r,i)=>`<div class="row" style="flex-wrap:nowrap;gap:8px;padding:7px 6px;border-top:1px solid var(--bd);${i==0?'background:color-mix(in srgb,var(--pri) 10%,transparent);border-radius:8px':''}"><span class="m" style="width:86px;flex:none">${i==0?'اليوم':D[r.d.getDay()]+' '+ymd(r.d).slice(5)}</span><b style="flex:1;font-size:14px">${r.off?'<span class="m">إجازة</span>':nm(r.juz)}</b></div>`).join('')}</div>`}

/* ---------- الورد اليومي المقترح: يحسب كمية الحفظ اليومية لتنهي هدفك في موعد تحدده ---------- */
const WRL=15;let wrdEdit=0;
const wrdG=()=>S.wrd&&S.wrd.due?S.wrd:null;
const wrdUn=()=>'<option value="p">صفحة</option><option value="j">جزء</option><option value="h">حزب</option>';
const wrdPgOf=(v,u,snap)=>{v=Math.max(0,+v||0);const p=u=='j'?(snap&&v>=30?604:v*20):u=='h'?(snap&&v>=60?604:v*10):v;return Math.min(604,p)};
const wrdLn=v=>Math.max(0,Math.round((+v||0)*WRL));
const wrdPg=l=>{const v=Math.round(l/WRL*10)/10;return String(v).replace(/\.0$/,'')};
function wrdTxt(l){l=Math.max(0,Math.round(l));if(!l)return 'لا شيء';const p=Math.floor(l/WRL),r=l%WRL,
 ps=p==0?'':p==1?'صفحة':p==2?'صفحتان':p<=10?p+' صفحات':p+' صفحة',
 rs=r==0?'':r==1?'سطر':r==2?'سطران':r<=10?r+' أسطر':r+' سطراً';
 return [ps,rs].filter(Boolean).join(' و')}
function wrdQtr(l){const n=Math.round(l/WRL*4),w=Math.floor(n/4),r=n%4;if(n<=0)return 'أقل من ربع صفحة';
 const q=['','ربع','نصف','ثلاثة أرباع'][r];if(!w)return q+' صفحة';
 const ps=w==1?'صفحة':w==2?'صفحتان':w<=10?w+' صفحات':w+' صفحة';return r?ps+' و'+q:ps}
const WRX=[[0,'حسب موعدي (تلقائي)'],[4,'ربع صفحة'],[8,'نصف صفحة'],[15,'صفحة'],[30,'صفحتان'],[75,'5 صفحات'],[150,'حزب (10 صفحات)'],[300,'جزء (20 صفحة)']];
function wrdFix(v){const W=wrdG();if(!W)return;W.fix=+v||0;save();draw()}
const wrdDate=t=>{const a=String(t).split('-');return new Date(+a[0],a[1]-1,+a[2])};
const wrdPz=(d,W)=>{const t=ymd(d);return (W.pz||[]).some(p=>t>=p.a&&t<=p.b)};
function wrdDays(a,b,fr,W){let n=0;const d=new Date(a),e=new Date(b);d.setHours(0,0,0,0);e.setHours(0,0,0,0);for(let i=0;d<=e&&i<6000;i++){if(!(fr&&d.getDay()==5)&&!(W&&wrdPz(d,W)))n++;d.setDate(d.getDate()+1)}return n}
function wrdCalc(){const W=wrdG();if(!W)return null;const today=new Date();today.setHours(0,0,0,0);const td=ymd(today),
 done=W.base+W.log.reduce((a,x)=>a+x.l,0),dToday=W.log.filter(x=>x.d==td).reduce((a,x)=>a+x.l,0),before=done-dToday,rem=Math.max(0,W.total-done),
 days=wrdDays(today,wrdDate(W.due),W.fr,W),auto=days>0?Math.ceil(Math.max(0,W.total-before)/days):0,fix=W.fix||0,daily=fix||auto;
 let eta=null,etaD=0;if(fix&&rem>0){const need=Math.ceil(Math.max(0,W.total-before)/fix),d=new Date(today);let n=0;for(let i=0;i<20000;i++){if(!(W.fr&&d.getDay()==5)&&!wrdPz(d,W)){n++;if(n>=need)break}d.setDate(d.getDate()+1)}eta=d;etaD=Math.round((wrdDate(W.due)-d)/864e5)}
 return{W,tot:W.total,done,dToday,rem,days,daily,auto,fix,eta,etaD,paused:wrdPz(today,W),pct:Math.min(100,Math.round(done/W.total*100)),late:wrdDate(W.due)<today,fin:rem<=0}}
const wrdCard=()=>{const c=wrdCalc();if(!c||c.fin||c.paused||((c.late||c.days<=0)&&!c.fix)||c.dToday>=c.daily)return '';return `<div class="c" onclick="go('wr')" style="cursor:pointer;border-color:var(--pri)"><div class="row sp"><b>📖 وردك اليوم</b><span class="ch">${svg('chev')}</span></div><div class="m">${wrdTxt(c.daily-c.dToday)}${c.dToday?' (متبقٍ من وردك)':''}</div></div>`};
function wrdQ(m){const d=new Date();d.setMonth(d.getMonth()+m);const i=$('#wrdd');if(i)i.value=ymd(d)}
function wrdSave(){const tot=Math.min(604,Math.max(1,wrdPgOf($('#wrdt').value,$('#wrdtu').value,1))),base=Math.min(tot,wrdPgOf($('#wrdb').value,$('#wrdbu').value,1)),due=$('#wrdd').value;
 if(!due||wrdDate(due)<new Date(new Date().setHours(0,0,0,0))){toast('اختر موعد إنهاء قادماً');return}
 const old=S.wrd||{};S.wrd={total:wrdLn(tot),base:wrdLn(base),due,fr:$('#wrdf').checked,start:old.start||ymd(new Date()),log:old.log||[],fix:old.fix||0,pz:old.pz||[],rr:old.rr||0};
 wrdEdit=0;save();toast('تم حفظ الخطة');draw()}
function wrdAdd(l){const c=wrdCalc();if(!c||l<=0)return;S.wrd.log.push({id:S.id++,d:ymd(new Date()),l:Math.min(l,c.rem)});save();draw()}
function wrdAddT(){const c=wrdCalc();if(c)wrdAdd(Math.max(0,c.daily-c.dToday))}
function wrdCustom(){const l=wrdLn(wrdPgOf($('#wrdc').value,$('#wrdcu').value));if(!l){toast('اكتب الكمية');return}wrdAdd(l)}
function wrdUndo(){const W=wrdG();if(!W||!W.log.length)return;W.log.pop();save();draw()}
function wrdReset(){ask('حذف خطة الورد اليومي وسجلها؟',()=>{S.wrd=null;wrdEdit=0;save();draw()},'نعم، احذف')}
let wrdS={t:new Set(),b:new Set()};
const wrdGrid=k=>`<div class="exg">${[...Array(30)].map((_,i)=>{const j=i+1;return `<div class="exj${wrdS[k].has(j)?' on':''}" style="cursor:pointer;min-height:36px;padding:8px 0" onclick="wrdTg('${k}',${j})">${j}</div>`}).join('')}</div>`;
function wrdTg(k,j){const st=wrdS[k];st.has(j)?st.delete(j):st.add(j);const pg=[...st].reduce((a,x)=>a+exPages(x),0),inp=$(k=='t'?'#wrdt':'#wrdb'),un=$(k=='t'?'#wrdtu':'#wrdbu');
 $('#wrdg'+k).innerHTML=wrdGrid(k);inp.value=st.size?pg:'';un.value='p';$('#wrdi'+k).textContent=st.size?st.size+' '+(st.size==1?'جزء':'أجزاء')+' = '+pg+' صفحة (حسب صفحات المصحف الفعلية)':''}
function wrdOpen(k){const g=$('#wrdg'+k);if(!g)return;g.style.display=g.style.display=='none'?'block':'none';if(g.style.display=='block')g.innerHTML=wrdGrid(k)}
function wrdForm(){wrdS={t:new Set(),b:new Set()};const W=S.wrd,c=W?wrdCalc():null;
 return `<div class="row sp" style="padding:4px 14px"><b style="font-size:18px">الورد اليومي</b><button type="button" class="g" onclick="${W?'wrdEdit=0;draw()':"go('home')"}">رجوع</button></div>
 <div class="c"><div class="m">كم صفحة تريد حفظها بالمجموع؟</div><div class="row" style="flex-wrap:nowrap;gap:6px"><input id="wrdt" type="number" inputmode="decimal" min="1" step="0.5" value="${W?wrdPg(W.total):604}" style="flex:1;margin:0;min-width:0"><select id="wrdtu" style="width:auto;margin:0">${wrdUn()}</select></div><div class="m" style="color:var(--pri);cursor:pointer;margin-top:4px" onclick="wrdOpen('t')">▾ أو اختر أجزاء محددة</div><div id="wrdgt" style="display:none;margin:6px 0"></div><div class="m" id="wrdit"></div>
 <div class="m">كم صفحة حفظت حتى الآن؟</div><div class="row" style="flex-wrap:nowrap;gap:6px"><input id="wrdb" type="number" inputmode="decimal" min="0" step="0.5" value="${W?wrdPg(W.base):0}" placeholder="مثال: 5" style="flex:1;margin:0;min-width:0"><select id="wrdbu" style="width:auto;margin:0">${wrdUn()}</select></div><div class="m" style="color:var(--pri);cursor:pointer;margin-top:4px" onclick="wrdOpen('b')">▾ أو اختر الأجزاء التي حفظتها</div><div id="wrdgb" style="display:none;margin:6px 0"></div><div class="m" id="wrdib"></div>
 <div class="m" style="margin-top:6px">الجزء = 20 صفحة تقريباً، والحزب = 10 صفحات (و30 جزءاً = المصحف كاملاً 604 صفحة)</div><div class="m">موعد إنهاء الحفظ</div><input id="wrdd" type="date" value="${W?W.due:''}">
 <div style="margin:6px 0">${[['6 أشهر',6],['سنة',12],['سنتان',24],['3 سنوات',36]].map(([t,m])=>`<span class="chip" onclick="wrdQ(${m})">${t}</span>`).join('')}</div>
 <label class="m"><input id="wrdf" type="checkbox" style="width:auto" ${!W||W.fr?'checked':''}> استثناء يوم الجمعة من أيام الحفظ</label>
 <button type="button" onclick="wrdSave()" style="width:100%;margin-top:10px">${W?'حفظ التعديل':'احسب وردي وابدأ'}</button></div>`}
function wrdPage(){const c=wrdCalc();if(!c||wrdEdit)return wrdForm();
 const rem=c.fin?'':`<div class="m" style="margin-top:6px">المتبقي ${wrdTxt(c.rem)} • ${c.days} يوم حفظ حتى ${c.W.due}</div>${c.fix&&c.eta?`<div class="m" style="margin-top:4px">بهذا الورد تنهي في ${ymd(c.eta)} ${c.etaD>0?'(قبل موعدك بـ '+c.etaD+' يوماً)':c.etaD<0?'(بعد موعدك بـ '+(-c.etaD)+' يوماً)':'(في موعدك تماماً)'}</div>`:''}<div class="row" style="flex-wrap:nowrap;gap:8px;margin-top:10px;align-items:center"><span class="m" style="white-space:nowrap">مقدار الورد:</span><select onchange="wrdFix(this.value)" style="margin:0">${WRX.map(x=>`<option value="${x[0]}" ${x[0]==c.fix?'selected':''}>${x[1]}</option>`).join('')}</select></div>${wrdRr(c)}`,
 hist=c.W.log.slice(-5).reverse().map(x=>`<div class="m" style="padding:4px 0;border-top:1px solid var(--bd)">${x.d} • ${wrdTxt(x.l)}</div>`).join('');
 return `<div class="row sp" style="padding:4px 14px"><b style="font-size:18px">الورد اليومي</b><button type="button" class="g" onclick="go('home')">رجوع</button></div>
 <div class="c" style="text-align:center">${c.fin?'<b style="font-size:20px">ما شاء الله، أتممت هدفك 🎉</b>':c.paused?`<div class="m">اليوم إجازة</div><b style="font-size:24px;display:block;margin:4px 0">🌴 لا ورد عليك اليوم</b><div class="m">يعود وردك بعد الإجازة: ${wrdTxt(c.daily)} يومياً</div>`:(c.late&&!c.fix)?'<b style="font-size:17px">انتهى الموعد الذي حددته، عدّل الخطة بموعد جديد</b>':(c.days<=0&&!c.fix)?'<b style="font-size:17px">لا توجد أيام حفظ قبل الموعد، عدّل الخطة</b>':`<div class="m">وردك اليوم</div><b style="font-size:26px;display:block;margin:4px 0">${c.fix?(WRX.find(x=>x[0]==c.fix)||[0,wrdTxt(c.daily)])[1]:wrdTxt(c.daily)}</b><div class="m" style="margin-bottom:4px">${c.fix?'= '+wrdTxt(c.daily)+' تقريباً':'≈ '+wrdQtr(c.daily)}</div><div class="m">${c.dToday>=c.daily?'أتممت وردك اليوم، بارك الله فيك 🌿':'أنجزت اليوم '+wrdTxt(c.dToday)}</div>`}
 <div style="background:var(--bd);border-radius:10px;height:12px;margin-top:12px;overflow:hidden"><div style="width:${c.pct}%;height:100%;background:var(--pri)"></div></div>
 <div class="m" style="margin-top:6px">حفظت ${wrdPg(c.done)} من ${wrdPg(c.tot)} صفحة (${c.pct}%)</div>${rem}</div>
 ${c.fin||((c.late||c.days<=0)&&!c.fix)?'':`<div class="c"><b>تسجيل الحفظ</b><div class="row" style="margin-top:8px;gap:6px"><button type="button" style="flex:1" onclick="wrdAddT()" ${c.dToday>=c.daily?'disabled style="flex:1;opacity:.5"':''}>✅ أنجزت وردي</button><button type="button" class="g" onclick="wrdAdd(${WRL})">+ صفحة</button><button type="button" class="g" onclick="wrdAdd(${WRL/2|0})">+ نصف صفحة</button></div>
 <div class="row" style="flex-wrap:nowrap;gap:6px;margin-top:8px"><input id="wrdc" type="number" inputmode="decimal" step="0.5" min="0" placeholder="كمية أخرى" style="flex:1;margin:0;min-width:0"><select id="wrdcu" style="width:auto;margin:0">${wrdUn()}</select><button type="button" class="g" onclick="wrdCustom()">إضافة</button></div></div>`}
 ${hist?`<div class="c"><div class="row sp"><b>آخر التسجيلات</b><button type="button" class="g" style="padding:4px 10px" onclick="wrdUndo()">↩ تراجع عن الأخير</button></div>${hist}</div>`:''}
 ${wrdPzCard(c)}<div class="row" style="padding:0 14px;gap:6px"><button type="button" class="g" style="flex:1" onclick="wrdEdit=1;draw()">تعديل الخطة</button><button type="button" class="g" style="flex:1" onclick="wrdReset()">حذف الخطة</button></div>`}

/* ---------- نسبة المراجعة مع الورد + إجازة الورد ---------- */
const WRR=[[0,'بدون'],[1,'1 : 1 (راجع بمقدار ما تحفظ)'],[2,'2 : 1 (ضعف الحفظ)'],[3,'3 : 1 (ثلاثة أضعاف)']];
function wrdSetRr(v){const W=wrdG();if(!W)return;W.rr=+v||0;save();draw()}
function wrdRr(c){const W=c.W,k=W.rr||0,sh={1:'نصف',2:'ثلثا',3:'ثلاثة أرباع'}[k];
 return `<div class="row" style="flex-wrap:nowrap;gap:8px;margin-top:8px;align-items:center"><span class="m" style="white-space:nowrap">المراجعة مع الورد:</span><select onchange="wrdSetRr(this.value)" style="margin:0">${WRR.map(x=>`<option value="${x[0]}" ${x[0]==k?'selected':''}>${x[1]}</option>`).join('')}</select></div>${k&&!c.fin&&!c.paused&&c.daily?`<div class="c" style="margin:10px 0 0;background:transparent;border-style:dashed"><div class="row sp"><span>📖 حفظ جديد</span><b>${wrdTxt(c.daily)}</b></div><div class="row sp"><span>🔁 مراجعة</span><b>${wrdTxt(Math.round(c.daily*k))}</b></div><div class="row sp" style="border-top:1px solid var(--bd);margin-top:4px;padding-top:4px"><span>المجموع</span><b>${wrdTxt(Math.round(c.daily*(1+k)))}</b></div><div class="m" style="margin-top:4px">${sh} الجلسة مراجعة. افتح جدول المراجعة لتعرف ما تراجعه.</div><button type="button" class="g" style="width:100%;margin-top:6px" onclick="go('rv')">🗓 جدول المراجعة</button></div>`:''}`}
function wrdPzCard(c){const W=c&&c.W;if(!W)return '';const t=ymd(new Date()),L=(W.pz||[]).filter(p=>p.b>=t).sort((x,y)=>x.a.localeCompare(y.a));
 return `<div class="c"><b>🌴 إجازة الورد</b><div class="m" style="margin:4px 0">للسفر أو المرض أو رمضان: تُستثنى هذه الأيام ويُعاد حساب وردك على الأيام المتبقية.</div><div class="row" style="flex-wrap:nowrap;gap:6px"><input id="wrpa" type="date" style="flex:1;margin:0;min-width:0"><input id="wrpb" type="date" style="flex:1;margin:0;min-width:0"></div><div class="m" style="margin-top:4px">من تاريخ إلى تاريخ (النهاية اختيارية ليوم واحد)</div><div class="row" style="margin-top:8px;gap:6px"><button type="button" style="flex:1" onclick="wrdPzAdd()">إضافة إجازة</button><button type="button" class="g" style="flex:1" onclick="wrdPzToday()">إجازة اليوم فقط</button></div>${L.map(p=>`<div class="row sp" style="padding:6px 0;border-top:1px solid var(--bd)"><span class="m">${p.a==p.b?p.a:p.a+' ← '+p.b}</span><button type="button" class="g" style="padding:2px 10px" onclick="wrdPzDel(${p.id})">حذف</button></div>`).join('')}</div>`}
function wrdPzPush(a,b){const W=wrdG();if(!W)return;(W.pz=W.pz||[]).push({id:S.id++,a,b});save();toast('تمت إضافة الإجازة');draw()}
function wrdPzAdd(){const a=$('#wrpa').value,b=$('#wrpb').value||a;if(!a){toast('اختر تاريخ بداية الإجازة');return}if(b<a){toast('تاريخ النهاية قبل البداية');return}wrdPzPush(a,b)}
function wrdPzToday(){const t=ymd(new Date());wrdPzPush(t,t)}
function wrdPzDel(id){const W=wrdG();if(!W)return;W.pz=(W.pz||[]).filter(p=>p.id!=id);save();draw()}

/* ---------- خريطة الأجزاء: لون لكل جزء حسب دورة مراجعتك ---------- */
const JMC={'0':['#8a948f','لم يُحفظ'],'1':['#1565c0','قيد الحفظ'],g:['#2e7d32','ضمن دورة مراجعتك'],y:['#f9a825','تأخر قليلاً عن دورتك'],r:['#c62828','تأخر كثيراً أو لم يُراجع بعد']};
const jmM=j=>{const m=(S.jm||{})[j];return m!==undefined?m:(((S.juz||{})[j]||{}).n>0?2:0)};
function jmDays(j){const J=(S.juz||{})[j]||{};return J.last?Math.floor((Date.now()-new Date(J.last))/864e5):null}
function jmBase(j){const L=rvLast(j);if(L)return L;const a=(S.jma||{})[j];return a?rvDay(new Date(a)):null}
const jmAge=j=>{const b=jmBase(j);return b?Math.round((rvDay(new Date())-b)/864e5):null};
function jmSt(j){const m=jmM(j);if(m==0)return '0';if(m==1)return '1';return 'g'}
function jmPage(){const st=[...Array(30)].map((_,i)=>jmSt(i+1)),cnt=k=>st.filter(x=>x==k).length,mem=st.filter(x=>'gyr'.includes(x)).length,PL=rvPlan(30),nxd=j=>PL.findIndex((r,i)=>r.juz.includes(j)&&(i>0||!PL[0].done.includes(j)));
 const tile=j=>{const k=st[j-1],c=JMC[k][0],x=k=='g'?nxd(j):-1,sm=k=='0'||k=='1'?JMC[k][1]:x<0?'—':x==0?'اليوم':x==1?'غداً':'بعد '+x+' ي';
  return `<div class="exj" style="border-color:${c};background:color-mix(in srgb,${c} 18%,transparent);cursor:pointer;min-height:62px;padding:8px 0" onclick="jmOpen(${j})"><b style="font-size:18px">${j}</b><small style="font-size:10px;opacity:.85">${sm}</small></div>`};
 return `<div class="row sp" style="padding:4px 14px"><b style="font-size:18px">خريطة الأجزاء</b><button type="button" class="g" onclick="go('home')">رجوع</button></div>
 <div class="c"><div class="row" style="gap:12px"><div style="flex:1;text-align:center">محفوظ<br><b style="font-size:22px">${mem}</b> <span class="m">من 30</span></div><div style="flex:1;text-align:center">للمراجعة اليوم<br><b style="font-size:22px">${rvDue().length}</b></div></div></div>
 <div class="c"><div class="exg">${[...Array(30)].map((_,i)=>tile(i+1)).join('')}</div>
 <div style="margin-top:10px">${['0','1','g'].map(k=>`<div class="m" style="padding:2px 0"><span style="display:inline-block;width:12px;height:12px;border-radius:4px;background:${JMC[k][0]};vertical-align:middle;margin-inline-end:6px"></span>${JMC[k][1]}</div>`).join('')}</div></div>
 <div class="m" style="margin:0 16px">اضغط على جزء لتحديد حالته. الأجزاء التي تحددها «محفوظة» تدخل خطة المراجعة الشهرية، وكل مراجعة تسجّلها تُحتسب في جدول الأجزاء.</div>`}
function jmOpen(j){const k=jmSt(j),m=jmM(j),J=(S.juz||{})[j]||{},d=jmDays(j),b=(v,t)=>`<button type="button" class="${m==v?'':'g'}" style="flex:1;padding:8px 4px" onclick="jmSet(${j},${v})">${t}</button>`;
 let nx='';if(m==2){const P=rvPlan(30),r=P.find((x,i)=>x.juz.includes(j)&&(i>0||!P[0].done.includes(j)));nx=r?' • موعده في الخطة: '+(r===P[0]?'اليوم':ymd(r.d)):''}
 $('#sh').innerHTML=shW(`<b>الجزء ${j}</b><div class="m" style="margin:6px 0">${exPages(j)} صفحة • ${JMC[k][1]}${J.n?' • '+J.n+' مراجعة':''}${d!==null?' • آخر مراجعة '+(d==0?'اليوم':'قبل '+d+' يوم'):''}${nx}</div><div class="row" style="gap:6px;flex-wrap:nowrap">${b(0,'لم يُحفظ')}${b(1,'قيد الحفظ')}${b(2,'محفوظ')}</div>${m==2?`<button type="button" onclick="jmRev(${j})" style="width:100%;margin-top:10px">✅ سجّلت مراجعته اليوم</button>`:''}<button type="button" class="g" onclick="$('#sh').innerHTML=''" style="width:100%;margin-top:6px">إغلاق</button>`)}
function jmSet(j,v){S.jm=S.jm||{};S.jm[j]=v;if(v==2&&!(S.jma||{})[j]){S.jma=S.jma||{};S.jma[j]=new Date().toISOString()}save();draw();jmOpen(j)}
function jmRev(j){jAdd(j,1);$('#sh').innerHTML='';toast('سُجّلت مراجعة الجزء '+j);draw()}

/* ---------- أيام النشاط (تُستعمل في تقرير المعلم) ---------- */
const wkAct=()=>{const a=new Set();(S.logs||[]).forEach(l=>l.date&&a.add(l.date));((S.wrd||{}).log||[]).forEach(x=>a.add(x.d));Object.values(S.juz||{}).forEach(j=>(j.h||[]).forEach(h=>a.add(new Date(h).toLocaleDateString('en-CA'))));return a};
function wkRun(){const A=wkAct();if(!A.size)return{cur:0,best:0};const t=new Date();t.setHours(0,0,0,0);const end=A.has(ymd(t))?t:new Date(t-864e5),d=new Date([...A].sort()[0]+'T00:00:00');let run=0,best=0;
 for(let i=0;d<=end&&i<9000;i++){if(A.has(ymd(d))){run++;best=Math.max(best,run)}else if(!(S.skipFri&&d.getDay()==5))run=0;d.setDate(d.getDate()+1)}return{cur:run,best}}

/* ---------- التقرير الأسبوعي للمعلم (آخر 7 أيام) ---------- */
function repWk(T,H,K){const t=new Date();t.setHours(0,0,0,0);const days=[...Array(7)].map((_,i)=>{const d=new Date(t);d.setDate(t.getDate()-6+i);return d}),ks=new Set(days.map(ymd)),A=wkAct(),act=days.filter(d=>A.has(ymd(d))).length,
 arc=(S.arc||[]).filter(a=>a.en&&ks.has(ymd(new Date(a.en)))).sort((a,b)=>String(a.en).localeCompare(String(b.en))),
 W=S.wrd,lines=W?(W.log||[]).filter(x=>ks.has(x.d)).reduce((a,x)=>a+x.l,0):0,run=wkRun(),
 mist={};(S.mist||[]).filter(m=>ks.has(m.d)).forEach(m=>mist[m.type]=(mist[m.type]||0)+1);
 const st=[...Array(30)].map((_,i)=>jmSt(i+1)),need=st.map((x,i)=>(x=='r'||x=='y')?i+1:0).filter(Boolean);
 let o=H('الفترة: '+ymd(days[0])+' إلى '+ymd(days[6]))+K([['أيام النشاط',act+' / 7'],['مهام منجزة',arc.length],['حفظ جديد',lines?wrdTxt(lines):'—'],['أيام متتالية',run.cur]]);
 if(W){const c=wrdCalc();if(c)o+=H('خطة الحفظ')+K([['النسبة المنجزة',c.pct+'%'],['المحفوظ',wrdPg(c.done)+' صفحة'],['المتبقي',wrdPg(c.rem)+' صفحة'],['موعد الإنهاء',W.due]])}
 o+=H('ما أُنجز هذا الأسبوع')+(arc.length?T(['التاريخ','المهمة','النوع','التقييم'],arc.map(a=>[ymd(new Date(a.en)),esc(a.name)+(a.sub?' • '+esc(a.sub):''),arTy(a)||'—',(BADGE[a.r]||['','—'])[1]])):'<div style="font-size:12px;color:#555">لا مهام مسجّلة هذا الأسبوع.</div>');
 o+=H('حالة الأجزاء')+K([['محفوظ',st.filter(x=>'gyr'.includes(x)).length+' / 30'],['قيد الحفظ',st.filter(x=>x=='1').length],['يحتاج مراجعة',need.length]])+(need.length?'<div style="font-size:12px;color:#555">أجزاء تحتاج مراجعة: '+need.join('، ')+'</div>':'');
 const mk=Object.keys(mist);if(mk.length)o+=H('الأخطاء المسجّلة')+T(['النوع','العدد'],mk.map(k=>[esc(k),mist[k]]));
 return o}

/* ---------- الصفحات الصعبة: تتكرر مراجعتها كل يومين ---------- */
const hpG=()=>S.hp=S.hp||{};
const jzOf=p=>EXJ.filter(x=>x<=p).length;
const hpDays=h=>h.l?Math.round((rvDay(new Date())-rvDay(new Date(h.l)))/864e5):null;
const hpDue=()=>Object.keys(hpG()).map(Number).filter(p=>{const d=hpDays(hpG()[p]);return d===null||d>=2});
const hpCard=()=>{const n=hpDue().length;return n?`<div class="c" onclick="go('hp')" style="cursor:pointer;border-color:var(--bad)"><div class="row sp"><b>📌 الصفحات الصعبة</b><span class="ch">${svg('chev')}</span></div><div class="m">${n} ${n==1?'صفحة':'صفحات'} تحتاج مراجعة اليوم</div></div>`:''};
function hpAdd(){const v=String($('#hpi').value||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)),ps=[...new Set((v.match(/\d+/g)||[]).map(Number).filter(p=>p>=1&&p<=604))];
 if(!ps.length){toast('اكتب رقم صفحة من 1 إلى 604');return}const H=hpG();let n=0;ps.forEach(p=>{if(!H[p]){H[p]={a:new Date().toISOString(),l:null,n:0};n++}});save();toast(n?'أُضيفت '+n+(n==1?' صفحة':' صفحات'):'الصفحات موجودة في القائمة');draw()}
function hpRev(p){const h=hpG()[p];if(!h)return;h.l=new Date().toISOString();h.n=(h.n||0)+1;save();toast('سُجّلت مراجعة صفحة '+p);draw()}
function hpDel(p){delete hpG()[p];save();draw()}
function hpTask(p){if((S.tasks||[]).some(t=>!t.arch&&(t.pg||[]).includes(p)&&t.type=='مراجعة')){toast('المراجعة موجودة في مهامك');return}
 S.tasks.push({id:S.id++,s:'صفحة '+p,j:0,pg:[p],tm:null,a:1,b:1,type:'مراجعة',stage:0,next:new Date().toISOString()});save();toast('أُضيفت إلى مهام اليوم');draw()}
function hpPage(){const H=hpG(),ks=Object.keys(H).map(Number);
 const key=p=>{const d=hpDays(H[p]);return[d===null||d>=2?0:1,H[p].l?new Date(H[p].l).getTime():0,p]};
 ks.sort((a,b)=>{const x=key(a),y=key(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2]});
 const row=p=>{const h=H[p],d=hpDays(h),due=d===null||d>=2;
  return `<div class="c" style="${due?'border-color:var(--bad)':''}"><div class="row sp" style="flex-wrap:nowrap"><div><b>صفحة ${p}</b><div class="m">${exSur(p)} • الجزء ${jzOf(p)}</div></div>${due?'<span class="m" style="color:var(--bad);font-weight:700">مستحقة اليوم</span>':'<span class="m">مراجَعة</span>'}</div><div class="m" style="margin-top:4px">${d===null?'لم تُراجع بعد':'آخر مراجعة '+(d==0?'اليوم':'قبل '+d+' يوم')} • ${h.n||0} مراجعة</div>
  <div class="row" style="margin-top:8px;gap:6px"><button type="button" style="flex:1" onclick="hpRev(${p})">✅ راجعتها</button><button type="button" class="g" onclick="hpTask(${p})">➕ مهمة</button><button type="button" class="g" onclick="ask('إزالة صفحة ${p} من الصفحات الصعبة؟',()=>hpDel(${p}),'نعم، أزل')">لم تعد صعبة</button></div></div>`};
 const n=hpDue().length;
 return `<div class="row sp" style="padding:4px 14px"><b style="font-size:18px">الصفحات الصعبة</b><button type="button" class="g" onclick="go('home')">رجوع</button></div>
 <div class="c"><b>أضف صفحات تجد صعوبة فيها</b><div class="row" style="flex-wrap:nowrap;gap:6px;margin-top:8px"><input id="hpi" inputmode="numeric" placeholder="رقم الصفحة، أو عدة أرقام: 52، 120، 301" autocomplete="off" style="flex:1;margin:0;min-width:0"><button type="button" onclick="hpAdd()">إضافة</button></div>
 <div class="m" style="margin-top:6px">تظهر الصفحة هنا وتتكرر مراجعتها كل يومين، أكثر من الجدول العادي. اضغط «لم تعد صعبة» عندما تتقنها.</div></div>
 ${ks.length?`<div class="m" style="margin:0 16px">${ks.length} ${ks.length==1?'صفحة':'صفحات'} • ${n?n+' مستحقة اليوم':'لا شيء مستحق اليوم، بارك الله فيك 🌿'}</div>${ks.map(row).join('')}`:'<div class="c m">لا صفحات صعبة بعد. أضف أول صفحة من الخانة أعلاه.</div>'}`}

/* ---------- خطة ختمة رمضان: ختم القرآن في عدد أيام تحدده ---------- */
const khG=()=>S.kh&&S.kh.start?S.kh:null;let khEdit=0;
function khSeg(K,i){const T=604*K.k;let a=Math.round((i-1)*T/K.days)+1,b=Math.max(a,Math.round(i*T/K.days));const seg=[];
 while(a<=b){const c=Math.floor((a-1)/604),e=Math.min(b,(c+1)*604);seg.push([a-c*604,e-c*604,c+1]);a=e+1}return seg}
const khTxt=(K,seg)=>seg.map(([x,y,c])=>(x==y?'صفحة '+x:'صفحات '+x+' - '+y)+(K.k>1?' (ختمة '+c+')':'')).join(' ثم ');
const khIdx=K=>{const t=new Date();t.setHours(0,0,0,0);return Math.floor((t-wrdDate(K.start))/864e5)+1};
const khDone=K=>Object.keys(K.chk||{}).filter(i=>K.chk[i]).length;
const khCard=()=>{const K=khG();if(!K)return '';const i=khIdx(K);if(i<1||i>K.days||(K.chk||{})[i])return '';return `<div class="c" onclick="go('kh')" style="cursor:pointer;border-color:var(--pri)"><div class="row sp"><b>🌙 ختمتك اليوم</b><span class="ch">${svg('chev')}</span></div><div class="m">${khTxt(K,khSeg(K,i))}</div></div>`};
function khQ(n){const e=$('#khd');if(e){e.value=n;khPrev()}}
function khPrev(){const d=Math.max(0,Math.floor(+$('#khd').value||0)),k=Math.max(0,Math.floor(+$('#khk').value||0)),o=$('#khp');if(!o)return;
 if(!d||!k){o.textContent='';return}const ppd=604*k/d;o.textContent='≈ '+(Math.round(ppd*10)/10)+' صفحة يومياً، أي '+wrdTxt(Math.round(ppd*WRL/5))+' بعد كل صلاة من الصلوات الخمس'}
function khSave(){const days=Math.floor(+$('#khd').value||0),k=Math.floor(+$('#khk').value||0),st=$('#khs').value;
 if(days<1||days>120){toast('عدد الأيام من 1 إلى 120');return}if(k<1||k>10){toast('عدد الختمات من 1 إلى 10');return}if(!st){toast('اختر تاريخ البدء');return}
 const o=S.kh||{},same=o.days==days&&o.k==k;S.kh={days,k,start:st,chk:same?(o.chk||{}):{}};khEdit=0;save();toast('تم حفظ الخطة');draw()}
function khTog(i){const K=khG();if(!K)return;K.chk=K.chk||{};K.chk[i]=!K.chk[i];save();draw()}
function khReset(){ask('حذف خطة الختمة وتقدمها؟',()=>{S.kh=null;khEdit=0;save();draw()},'نعم، احذف')}
function khForm(){const K=S.kh;
 return `<div class="row sp" style="padding:4px 14px"><b style="font-size:18px">ختمة رمضان</b><button type="button" class="g" onclick="${K?'khEdit=0;draw()':"go('home')"}">رجوع</button></div>
 <div class="c"><div class="m">في كم يوماً تريد ختم القرآن؟</div><input id="khd" type="number" inputmode="numeric" min="1" max="120" value="${K?K.days:30}" oninput="khPrev()">
 <div style="margin:6px 0">${[30,20,15,10,7].map(n=>`<span class="chip" onclick="khQ(${n})">${n} ${n==30?'يوماً':'أيام'}</span>`).join('')}</div>
 <div class="m">عدد الختمات</div><input id="khk" type="number" inputmode="numeric" min="1" max="10" value="${K?K.k:1}" oninput="khPrev()">
 <div class="m">تاريخ أول يوم</div><input id="khs" type="date" value="${K?K.start:ymd(new Date())}">
 <div class="m" style="margin-top:4px">غيّر التاريخ إلى أول يوم من رمضان، أو اتركه اليوم لتبدأ الآن.</div>
 <div class="m" id="khp" style="margin-top:8px;font-weight:700"></div>
 <button type="button" onclick="khSave()" style="width:100%;margin-top:10px">${K?'حفظ التعديل':'ابدأ الخطة'}</button>${K?'<div class="m" style="margin-top:6px">تعديل عدد الأيام أو الختمات يمسح علامات الأيام السابقة.</div>':''}</div>`}
function khPage(){const K=khG();if(!K||khEdit){setTimeout(khPrev,0);return khForm()}
 const i=khIdx(K),dn=khDone(K),pct=Math.round(dn/K.days*100),ppd=604*K.k/K.days;
 const today=()=>{if(i<1){const n=1-i;return `<div class="m">الخطة تبدأ بعد ${n} ${n==1?'يوم':'أيام'} (${K.start})</div><b style="font-size:20px;display:block;margin:6px 0">${khTxt(K,khSeg(K,1))}</b><div class="m">ورد أول يوم</div>`}
  if(i>K.days)return `<b style="font-size:18px">انتهت أيام الخطة</b><div class="m" style="margin-top:6px">أتممت ${dn} من ${K.days} يوماً${dn>=K.days?' • ما شاء الله، ختمت 🎉':''}</div>`;
  const sg=khSeg(K,i),on=!!(K.chk||{})[i];
  return `<div class="m">اليوم ${i} من ${K.days}</div><b style="font-size:22px;display:block;margin:6px 0">${khTxt(K,sg)}</b><div class="m">يبدأ من ${exSur(sg[0][0])} • ${wrdTxt(Math.round(ppd*WRL/5))} بعد كل صلاة</div>
  <button type="button" onclick="khTog(${i})" style="width:100%;margin-top:10px;${on?'opacity:.6':''}">${on?'✅ أنهيت ورد اليوم (اضغط للتراجع)':'أنهيت ورد اليوم'}</button>`};
 const rows=[...Array(K.days)].map((_,x)=>{const n=x+1,d=wrdDate(K.start);d.setDate(d.getDate()+x);const on=!!(K.chk||{})[n],now=n==i,late=n<i&&!on;
  return `<div class="row" onclick="khTog(${n})" style="flex-wrap:nowrap;gap:8px;padding:8px 6px;border-top:1px solid var(--bd);cursor:pointer;${now?'background:color-mix(in srgb,var(--pri) 10%,transparent);border-radius:8px':''}"><span style="width:26px;height:26px;border-radius:50%;flex:none;text-align:center;line-height:26px;font-size:13px;border:1px solid ${on?'var(--pri)':late?'var(--bad)':'var(--bd)'};background:${on?'var(--pri)':'transparent'};color:${on?'#fff':'inherit'}">${on?'✓':n}</span><div style="flex:1;min-width:0"><b style="font-size:14px">${khTxt(K,khSeg(K,n))}</b><div class="m" style="font-size:11px">${D[d.getDay()]} ${ymd(d).slice(5)}${now?' • اليوم':late?' • متأخر':''}</div></div></div>`}).join('');
 return `<div class="row sp" style="padding:4px 14px"><b style="font-size:18px">ختمة رمضان</b><button type="button" class="g" onclick="go('home')">رجوع</button></div>
 <div class="c" style="text-align:center">${today()}<div style="background:var(--bd);border-radius:10px;height:10px;margin-top:12px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--pri)"></div></div><div class="m" style="margin-top:6px">أتممت ${dn} من ${K.days} يوماً (${pct}%) • الخطة: ${K.k==1?'ختمة':K.k+' ختمات'} في ${K.days} يوماً، نحو ${Math.round(ppd*10)/10} صفحة يومياً</div></div>
 <div class="c"><b>جدول الأيام</b><div class="m" style="margin-bottom:4px">اضغط على أي يوم لوضع علامة الإنجاز أو إزالتها.</div>${rows}</div>
 <div class="row" style="padding:0 14px;gap:6px"><button type="button" class="g" style="flex:1" onclick="khEdit=1;draw()">تعديل الخطة</button><button type="button" class="g" style="flex:1" onclick="khReset()">حذف الخطة</button></div>`}


Object.assign(EN,{'➕ إضافة إلى المهام':'➕ Add to tasks','المراجعة موجودة في مهامك':'The review is already in your tasks'});
