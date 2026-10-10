/* TinyFish integration for Student Buddy (KCC Build with Bharat 4.0)
   1) "Check live" button inside a listing: TinyFish reads the official page and shows status, deadline and fee.
   2) Ask Buddy: when a question is not in the app's listings, it searches the live web with TinyFish.
   Your TinyFish key is NOT in this file. It lives inside the Cloudflare Worker (worker/worker.js).
   Paste your Worker URL below. Leave it empty to switch the TinyFish features off (the app works as before). */
const TF_API='https://student-buddy-tf.nikunjkapoor33.workers.dev';
const TF_KEY='sb_tf_v1';
let TF=sGet(TF_KEY,{});

/* re-use deadlines that were verified earlier, so the "Closing soon" tag still works */
Object.keys(TF).forEach(id=>{const v=TF[id];if(v&&v.deadline&&/^\d{4}-\d{2}-\d{2}$/.test(v.deadline))DEADLINES[id]=v.deadline});

async function tfCall(path,opt,ms){
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),ms||20000);
  try{const r=await fetch(TF_API.replace(/\/$/,'')+path,Object.assign({signal:ctl.signal},opt||{}));if(!r.ok)throw new Error('http '+r.status);return await r.json()}
  finally{clearTimeout(to)}
}

async function tfSearch(q){
  const r=await tfCall('/search?q='+encodeURIComponent(q+' India students'),{},20000);
  return r&&r.ok?(r.results||[]):[];
}

function tfBoxH(id){
  const v=TF[id];
  if(!v)return `<button class="btn ghost" onclick="tfVerify('${esc(id)}')">🔎 Check live with TinyFish</button>`;
  const when=new Date(v.at||Date.now()).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  const row=(l,x)=>x?`<div><b>${l}:</b> ${esc(x)}</div>`:'';
  const body=v.fallback
    ?(v.lines||[]).map(l=>`<div>• ${esc(l)}</div>`).join('')
    :row('Status',v.status)+row('Deadline',v.deadline_text||v.deadline)+row('Fee',v.fee)+row('Eligibility',v.eligibility)+row('Summary',v.summary);
  return `<div class="tip"><b>✅ Live check by TinyFish</b> · ${esc(when)}${body}<div style="margin-top:6px;font-size:12px;opacity:.8">From the official site. Always confirm on the official site before you apply.</div></div><button class="btn ghost" style="margin-top:8px" onclick="tfVerify('${esc(id)}')">Check again</button>`;
}

const tfSleep=ms=>new Promise(r=>setTimeout(r,ms));
async function tfVerify(id){
  const it=find(id);if(!it||!$('tfbox'))return;
  const say=h=>{const b=$('tfbox');if(b)b.innerHTML=h};
  const fail=()=>say('<div class="why">Could not check live right now. Please use the official site button below.</div><button class="btn ghost" style="margin-top:8px" onclick="tfVerify(\''+esc(id)+'\')">Try again</button>');
  const done=v=>{v.at=Date.now();TF[id]=v;sSet(TF_KEY,TF);if(v.deadline){DEADLINES[id]=v.deadline;render()}say(tfBoxH(id))};
  say('<div class="tip">TinyFish agent is opening the official page…</div>');
  let run=null;
  try{
    const s=await tfCall('/verify/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:it.link,name:it.n})},25000);
    if(s&&s.ok)run=s.run_id;
  }catch(e){}
  if(run){
    const t0=Date.now();
    while(Date.now()-t0<150000){
      await tfSleep(4000);
      try{
        const r=await tfCall('/verify/status?id='+encodeURIComponent(run),{},20000);
        if(r&&r.ok&&r.state==='done'){done(r.data);return}
        if(r&&r.ok&&r.state==='failed')break;
      }catch(e){}
      say('<div class="tip">TinyFish agent is reading the official page… '+Math.round((Date.now()-t0)/1000)+'s<br><small>This can take up to 2 minutes. Please wait.</small></div>');
    }
    try{tfCall('/verify/cancel?id='+encodeURIComponent(run),{method:'POST'},10000)}catch(e){}
  }
  /* backup: free TinyFish search on the official site */
  try{
    say('<div class="tip">Trying a quicker TinyFish search on the official site…</div>');
    const q=await tfCall('/verify/quick?url='+encodeURIComponent(it.link)+'&name='+encodeURIComponent(it.n),{},25000);
    if(q&&q.ok&&q.lines&&q.lines.length){done({fallback:true,lines:q.lines});return}
  }catch(e){}
  fail();
}

/* add the box inside the existing "How to apply" sheet, above the buttons. Nothing else in the layout changes. */
const _detailBase=detail;
detail=function(id){
  _detailBase(id);
  if(!TF_API)return;
  const it=find(id);if(!it||!it.link)return;
  const sb=$('sbox');if(!sb)return;
  const all=sb.querySelectorAll('.acts'),acts=all[all.length-1];if(!acts)return;
  const d=document.createElement('div');d.id='tfbox';d.style.margin='16px 0';d.innerHTML=tfBoxH(id);
  acts.parentNode.insertBefore(d,acts);
};
