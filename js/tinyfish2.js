/* TinyFish features v2 for Student Buddy. Uses TF_API and tfCall from tinyfish.js (same Worker).
   1) Alert me  = TinyFish Monitor API   2) Is this real? = Fetch + Search   3) Professor page = Fetch   4) Cited answers = Research API */
const tfOn=()=>typeof TF_API!=='undefined'&&!!TF_API;
const tfPost=(p,b,ms)=>tfCall(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})},ms);
const tfHostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}};
const tfSl=ms=>new Promise(r=>setTimeout(r,ms));
const tfLinks=a=>(a||[]).map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:4px 6px 0 0">${esc(tfHostOf(u))} ↗</a>`).join('');
const tfBox2=(h,id)=>{const b=$(id);if(b)b.innerHTML=h};

/* ---------- 1) Alert me (Monitor API) ---------- */
let ALERTS=sGet('sb_alerts',{});
function tfAlertH(id){
  const a=ALERTS[id];
  if(!a)return `<button class="btn ghost" onclick="tfAlertOn('${esc(id)}')">🔔 Alert me when this page changes</button>`;
  return `<div class="tip"><b>🔔 TinyFish is watching this page</b><div>Every day at 9 AM. Open your TinyFish dashboard to see changes and turn on email.</div><div id="tfal2" style="margin-top:6px">${a.msg?esc(a.msg):''}</div><div class="acts"><button class="btn ghost" onclick="tfAlertCheck('${esc(id)}')">Check now</button><button class="btn ghost" onclick="tfAlertOff('${esc(id)}')">Stop</button></div></div>`;
}
async function tfAlertOn(id){
  const it=find(id);if(!it)return;tfBox2('<div class="tip">Setting up the TinyFish monitor…</div>','tfalert');
  try{const r=await tfPost('/monitor/create',{url:it.link,name:it.n},30000);
    if(!r.ok)throw 0;ALERTS[id]={mid:r.id,at:Date.now()};sSet('sb_alerts',ALERTS);toast('Alert is on');
  }catch(e){tfBox2('<div class="why">Could not set the alert for this site. Some sites block monitors. Use the official site button.</div><button class="btn ghost" onclick="tfAlertOn(\''+esc(id)+'\')">Try again</button>','tfalert');return}
  tfBox2(tfAlertH(id),'tfalert');
}
async function tfAlertCheck(id){
  const a=ALERTS[id];if(!a)return;const o=$('tfal2');if(o)o.textContent='Checking now…';
  try{const r=await tfPost('/monitor/run?id='+encodeURIComponent(a.mid),{},45000);if(!r.ok)throw 0;
    a.msg=(r.baseline?'First snapshot saved. ':'')+(r.changed===true?'Change found on the page. Open the official site.':r.changed===false?'No change since the last check.':'Checked just now.');
  }catch(e){a.msg='Could not check right now. Try again.'}
  sSet('sb_alerts',ALERTS);tfBox2(tfAlertH(id),'tfalert');
}
async function tfAlertOff(id){
  const a=ALERTS[id];if(!a)return;try{await tfPost('/monitor/delete?id='+encodeURIComponent(a.mid),{},20000)}catch(e){}
  delete ALERTS[id];sSet('sb_alerts',ALERTS);toast('Alert stopped');tfBox2(tfAlertH(id),'tfalert');
}
const _detail2=detail;
detail=function(id){
  _detail2(id);if(!tfOn())return;
  const it=find(id);if(!it||!it.link)return;
  const anchor=$('tfbox')||(()=>{const sb=$('sbox');const all=sb&&sb.querySelectorAll('.acts');return all&&all[all.length-1]})();
  if(!anchor)return;
  const d=document.createElement('div');d.id='tfalert';d.style.margin='10px 0';d.innerHTML=tfAlertH(id);
  anchor.parentNode.insertBefore(d,anchor.id==='tfbox'?anchor.nextSibling:anchor);
};

