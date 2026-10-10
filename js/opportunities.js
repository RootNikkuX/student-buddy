/* Reads scraped opportunities from the ingest backend (ingest/ folder) and adds them to the app.
   Paste the Worker link in OPP_API, e.g. 'https://student-buddy-ingest.YOURNAME.workers.dev'. Empty = off, the app works as before. */
const OPP_API='';
const OPP_CACHE='sb_opps_v1';
const OPP_EMO={hackathon:'🏆',internship:'💼',job:'🪖',competition:'🎯',workshop:'🛠️'};
const OPP_HOW=['Open the official page with the button below.','Check who can apply and the last date.','Apply before the deadline.'];
function oppAdd(o){
  const id='db_'+o.id,e=OPP_EMO[o.type]||'📌',when=o.deadline_text||(o.deadline?'Apply by '+o.deadline:'Check the page for dates');
  const tip=[o.eligibility&&'Who can apply: '+o.eligibility,o.pay&&(o.type==='hackathon'||o.type==='competition'?'Prize or fee: ':'Pay: ')+o.pay].filter(Boolean).join('. ');
  const years=['1','2','3','4','5','grad'];
  const drop=l=>{const i=l.findIndex(x=>x.id===id);if(i>=0)l.splice(i,1)};
  [EV,IN,JOBS].forEach(drop);
  if(o.type==='internship')IN.push({id,s:'private',e,n:o.title,o:o.org||'See listing',roles:o.description||o.title,loc:['all'],pay:o.pay||'Not stated',dur:'See listing',years,br:'any',link:o.source_url,how:OPP_HOW,note:o.eligibility||''});
  else if(o.type==='job')JOBS.push({id,s:'job',e,n:o.title,o:o.org||'See listing',roles:o.description||o.title,cats:['other'],how:OPP_HOW,loc:['all'],pay:o.pay||'',link:o.source_url,d:o.description||'',tip});
  else if(['hackathon','competition','workshop'].includes(o.type))EV.push({id,t:o.type==='hackathon'?'hackathon':o.type==='workshop'?'meetup':'fest',e,n:o.title,o:o.org||'See listing',when,mode:o.location||'',fee:o.pay&&o.type!=='hackathon'?o.pay:'',br:'any',years,link:o.source_url,d:o.description||'',tip});
  else return;
  if(o.deadline&&/^\d{4}-\d{2}-\d{2}$/.test(o.deadline))DEADLINES[id]=o.deadline;
}
async function loadOpps(){
  if(!OPP_API)return false;
  let items=null;
  try{
    const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),6000);
    const r=await fetch(OPP_API.replace(/\/$/,'')+'/api/opportunities?limit=200',{signal:ctl.signal});clearTimeout(to);
    const j=await r.json();if(!r.ok||!j.ok)throw 0;items=j.items;sSet(OPP_CACHE,items);
  }catch(e){items=sGet(OPP_CACHE,null)}
  if(!items||!items.length)return false;
  try{items.forEach(oppAdd);return true}catch(e){return false}
}
if(OPP_API)loadOpps().then(ok=>{if(ok)render()});
