/* Google Sheet loader.
   Paste your published CSV link in SHEET_URL. Leave it empty to use only the built-in data.
   Sheet rows ADD new listings or OVERRIDE a built-in listing that has the same id.
   If the sheet cannot load (no internet, wrong link), the app keeps working with the last saved copy or the built-in data. */
const SHEET_URL='';
const SHEET_CACHE='sb_sheet_v1';

function parseCSV(t){
  const rows=[];let r=[],f='',q=false;
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;
    else if(c===','){r.push(f);f=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;r.push(f);f='';if(r.some(x=>x.trim()!==''))rows.push(r);r=[]}
    else f+=c}
  r.push(f);if(r.some(x=>x.trim()!==''))rows.push(r);
  const h=(rows.shift()||[]).map(x=>x.trim());
  return rows.map(a=>{const o={};h.forEach((k,i)=>{if(k)o[k]=(a[i]||'').trim()});return o});
}

function rowToItem(o){
  const it={id:o.id};
  const s=k=>{if(o[k]!=='' && o[k]!==undefined)return o[k]};
  const set=(k,v)=>{if(v!==undefined)it[k]=v};
  set('t',s('type'));set('e',s('emoji'));set('n',s('name'));set('o',s('org'));
  set('when',s('when'));set('mode',s('mode'));set('fee',s('fee'));
  set('d',s('about'));set('tip',s('tip'));set('link',s('link'));set('br',s('branch'));
  set('pay',s('pay'));set('roles',s('roles'));set('dur',s('duration'));set('note',s('note'));
  if(s('min_age')!==undefined&&!isNaN(+o.min_age))it.minAge=+o.min_age;
  if(s('max_age')!==undefined&&!isNaN(+o.max_age))it.maxAge=+o.max_age;
  if(s('years')!==undefined)it.years=o.years.split(/[;,|]/).map(x=>x.trim()).filter(Boolean);
  if(s('how')!==undefined)it.how=o.how.split('|').map(x=>x.trim()).filter(Boolean);
  if(s('job_type')!==undefined)it.cats=o.job_type.split(/[;,|]/).map(x=>x.trim().toLowerCase()).filter(Boolean);
  return it;
}

function applySheet(rows){
  if(!Array.isArray(rows))return;
  rows.forEach(o=>{
    if(!o.id)return;
    const hide=/^(yes|true|1|hide)$/i.test(o.hide||'');
    const isJob=(o.type||'').toLowerCase()==='job'||JOBS.some(j=>j.id===o.id);
    const list=isJob?JOBS:EV;
    const i=list.findIndex(x=>x.id===o.id);
    if(hide){if(i>=0)list.splice(i,1);return}
    const it=rowToItem(o);
    if(isJob){it.s='job';delete it.t;if(!it.loc)it.loc=['all']}
    if(i>=0){Object.assign(list[i],it)}
    else{ if(!it.n)return; if(!isJob){it.t=it.t||'hackathon';it.br=it.br||'any';it.years=it.years||['1','2','3','4','5','grad']} else {it.cats=it.cats||['other'];it.how=it.how||[]} list.push(it)}
    if(o.deadline&&/^\d{4}-\d{2}-\d{2}$/.test(o.deadline))DEADLINES[o.id]=o.deadline;
    else if(o.deadline==='-'&&DEADLINES[o.id])delete DEADLINES[o.id];
  });
}

async function loadSheet(){
  if(!SHEET_URL)return false;
  let rows=null;
  try{
    const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),5000);
    const r=await fetch(SHEET_URL,{signal:ctl.signal,cache:'no-store'});clearTimeout(to);
    if(!r.ok)throw 0;
    rows=parseCSV(await r.text());
    if(rows.length)sSet(SHEET_CACHE,rows);
  }catch(e){rows=sGet(SHEET_CACHE,null)}
  if(rows&&rows.length){try{applySheet(rows);return true}catch(e){}}
  return false;
}