/* ---------- 2) Is this real? (Fetch + Search) ---------- */
const SCAM_COL={low:['#1f9d55','Low risk signs'],careful:['#d99a00','Be careful'],high:['#e4002b','High risk. Do not pay or share details']};
function scamHtml(r){
  const c=SCAM_COL[r.level];
  return `<div class="tip" style="border-left:4px solid ${c[0]}"><b style="color:${c[0]}">${c[1]}</b> · risk ${r.risk}/100<div style="opacity:.8">${esc(r.host)}${r.title?' · '+esc(r.title):''}</div>
  <ul style="margin:8px 0 0 18px">${r.reasons.map(x=>`<li>${x.good?'✅':'⚠️'} ${esc(x.t)}</li>`).join('')}</ul>
  ${(r.reports||[]).map(x=>`<a class="row" style="text-decoration:none;color:inherit" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><div class="e">🚩</div><div class="t"><b>${esc(x.title)}</b><small>${esc(x.site||tfHostOf(x.url))}</small></div></a>`).join('')}
  <div style="margin-top:8px;font-size:12px;opacity:.75">This is a quick check by TinyFish, not a guarantee. Never pay a fee for a job or internship. Confirm on the official website.</div></div>`;
}
async function scamRun(url,outId){
  const o=$(outId);if(!o)return;
  if(!/^https:\/\//i.test(url)){o.innerHTML='<div class="why">Paste a full link that starts with https://</div>';return}
  o.innerHTML='<div class="tip">TinyFish is reading the page and searching for scam reports… (up to 40 seconds)</div>';
  try{const r=await tfCall('/scam?url='+encodeURIComponent(url),{},60000);if(!r.ok)throw new Error(r.error);o.innerHTML=scamHtml(r)}
  catch(e){o.innerHTML='<div class="why">Could not check this link right now. If it asks for money or OTP, treat it as unsafe.</div>'}
}
function scamOpen(pre){
  if(!tfOn()){toast('TinyFish is not connected');return}
  openSheet(`<div class="kick">🛡️ Safety check</div><h1 style="font-size:30px">Is this real?</h1><p class="sub">Paste the link of an internship, job or scholarship. TinyFish reads the page, checks the domain and searches for scam reports.</p>
  <input class="f" id="scamurl" type="url" inputmode="url" placeholder="https://..." value="${esc(pre||'')}"><div class="acts"><button class="btn" onclick="scamRun($('scamurl').value.trim(),'scamout')">Check this link</button></div><div id="scamout" style="margin-top:12px"></div>`);
  if(pre)scamRun(pre,'scamout');
}
const _vHome2=vHome;
vHome=function(){
  const s=_vHome2();if(!tfOn())return s;
  return s.replace('<h2>',`<div class="row" onclick="scamOpen()"><div class="e">🛡️</div><div class="t"><b>Is this real?</b><small>Paste any internship or job link. TinyFish checks it for scams</small></div></div><h2>`);
};
/* chat: a message with a link, or "is this real/scam", opens the checker */
const _send2=sendChat;
sendChat=async function(t){
  t=(t||'').trim();
  const m=t.match(/https?:\/\/\S+/i);
  if(tfOn()&&t&&!CH.busy&&(m||/\b(is this (real|fake|genuine|legit)|scam|fraud|fake)\b/i.test(t)&&/\b(link|job|internship|offer|site|website)\b/i.test(t))){
    CH.msgs.push({me:1,text:t});if($('cin'))$('cin').value='';
    if(!m){CH.msgs.push({me:0,text:'Paste the full link (starting with https://) and I will check it with TinyFish.'});renderChat();return}
    CH.busy=true;CH.msgs.push({typing:1});renderChat();
    let a;try{const r=await tfCall('/scam?url='+encodeURIComponent(m[0].replace(/[).,]+$/,'')),{},60000);
      a=r.ok?{text:`${SCAM_COL[r.level][1]} (risk ${r.risk}/100) for ${r.host}.\n`+r.reasons.map(x=>(x.good?'✅ ':'⚠️ ')+x.t).join('\n')+'\nThis is a quick check, not a guarantee.',rows:(r.reports||[]).map(x=>linkRow(x.title,x.site||tfHostOf(x.url),x.url))}:{text:'I could not check that link right now.'}}
    catch(e){a={text:'I could not check that link right now. If it asks for money or OTP, treat it as unsafe.'}}
    CH.msgs.pop();CH.msgs.push(Object.assign({me:0},a));CH.busy=false;renderChat();return;
  }
  return _send2(t);
};

