const LOGO='<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#e4002b"/><path d="M32 15 7 28l25 13 25-13z" fill="#fff"/><path d="M17 36v9c0 3.500 6.500 7 15 7s15-3.500 15-7v-9l-15 7.500z" fill="#ffc906"/><path d="M54 29v15" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
const SV=p=>'<svg viewBox="0 0 24 24">'+p+'</svg>';
const HEART=SV('<path d="M12 20.5S4.5 15.900 2.700 11.200C1.600 8 3.400 5 6.600 5c2 0 3.500 1.100 4.400 2.600h2C13.900 6.100 15.400 5 17.400 5c3.200 0 5 3 3.900 6.200C19.500 15.900 12 20.500 12 20.500z"/>');
const SHARE=SV('<path d="M12 15V3M7.500 7.500 12 3l4.500 4.500M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>');
const LABEL={hackathon:'Hackathon',meetup:'Meetup',marathon:'Marathon',sports:'Sports',fest:'Fest',govt:'Government',private:'Private',job:'Govt job'};
let P=sGet('sb_profile',null),SAVED=sGet('sb_saved',[]),CHECK=sGet('sb_check',{}),CLAIM=sGet('sb_perks',{});
if(!P||typeof P!=='object'||Array.isArray(P))P=null;
if(!Array.isArray(SAVED))SAVED=[];
if(!CHECK||typeof CHECK!=='object'||Array.isArray(CHECK))CHECK={};
if(!CLAIM||typeof CLAIM!=='object'||Array.isArray(CLAIM))CLAIM={};
let LANG=sGet('sb_lang','en');if(LANG!=='hi')LANG='en';
const hiOn=()=>LANG==='hi'&&(S.tab==='home'||(S.tab==='discover'&&S.disc==='jobs'));
const langBtn=()=>`<button class="chip lt" onclick="toggleLang()" aria-label="Switch Hindi or English">${LANG==='hi'?'English':'हिंदी'}</button>`;
function toggleLang(){LANG=LANG==='hi'?'en':'hi';sSet('sb_lang',LANG);render()}
const daysLeft=it=>{const d=typeof DEADLINES!=='undefined'&&DEADLINES[it.id];if(!d)return null;return Math.ceil((new Date(d+'T23:59:59')-new Date())/864e5)};
function soonTag(it){const n=daysLeft(it);if(n===null||n<0||n>21)return '';const h=hiOn();return `<span class="pill soon">⏰ ${n===0?(h?HI.today:'Closes today'):(h?HI.soon:'Closing soon')+' · '+n+' '+(h?HI.days:(n===1?'day':'days'))}</span>`}
const S={tab:'home',disc:'events',evType:'all',inSec:'all',inNear:true,only:false,q:'',country:'USA',pCat:'all',cFree:'all',lCat:'free',jobCat:'all',byears:2,tuL:'mid',livL:'mid',sch:0,rate:{},onceOv:{}};

function brOK(br,b){if(!br||br==='any')return true;if(br==='tech')return TECH.includes(b);if(br==='eng')return ENG.includes(b);return br.includes(b)}
function brLabel(br){return br==='tech'?'CS / IT / ECE / EEE':br==='eng'?'Engineering branches':Array.isArray(br)?br.join(', '):'All branches'}
function check(it){
  if(!P)return {st:'q',why:[]};
  const w=[];
  if(it.minAge&&P.age<it.minAge)w.push('min age '+it.minAge);
  if(it.maxAge&&P.age>it.maxAge)w.push('max age '+it.maxAge);
  if(it.gender&&P.gender!==it.gender)w.push('women only');
  if(it.years&&!it.years.includes(P.year))w.push('for '+it.years.map(yl).join(', '));
  if(!brOK(it.br,P.branch))w.push('for '+brLabel(it.br));
  if(it.edu==='grad'&&!['4','5','grad'].includes(P.year))w.push('needs a degree (apply after graduation)');
  return {st:w.length?'no':'ok',why:w};
}
function pill(c,it){const h=hiOn();return (c.st==='q'?`<span class="pill q">${h?HI.q:'Set up to check'}</span>`:c.st==='ok'?`<span class="pill ok">${h?HI.ok:'✓ You can apply'}</span>`:`<span class="pill no">${h?HI.no:'Not eligible'}</span>`)+(it?soonTag(it):'')}
const rank={ok:0,q:1,no:2};
const sortE=a=>a.map(x=>({x,c:check(x)})).sort((p,q)=>rank[p.c.st]-rank[q.c.st]);
const find=id=>EV.find(e=>e.id===id)||IN.find(e=>e.id===id)||JOBS.find(e=>e.id===id);
const isIN=it=>!!it.s;
const inNearOK=it=>!P||!S.inNear||it.loc.includes('all')||it.remote||it.loc.includes(P.region);
const match=it=>!S.q||((it.n||'')+' '+(it.o||'')+' '+(it.d||it.roles||'')).toLowerCase().includes(S.q.toLowerCase());

