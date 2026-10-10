/* Field finder: sort professors and thesis/papers by specialization (TinyFish Search via the Worker). */
const FLD=[['ai_ml','🤖','AI / ML','machine_learning'],['data_sci','📊','Data Science','data_science'],['cyber','🛡️','Cybersecurity','computer_security'],['mech','⚙️','Mechanical','mechanical_engineering'],['ece','📡','Electronics & Comm','electronics'],['elec','⚡','Electrical & Power','electrical_engineering'],['civil','🏗️','Civil & Environment','civil_engineering'],['chembio','🧪','Chemical & Bio','biotechnology']];
const FINST=[['ac.in','Any Indian institute'],['iitd.ac.in','IIT Delhi'],['iitb.ac.in','IIT Bombay'],['iitm.ac.in','IIT Madras'],['iitk.ac.in','IIT Kanpur'],['iitkgp.ac.in','IIT Kharagpur'],['iisc.ac.in','IISc Bangalore'],['iiit.ac.in','IIIT Hyderabad'],['nitt.edu','NIT Trichy']];
const FD=sGet('sb_find',{});const FS={f:'ai_ml',inst:'ac.in',mode:'prof',sort:'new',busy:0};
const fName=k=>(FLD.find(x=>x[0]===k)||[0,'','Field'])[2];
function finderCard(){
  return `<div class="card solo" id="finder"><div class="kick">Find by field · TinyFish Search</div>
  <p class="sub" style="margin:0 0 8px">Pick your field. We sort professors and recent thesis papers for it, so you know who to email.</p>
  <div class="chips">${FLD.map(f=>`<button class="chip${FS.f===f[0]?' on':''}" onclick="fSet('f','${f[0]}')">${f[1]} ${f[2]}</button>`).join('')}</div>
  <div class="chips" style="margin-top:6px"><button class="chip${FS.mode==='prof'?' on':''}" onclick="fSet('mode','prof')">👩‍🏫 Professors</button><button class="chip${FS.mode==='thesis'?' on':''}" onclick="fSet('mode','thesis')">📄 Thesis & papers</button></div>
  ${FS.mode==='prof'?`<label class="l" for="finst">Institute</label><select class="f" id="finst" onchange="FS.inst=this.value">${FINST.map(i=>`<option value="${i[0]}"${FS.inst===i[0]?' selected':''}>${i[1]}</option>`).join('')}</select>`
  :`<label class="l" for="fsort">Sort by</label><select class="f" id="fsort" onchange="FS.sort=this.value"><option value="new"${FS.sort==='new'?' selected':''}>Newest first</option><option value="cited"${FS.sort==='cited'?' selected':''}>Most cited first</option></select>`}
  <div class="acts"><button class="btn" id="fgo" onclick="fRun()">Show ${esc(fName(FS.f))} ${FS.mode==='prof'?'professors':'thesis papers'}</button></div>
  <div id="fout" style="margin-top:10px"></div></div>`;
}
function fSet(k,v){FS[k]=v;const w=$('finder');if(w){const sc=window.scrollY;w.outerHTML=finderCard();window.scrollTo(0,sc)}}
function fTags(a){return (a||[]).map(k=>`<span style="font-size:11px;padding:2px 8px;border-radius:99px;border:1px solid var(--line);margin-right:4px">${fName(k)}</span>`).join('')}
function fProf(x,i){
  return `<div class="mini" style="display:block;margin-bottom:8px"><div class="mt"><b>${esc(x.title)}</b><small>${esc(x.site)} · ${x.kind==='list'?'Faculty list page':'Profile page'}</small></div>
  ${x.interests?`<div style="margin:4px 0"><b>Research:</b> ${esc(x.interests)}</div>`:`<div style="margin:4px 0;opacity:.8">${esc(x.snippet)}</div>`}
  <div>${fTags(x.labels)}</div>
  <div class="acts" style="margin-top:8px"><a class="go" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Open page ↗</a>${x.kind==='profile'?`<button class="go" style="border:0;cursor:pointer" onclick="fUse(${i})">Use for my email</button>`:''}</div></div>`;
}
function fThesis(x){
  return `<div class="mini" style="display:block;margin-bottom:8px"><div class="mt"><b>${esc(x.title)}</b><small>${esc(x.authors)}${x.year?' · '+x.year:''}${x.venue?' · '+esc(x.venue):''}${x.cited?' · cited '+x.cited:''}</small></div>
  <div>${fTags(x.labels)}</div><div class="acts" style="margin-top:8px"><a class="go" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Open ↗</a>${x.pdf?`<a class="go" href="${esc(x.pdf)}" target="_blank" rel="noopener noreferrer">PDF ↗</a>`:''}</div></div>`;
}
function fFallback(){
  const f=FLD.find(x=>x[0]===FS.f);
  return `<div class="why">Live search is not available right now. Use these free searches instead:</div>
  <div class="acts"><a class="go" target="_blank" rel="noopener noreferrer" href="https://scholar.google.com/citations?view_op=search_authors&mauthors=label:${f[3]}">Google Scholar authors ↗</a><a class="go" target="_blank" rel="noopener noreferrer" href="https://scholar.google.com/scholar?q=${encodeURIComponent(f[2]+' thesis India')}">Scholar papers ↗</a></div>`;
}
let FRES=[];
async function fRun(){
  const o=$('fout'),b=$('fgo');if(!o||FS.busy)return;
  const key=[FS.mode,FS.f,FS.inst,FS.sort].join('|');
  const paint=L=>{FRES=L;o.innerHTML=L.length?L.map((x,i)=>FS.mode==='prof'?fProf(x,i):fThesis(x)).join('')+'<p style="font-size:12px;opacity:.75">Sorted by how closely the page matches your field. Check the official page before you email.</p>':'<p>Nothing found. Try another institute or field.</p>'};
  if(FD[key]&&Date.now()-FD[key].t<86400000){paint(FD[key].L);return}
  FS.busy=1;b.disabled=true;o.innerHTML='<div class="tip">TinyFish is searching…</div>';
  try{
    const r=await tfCall(FS.mode==='prof'?'/faculty?field='+FS.f+'&inst='+encodeURIComponent(FS.inst):'/theses?field='+FS.f+'&sort='+FS.sort+'&year=2022',{},30000);
    if(!r.ok)throw 0;FD[key]={t:Date.now(),L:r.results};sSet('sb_find',FD);paint(r.results);
  }catch(e){o.innerHTML=fFallback()}
  FS.busy=0;if($('fgo'))$('fgo').disabled=false;
}
function fUse(i){
  const x=FRES[i];if(!x)return;
  if($('rurl'))$('rurl').value=x.url;if($('r2')&&!$('r2').value.trim())$('r2').value=x.site;
  if($('r3')&&x.interests)$('r3').value=x.interests;
  const e=$('rurl')||$('r1');if(e)e.scrollIntoView({behavior:'smooth',block:'center'});
  if(typeof profRead==='function'&&$('rurl'))profRead();
  rmk();toast('Filled the email form');
}
const _vRes3=vResearch;
vResearch=function(){
  const s=_vRes3();if(typeof tfOn!=='function'||!tfOn())return s;
  return s.replace('<div class="card solo"><div class="kick">Email a professor</div>',finderCard()+'<div class="card solo"><div class="kick">Email a professor</div>');
};