/* ---------- 3) Professor page -> personal email (Fetch) ---------- */
let PROFX=null;
const _vRes2=vResearch;
vResearch=function(){
  let s=_vRes2();if(!tfOn())return s;
  const box=`<label class="l" for="rurl">Professor's page link (optional)</label><div style="display:flex;gap:8px"><input class="f" id="rurl" type="url" placeholder="https://www.iitd.ac.in/..." style="flex:1"><button class="btn ghost" type="button" onclick="profRead()">Read with TinyFish</button></div><div id="rinfo" style="margin:6px 0 4px"></div>`;
  return s.replace('<label class="l" for="r3">',box+'<label class="l" for="r3">');
};
async function profRead(){
  const u=($('rurl').value||'').trim(),o=$('rinfo');
  if(!/^https:\/\//i.test(u)){o.innerHTML='<div class="why">Paste a full https:// link of the professor page.</div>';return}
  o.innerHTML='<div class="tip">TinyFish is reading the page…</div>';
  try{const r=await tfCall('/prof?url='+encodeURIComponent(u),{},50000);if(!r.ok)throw 0;
    PROFX={papers:r.papers||[],pick:0};
    if(r.area&&$('r3')&&!$('r3').value.trim())$('r3').value=r.area;
    if(r.title&&$('r1')&&!$('r1').value.trim()){const nm=r.title.split(/[|–\-:]/)[0].trim();if(nm.length<50)$('r1').value=nm}
    o.innerHTML=`<div class="tip"><b>Found on the page</b>${r.area?`<div>Research area: ${esc(r.area)}</div>`:'<div>No research area line found. Type it yourself.</div>'}${r.papers.length?`<label class="l" for="rpaper">Mention one paper (read it first!)</label><select class="f" id="rpaper" onchange="PROFX.pick=+this.value;rmk()"><option value="-1">Do not mention a paper</option>${r.papers.map((p,i)=>`<option value="${i}">${esc(p.slice(0,90))}</option>`).join('')}</select>`:''}<div style="font-size:12px;opacity:.75;margin-top:4px">Check these lines are right. Only mention a paper you have really read.</div></div>`;
    if(r.papers.length){PROFX.pick=-1}
    rmk();
  }catch(e){o.innerHTML='<div class="why">Could not read that page. Fill the boxes by hand instead.</div>'}
}
const _rmk2=rmk;
rmk=function(){
  _rmk2();
  if(PROFX&&PROFX.pick>=0&&PROFX.papers[PROFX.pick]&&$('rb')){
    const p=PROFX.papers[PROFX.pick].replace(/"/g,"'").slice(0,140);
    $('rb').value=$('rb').value.replace('found it very interesting because','found it very interesting, especially "'+p+'", because');
    const sub=$('rb').value.split('\n\n').slice(1).join('\n\n');
    if($('rl'))$('rl').href='mailto:?subject='+encodeURIComponent(($('rb').value.split('\n')[0]||'').replace(/^Subject:\s*/,''))+'&body='+encodeURIComponent(sub);
  }
};

/* ---------- 4) Cited answers for study abroad (Research API) ---------- */
const ABQ=['What is the student visa process and cost?','Which scholarships can Indian students get?','Can I work part time while studying?','What are the living costs per month?'];
const ABC=sGet('sb_abq',{});
const _vAb2=vAbroad;
vAbroad=function(){
  const s=_vAb2();if(!tfOn())return s;
  const c=S.country||(ABROAD[0]&&ABROAD[0].k);
  const card=`<h2>Ask with sources</h2><div class="card solo"><div class="kick">TinyFish Research · ${esc(c)}</div>
  <div class="chips">${ABQ.map((q,i)=>`<button class="chip" onclick="abAsk(${i})">${esc(q)}</button>`).join('')}</div>
  <input class="f" id="abq" placeholder="Or type your own question about ${esc(c)}" style="margin-top:8px"><div class="acts"><button class="btn" onclick="abAsk(-1)">Get answer with sources</button></div><div id="about" style="margin-top:10px"></div></div>`;
  return s.replace('<h2>My document checklist</h2>',card+'<h2>My document checklist</h2>');
};
function abShow(r){
  return `<div class="tip"><div>${esc(r.answer).replace(/\n/g,'<br>')}</div><div style="margin-top:8px"><b>Sources</b><br>${r.citations&&r.citations.length?tfLinks(r.citations):'<small>No source links returned.</small>'}</div><div style="margin-top:8px;font-size:12px;opacity:.75">${r.fallback?'Quick web search result. ':''}Rules and costs change. Confirm on the official site.</div></div>`;
}
async function abAsk(i){
  const c=S.country,q=i>=0?ABQ[i]:($('abq').value||'').trim(),o=$('about');if(!q||!o)return;
  const key=c+'|'+q;if(ABC[key]){o.innerHTML=abShow(ABC[key]);return}
  const fin=r=>{if(!r.fallback){ABC[key]=r;sSet('sb_abq',ABC)}o.innerHTML=abShow(r)};
  o.innerHTML='<div class="tip">TinyFish Research is reading official sources… (up to 90 seconds)</div>';
  let id=null;
  try{const s=await tfPost('/research/start',{country:c,q},30000);if(s.ok)id=s.id}catch(e){}
  if(id){const t0=Date.now();
    while(Date.now()-t0<90000){await tfSl(5000);
      try{const r=await tfCall('/research/status?id='+encodeURIComponent(id),{},20000);
        if(r.ok&&r.state==='done'){fin({answer:r.answer,citations:r.citations});return}
        if(r.ok&&r.state==='failed')break}catch(e){}}
  }
  /* backup: free TinyFish Search so the student still gets sources */
  try{const L=await tfSearch('study in '+c+' '+q+' official');
    if(L.length){fin({fallback:1,answer:L.slice(0,3).map(x=>x.title+': '+x.snippet).join('\n\n'),citations:L.map(x=>x.url)});return}}catch(e){}
  o.innerHTML='<div class="why">Could not get an answer right now. Open the official links in the country guide above.</div>';
}