function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2000)}
function openSheet(h){$('sbox').innerHTML='<div class="grab"></div>'+h;$('sheet').classList.add('on');$('sbox').scrollTop=0}
function closeSheet(){$('sheet').classList.remove('on')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
const A=(u,t,c)=>`<a class="${c||'btn'}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${t}</a>`;

function card(it){
  const c=check(it),k=it.t||it.s,sv=SAVED.includes(it.id);
  const meta=isIN(it)?[it.pay,it.dur,it.remote?'Remote':(it.loc[0]==='all'?'Anywhere in India':it.loc.join(', '))]:[it.mode,it.fee,it.when.split('.')[0]];
  return `<article class="card"><div class="ct"><div class="tile">${it.e}</div><div><div class="kick">${LABEL[k]}</div><h3>${esc(hiOn()&&JOB_HI[it.id]?JOB_HI[it.id][0]:it.n)}</h3><div class="org">${esc(hiOn()&&JOB_HI[it.id]?JOB_HI[it.id][1]:it.o)}</div></div></div>${pill(c,it)}${c.st==='no'?`<div class="why">${hiOn()?HI.why:'Why: '}${esc(c.why.join(' · '))}</div>`:''}
  <div class="meta">${meta.filter(Boolean).map(m=>`<span>${esc(m)}</span>`).join('')}</div>
  <div class="acts"><button class="btn" onclick="detail('${it.id}')">${hiOn()?HI.how:'How to apply'}</button><button class="ic${sv?' on':''}" aria-label="Save" onclick="save('${it.id}')">${HEART}</button><button class="ic" aria-label="Share" onclick="share('${it.id}')">${SHARE}</button></div></article>`;
}
function detail(id){
  const it=find(id),c=check(it),steps=it.how||GUIDE[it.t]||[];
  openSheet(`<div class="kick">${it.e} ${LABEL[it.t||it.s]}</div><h1 style="font-size:34px">${esc(it.n)}</h1><div class="org">${esc(it.o)}</div>${pill(c,it)}${c.st==='no'?`<div class="why">You don't match: ${esc(c.why.join(' · '))}</div>`:''}
  <p>${esc(it.d||it.roles)}</p>
  <div class="meta">${(isIN(it)?[it.pay,it.dur,it.roles]:[it.mode,it.fee,it.when]).filter(Boolean).map(m=>`<span>${esc(m)}</span>`).join('')}</div>
  ${it.tip||it.note?`<div class="tip">${esc(it.tip||it.note)}</div>`:''}
  <h2 style="margin-top:20px">Steps</h2><ol class="steps">${steps.map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ol>
  <div class="acts">${A(it.link,'Open official site ↗')}<button class="ic${SAVED.includes(it.id)?' on':''}" aria-label="Save" onclick="save('${it.id}');detail('${it.id}')">${HEART}</button></div>`);
}
function save(id){const i=SAVED.indexOf(id);if(i>-1){SAVED.splice(i,1);toast('Removed from saved')}else{SAVED.push(id);toast('Saved')}sSet('sb_saved',SAVED);if(!$('sheet').classList.contains('on'))render()}
async function share(id){const it=find(id),txt=`${it.n}: check if you're eligible on Student Buddy. ${it.link}`;
  try{if(navigator.share){await navigator.share({title:it.n,text:txt,url:it.link});return}}catch(e){return}
  try{await navigator.clipboard.writeText(txt);toast('Link copied')}catch(e){window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener')}}

const TABS=[['home',SV('<path d="M3 11.500 12 4l9 7.500M5.500 10v9.500h13V10"/>'),'Home'],['discover',SV('<circle cx="11" cy="11" r="6.500"/><path d="m20 20-4.200-4.200"/>'),'Discover'],['abroad',SV('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.800 3 2.800 15 0 18M12 3c-2.800 3-2.800 15 0 18"/>'),'Abroad'],['research',SV('<path d="M9 3h6M10 3v6l-5.500 9.500A2 2 0 0 0 6.200 21h11.600a2 2 0 0 0 1.700-2.500L14 9V3"/><path d="M7.500 15h9"/>'),'Research'],['support',SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.500"/><path d="M5.600 5.600l3.900 3.900M14.500 14.500l3.900 3.900M18.400 5.600l-3.900 3.900M9.500 14.500l-3.900 3.900"/>'),'Support'],['me',SV('<circle cx="12" cy="8.500" r="3.800"/><path d="M4.500 20c1-4 4-5.500 7.500-5.500s6.500 1.500 7.500 5.500"/>'),'Me']];
function go(t,o){if(t&&typeof t==='object'){o=t;t=o.tab}if(o&&o.chat){openChat(o.chat===true?undefined:o.chat);return}if(t==='perks'){t='discover';o=Object.assign({},o,{disc:'perks'})}Object.assign(S,o||{},{tab:t});if(o&&o.disc)S.q='';closeSheet();render();window.scrollTo(0,0)}
function set(k,v){S[k]=v;render()}
function render(){
  paintTheme();
  $('tabs').innerHTML=TABS.map(t=>`<button class="${S.tab===t[0]?'on':''}" onclick="go('${t[0]}')">${t[1]}${t[2]}</button>`).join('');
  $('av').textContent=P&&P.name?P.name[0].toUpperCase():'?';
  $('view').innerHTML=({home:vHome,discover:vDisc,abroad:vAbroad,research:vResearch,support:vSupport,me:vMe})[S.tab]();
  group();afterRender();
}
function group(){const v=$('view');let run=[];const flush=()=>{if(run.length){const g=document.createElement('div');g.className='grid';v.insertBefore(g,run[0]);run.forEach(e=>g.appendChild(e));run=[]}};
  Array.from(v.children).forEach(e=>{if(e.matches('.card:not(.solo),.row,.acc')){run.push(e)}else flush()});flush()}

function vHome(){
  const all=[...EV,...IN,...JOBS],ok=all.filter(x=>check(x).st==='ok').length;
  const st=[['🏆','Hackathons',{tab:'discover',disc:'events',evType:'hackathon'}],['💼','Internships',{tab:'discover',disc:'internships',inSec:'all'}],['🪖','Govt jobs',{tab:'discover',disc:'jobs',jobCat:'all'}],['⚽','Sports',{tab:'discover',disc:'sports'}],['✈️','Abroad',{tab:'abroad'}],['🔬','Research',{tab:'research'}],['🤝','Talk',{tab:'support'}],['✨','Ask Buddy',{chat:true}]];
  const h=LANG==='hi',tn=n=>h?HI.tiles[n]||n:n;
  const picks=sortE(all).filter(p=>p.c.st==='ok').slice(0,6).map(p=>p.x);
  return `<div class="hm"><h1>${P&&P.name?(h?HI.hey:'Hey, ')+esc(P.name.split(' ')[0]):(h?HI.h1:'Find what fits you')}</h1><p class="sub">${h?HI.sub:'Add your profile. See only what you can apply to.'} ${langBtn()}</p>
  <div class="stories mo">${st.map(s=>`<button class="story" onclick='go(${JSON.stringify(s[2])})'><div class="ring"><i>${s[0]}</i></div><span>${tn(s[1])}</span></button>`).join('')}</div>
  <div class="tiles">${st.map(s=>`<button class="tile2" onclick='go(${JSON.stringify(s[2])})'><span>${s[0]}</span><b>${tn(s[1])}</b></button>`).join('')}</div>
  ${P?`<div class="hero"><span class="big-n">${ok}</span><p>${h?HI.heroOk(ok,all.length).replace(/^अभी (\d+) में से (\d+)/,'अभी $1 में से $2'):'of '+all.length+' opportunities you can apply to right now'}</p><button class="btn" onclick="go('discover',{disc:'events',only:true})">${h?HI.see:'See them'}</button></div>`
  :`<div class="hero"><span class="big-n">${h?HI.hero30:'30 sec'}</span><p>${h?HI.hero30p:'Tell us your year and branch. We show only what you qualify for.'}</p><button class="btn" onclick="startOB()">${h?HI.check:'Check my eligibility'}</button></div>`}</div>
  ${picks.length?`<h2>${h?HI.picked:'Picked for you'}</h2>${picks.map(card).join('')}`:`<h2>${h?HI.trend:'Trending'}</h2>${[EV[0],IN[12],EV[5]].map(card).join('')}`}`;
}
function vDisc(){
  const segs=[['events','Events'],['internships','Internships'],['jobs','Govt jobs'],['sports','Sports'],['courses','Courses'],['certs','Certs'],['perks','Perks']];
  let body='';
  if(S.disc==='events'){
    let L=sortE(EV.filter(e=>(S.evType==='all'||e.t===S.evType)&&match(e)));if(S.only)L=L.filter(p=>p.c.st!=='no');
    body=`<div class="chips">${TYPES.map(t=>`<button class="chip${S.evType===t[0]?' on':''}" onclick="set('evType','${t[0]}')">${t[1]}</button>`).join('')}</div>`+only()+(L.map(p=>card(p.x)).join('')||'<div class="empty">Nothing here. Try another filter.</div>');
  }else if(S.disc==='internships'){
    let L=sortE(IN.filter(i=>(S.inSec==='all'||i.s===S.inSec)&&inNearOK(i)&&match(i)));if(S.only)L=L.filter(p=>p.c.st!=='no');
    body=`<div class="chips">${[['all','All'],['govt','Government'],['private','Private']].map(t=>`<button class="chip${S.inSec===t[0]?' on':''}" onclick="set('inSec','${t[0]}')">${t[1]}</button>`).join('')}<button class="chip${S.inNear?' on':''}" onclick="set('inNear',${!S.inNear})">Near me${P?' · '+esc(P.region):''}</button></div>`+only()+(L.map(p=>card(p.x)).join('')||'<div class="empty">No internships match. Turn off "Near me".</div>');
  }else if(S.disc==='jobs'){
    const JC=[['all','All'],['army','Army'],['navy','Navy'],['airforce','Air Force'],['police','Police'],['civil','Tax and civil']];
    let L=sortE(JOBS.filter(j=>(S.jobCat==='all'||j.cats.includes(S.jobCat))&&match(j)));if(S.only)L=L.filter(p=>p.c.st!=='no');
    body=`<div class="chips">${JC.map(t=>`<button class="chip${S.jobCat===t[0]?' on':''}" onclick="set('jobCat','${t[0]}')">${hiOn()?HI.jc[t[0]]:t[1]}</button>`).join('')}${langBtn()}</div>`+only()+(L.map(p=>card(p.x)).join('')||'<div class="empty">No jobs match. Try another group.</div>')+`<div class="card solo"><b>${hiOn()?HI.read:'Read this first'}</b><p class="sub" style="font-size:14px;margin:8px 0 0">${hiOn()?HI.note:esc(JOB_NOTE)+' Vacancies, fees and dates change every year, so always confirm on the official site.'}</p></div>`+ytRows(['Govt exams']);
  }else if(S.disc==='sports'){
    let L=sortE(EV.filter(e=>e.t==='sports'&&match(e)));if(S.only)L=L.filter(p=>p.c.st!=='no');
    const SP=[['🏅','Sports Authority of India','Official sports body. Academies, schemes and training centres.','https://sportsauthorityofindia.nic.in'],['🥇','Khelo India','National programme for young athletes, games and scholarships.','https://kheloindia.gov.in'],['💪','Fit India','Fitness challenges and quizzes for everyone.','https://fitindia.gov.in'],['🇮🇳','MY Bharat','Government youth portal with volunteering, events and programmes.','https://mybharat.gov.in']];
    body=only()+(L.map(p=>card(p.x)).join('')||'<div class="empty">Nothing here.</div>')+`<h2>Sports as a career</h2><div class="card solo"><b>Sports quota jobs</b><p class="sub" style="font-size:14px;margin:8px 0 0">Many government recruitments (Army, Navy, Railways, police and central forces) keep seats for sportspersons. Keep your medals and certificates safe, and read each job notice for the sports quota rules.</p></div>`+SP.map(s=>`<div class="row" style="cursor:default"><div class="e">${s[0]}</div><div class="t"><b>${s[1]}</b><small>${s[2]}</small></div>${A(s[3],'Open','go')}</div>`).join('');
  }else if(S.disc==='perks'){
    body=perksBody();
  }else if(S.disc==='courses'){
    const L=COURSES[S.lCat].filter(match);
    body=`<div class="chips"><button class="chip${S.lCat==='free'?' on':''}" onclick="set('lCat','free')">Free</button><button class="chip${S.lCat==='paid'?' on':''}" onclick="set('lCat','paid')">Paid</button></div>`+L.map(c=>`<div class="row" style="cursor:default"><div class="e">${c.e}</div><div class="t"><b>${esc(c.n)}</b><small>${esc(c.o)} · ${esc(c.d)}</small></div>${A(c.link,'Start','go')}</div>`).join('')+ytRows(['Coding','Core subjects','Professors','Cybersecurity']);
  }else{
    const L=CERTS.filter(c=>(S.cFree==='all'||(S.cFree==='free')===c.free)&&match(c));
    body=`<div class="chips">${[['all','All'],['free','Free'],['paid','Paid']].map(t=>`<button class="chip${S.cFree===t[0]?' on':''}" onclick="set('cFree','${t[0]}')">${t[1]}</button>`).join('')}</div>`+L.map(c=>`<details class="acc"><summary>${esc(c.n)}</summary><div class="in"><p><b>Time:</b> ${esc(c.dur)}</p><p><b>Need:</b> ${esc(c.req)}</p><p><b>Cost:</b> ${esc(c.cost)}</p>${A(c.link,'Open ↗')}</div></details>`).join('');
  }
  return `<h1>Discover</h1><div class="toolbar"><div class="seg" id="dseg">${segs.map(s=>`<button class="${S.disc===s[0]?'on':''}" onclick="go('discover',{disc:'${s[0]}'})">${s[1]}</button>`).join('')}</div>
  <input class="search" type="search" placeholder="Search" value="${esc(S.q)}" oninput="onQ(this.value)" aria-label="Search"></div>${body}`;
}
function onQ(v){S.q=v;clearTimeout(window._t);window._t=setTimeout(()=>{render();const s=document.querySelector('.search');if(s){s.focus();s.setSelectionRange(s.value.length,s.value.length)}},250)}
function only(){const h=hiOn();return P?`<div class="tog"><span>${h?HI.only:'Only what I can apply to'}</span><button class="sw${S.only?' on':''}" role="switch" aria-checked="${S.only}" aria-label="Only what I can apply to" onclick="set('only',${!S.only})"></button></div>`:`<div class="tog"><span>${h?HI.setup:'Want to see what fits you?'}</span><button class="chip on" onclick="startOB()">${h?HI.setupb:'Set up'}</button></div>`}
function perkRow(p){const d=CLAIM[p.n];return `<div class="row" style="cursor:default"><div class="e">${p.e}</div><div class="t"><b>${esc(p.n)}</b><small>${esc(p.d)} Need: ${esc(p.need)}</small></div><div style="display:flex;flex-direction:column;gap:6px">${A(p.link,'Get','go')}<button class="go${d?' done':''}" style="border:0;cursor:pointer" data-n="${esc(p.n)}" onclick="claim(this.dataset.n)">${d?'✓ Done':'Mark'}</button></div></div>`}
function claim(n){CLAIM[n]=!CLAIM[n];sSet('sb_perks',CLAIM);toast(CLAIM[n]?'Perk unlocked':'Unmarked');render()}
function vPerks(){
  const cats=['all',...new Set(PERKS.map(p=>p.c))],n=Object.values(CLAIM).filter(Boolean).length;
  const L=PERKS.filter(p=>S.pCat==='all'||p.c===S.pCat);
  return `<h1>Student perks</h1><p class="sub">Your student ID or college email unlocks these.</p>
  <div class="card solo" style="padding:16px"><b>${n} of ${PERKS.length} unlocked</b><div class="bar" style="margin-top:10px"><i style="width:${n/PERKS.length*100}%"></i></div></div>
  <div class="chips">${cats.map(c=>`<button class="chip${S.pCat===c?' on':''}" onclick="set('pCat','${c}')">${c==='all'?'All':c}</button>`).join('')}</div>${L.map(perkRow).join('')}`;
}
function vAbroad(){
  const c=ABROAD.find(a=>a.k===S.country)||ABROAD[0],done=GLOBAL_CHECK.filter((_,i)=>CHECK['g'+i]).length;
  return `<h1>Study abroad</h1><p class="sub">Pick a country. Figures are approximate, so verify on official sites.</p>
  <div class="stories">${ABROAD.map(a=>`<button class="story" onclick="set('country','${a.k}')"><div class="ring${S.country===a.k?'':' off'}"><i>${a.f}</i></div><span>${a.k}</span></button>`).join('')}</div>
  <div class="ab"><div class="ab-a"><div class="hero"><span class="big-n">${c.f}</span><p><b style="color:var(--ink)">${c.k}</b> · ${esc(c.tag)}</p></div>
  <div class="kv"><div><small>Tuition</small><b>${esc(c.tuition)}</b></div><div><small>Living</small><b>${esc(c.living)}</b></div><div><small>Visa</small><b>${esc(c.visa)}</b></div><div><small>Tests</small><b>${esc(c.exams)}</b></div><div class="w"><small>Work rights</small><b>${esc(c.work)}</b></div></div>
  </div><div class="ab-b">${[['Documents',c.docs],['Living & survival',c.live],['Student ID & discounts',c.travel]].map(x=>`<details class="acc"><summary>${x[0]}</summary><div class="in"><ul>${x[1].map(d=>`<li>${esc(d)}</li>`).join('')}</ul></div></details>`).join('')}
  <details class="acc"><summary>Official links</summary><div class="in"><ul>${c.links.map(l=>`<li><a href="${esc(l[1])}" target="_blank" rel="noopener noreferrer">${esc(l[0])}</a></li>`).join('')}</ul></div></details></div></div>
  ${budgetSec(c)}
  ${langSec(c)}
  <h2>My document checklist</h2><div class="bar"><i style="width:${done/GLOBAL_CHECK.length*100}%"></i></div><p class="sub" style="margin-top:8px">${done} of ${GLOBAL_CHECK.length} ready</p>
  <div class="card solo ckcard" style="padding:4px 16px">${GLOBAL_CHECK.map((d,i)=>`<label class="ck"><input type="checkbox" ${CHECK['g'+i]?'checked':''} onchange="CHECK['g${i}']=this.checked;sSet('sb_check',CHECK);render()"><span>${esc(d)}</span></label>`).join('')}</div>`;
}
function vMe(){
  const sv=SAVED.map(find).filter(Boolean);
  return `<h1>${P&&P.name?esc(P.name):'You'}</h1>
  ${P?`<div class="card solo"><div class="meta" style="margin:0"><span>${P.age} yrs</span><span>${yl(P.year)}</span><span>${esc(P.branch)}</span><span>${esc(P.region)}</span><span>${P.gender==='female'?'Female':P.gender==='male'?'Male':'Other'}</span></div><div class="acts"><button class="btn" onclick="startOB()">Edit profile</button></div><p class="sub" style="margin:12px 0 0;font-size:13px">Saved only on this phone. No sign-up.</p></div>`:`<div class="hero"><span class="big-n">30 sec</span><p>Set up once, see only what fits you.</p><button class="btn" onclick="startOB()">Start</button></div>`}
  <h2>Saved (${sv.length})</h2>${sv.length?sv.map(i=>`<div class="row" onclick="detail('${i.id}')"><div class="e">${i.e}</div><div class="t"><b>${esc(i.n)}</b><small>${check(i).st==='ok'?'✓ You can apply':check(i).st==='no'?'Not eligible':'Tap to open'}</small></div></div>`).join(''):'<div class="empty">Tap the heart on any card to save it here.</div>'}
  <h2>Tools</h2>
  <div class="row" onclick="openChat()"><div class="e">✨</div><div class="t"><b>Ask Buddy</b><small>Chat helper for eligibility, jobs, abroad and more</small></div></div>
  <div class="row" onclick="toolMail()"><div class="e">✉️</div><div class="t"><b>Internship email writer</b><small>Fill 3 boxes, copy, send</small></div></div>
  <div class="row" onclick="toolTimer()"><div class="e">⏱️</div><div class="t"><b>Focus timer</b><small>25 min study, 5 min break</small></div></div>
  <div class="row" onclick="toolNotes()"><div class="e">🗒️</div><div class="t"><b>Quick notes</b><small>Git, SQL, Big-O, resume tips</small></div></div>
  <h2>Settings</h2><p class="sub" style="margin-bottom:8px">Theme</p><div class="seg fill" style="max-width:300px"><button class="${curTheme()==='dark'?'on':''}" onclick="setTheme('dark')">Dark</button><button class="${curTheme()==='light'?'on':''}" onclick="setTheme('light')">Light</button></div><div class="acts" style="max-width:300px"><button class="btn ghost" onclick="resetAll()">Reset data</button></div>`;
}
const SUN=SV('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>');
const MOON=SV('<path d="M20 14.500A8.500 8.500 0 0 1 9.500 4a8.500 8.500 0 1 0 10.500 10.500z"/>');
const curTheme=()=>document.documentElement.getAttribute('data-theme')||'dark';
function paintTheme(){const b=$('th');if(b){b.innerHTML=curTheme()==='dark'?SUN:MOON;b.title=curTheme()==='dark'?'Switch to light':'Switch to dark'}}
function setTheme(m){document.documentElement.setAttribute('data-theme',m);sSet('sb_theme',m);paintTheme();if(S.tab==='me')render()}
function theme(){setTheme(curTheme()==='dark'?'light':'dark')}
function resetAll(){if(!confirm('Clear your profile, saved items and checklist from this phone?'))return;
  P=null;SAVED=[];CHECK={};CLAIM={};LANG='en';
  ['sb_profile','sb_saved','sb_check','sb_perks','sb_skip','sb_lang'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}sSet(k,null)});
  Object.assign(S,{tab:'home',disc:'events',evType:'all',inSec:'all',inNear:true,only:false,q:'',pCat:'all',cFree:'all',lCat:'free',jobCat:'all'});
  closeSheet();render();window.scrollTo(0,0);toast('Cleared');startOB(true)}

function toolMail(){openSheet(`<h1 style="font-size:34px">Internship email</h1><label class="l">Your name</label><input class="f" id="m1" value="${esc(P&&P.name||'')}" oninput="mk()"><label class="l">Company</label><input class="f" id="m2" oninput="mk()"><label class="l">Role</label><input class="f" id="m3" oninput="mk()"><textarea class="f" id="mb" rows="9"></textarea><div class="acts"><button class="btn" onclick="cp()">Copy</button><a class="btn ghost" id="ml" href="#">Open in mail</a></div>`);mk()}
function mk(){const n=$('m1').value||'[Your name]',c=$('m2').value||'[Company]',r=$('m3').value||'[Role]',y=P?yl(P.year):'[Year]',b=P?P.branch:'[Branch]';
  const body=`Dear Hiring Team at ${c},\n\nI am ${n}, a ${y} ${b} student. I am excited about the ${r} internship at ${c} and would love to contribute and learn.\n\nI have attached my resume. Highlights: [1 project], [1 skill], [1 achievement].\n\nThank you for your time.\nRegards,\n${n}\n[Phone] · [LinkedIn] · [GitHub]`;
  $('mb').value=body;$('ml').href='mailto:?subject='+encodeURIComponent('Application for '+r+' internship')+'&body='+encodeURIComponent(body)}
async function cp(){const t=$('mb');try{await navigator.clipboard.writeText(t.value);toast('Copied')}catch(e){t.select();toast('Select and copy')}}
let pt=null;const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function toolTimer(){openSheet(`<h1 style="font-size:34px">Focus timer</h1><div class="timer" id="tm">25:00</div><div class="acts"><button class="btn" onclick="pomo(25)">Focus 25</button><button class="btn ghost" onclick="pomo(5)">Break 5</button><button class="btn ghost" onclick="pomo(0)">Reset</button></div>`)}
function pomo(m){clearInterval(pt);const el=$('tm');if(!el)return;if(!m){el.textContent='25:00';return}let s=m*60;el.textContent=fmt(s);pt=setInterval(()=>{s--;const e=$('tm');if(!e){clearInterval(pt);return}e.textContent=fmt(s);if(s<=0){clearInterval(pt);toast('Time is up')}},1000)}
function toolNotes(){openSheet(`<h1 style="font-size:34px">Quick notes</h1>${NOTES.map(n=>`<details class="acc"><summary>${esc(n[0])}</summary><div class="in"><pre>${esc(n[1])}</pre></div></details>`).join('')}<h2>More</h2>${NOTE_LINKS.map(l=>`<div class="row" style="cursor:default"><div class="t"><b>${esc(l[0])}</b></div>${A(l[1],'Open','go')}</div>`).join('')}`)}

let OB={step:0,welcome:false,d:{age:19,region:'Delhi NCR'}};
const OBQ=[
 {k:'name',h:"What's your name?",p:'So we can say hi. You can leave it empty.',name:true},
 {k:'year',h:'Which year?',o:YEARS.map(y=>[y[0],y[1]])},
 {k:'branch',h:'What do you study?',o:BRANCHES.map(b=>[b,b])},
 {k:'age',h:'Your age?',age:true},
 {k:'gender',h:'You are',p:'Some programs are for women only.',o:[['female','Female'],['male','Male'],['other','Other / skip']]},
 {k:'region',h:'Where do you live?',o:REGIONS.map(r=>[r,r])}];
function startOB(w){OB={step:w?-1:0,welcome:!!w,d:Object.assign({age:19,region:'Delhi NCR'},P||{})};closeSheet();obRender();$('ob').classList.add('on')}
function obRender(){
  if(OB.step<0){$('obi').innerHTML=`<div class="welcome">${LOGO}<h1>Student <em>Buddy</em></h1><p>Find events, internships and perks. Know if you qualify before you apply.</p><button class="go" onclick="OB.step=0;obRender()">Get started</button><button class="skip" onclick="obSkip()">Just let me browse</button></div>`;return}
  const q=OBQ[OB.step];
  $('obi').innerHTML=`${(OB.step>0||OB.welcome)?'<button class="back" onclick="OB.step--;obRender()">← Back</button>':''}<div class="dots">${OBQ.map((_,i)=>`<i class="${i<=OB.step?'on':''}"></i>`).join('')}</div>
  <h1>${q.h}</h1><p>${q.p||'Tap one. You can change it later.'}</p>
  ${q.age?`<div class="age"><button onclick="ageD(-1)" aria-label="Younger">−</button><b id="ag">${OB.d.age}</b><button onclick="ageD(1)" aria-label="Older">+</button></div><button class="go" onclick="obNext()">Next</button>`
  :q.name?`<input class="nm" id="nm" maxlength="30" placeholder="Your name" value="${esc(OB.d.name||'')}" autocomplete="given-name" aria-label="Your name" onkeydown="if(event.key==='Enter')nmNext()"><button class="go" onclick="nmNext()">Next</button>`
  :`<div class="big">${q.o.map(o=>`<button class="${OB.d[q.k]===o[0]?'on':''}" data-v="${esc(o[0])}" onclick="obPick('${q.k}',this.dataset.v)">${esc(o[1])}</button>`).join('')}</div>`}
  <button class="skip" onclick="obSkip()">Skip for now</button>`;
  if(q.name)setTimeout(()=>{const n=$('nm');if(n)n.focus()},60);
}
function nmNext(){OB.d.name=$('nm').value.trim();obNext()}
function ageD(n){OB.d.age=Math.max(13,Math.min(40,OB.d.age+n));$('ag').textContent=OB.d.age}
function obPick(k,v){OB.d[k]=v;obNext()}
function obNext(){if(OB.step<OBQ.length-1){OB.step++;obRender()}else obDone()}
function obDone(){P=Object.assign({name:''},OB.d);sSet('sb_profile',P);$('ob').classList.remove('on');toast('All set');S.only=false;go('home')}
function obSkip(){sSet('sb_skip',true);$('ob').classList.remove('on')}

