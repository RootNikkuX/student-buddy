/* ================= new sections: jobs, sports, perks body, abroad extras, research, support ================= */
const LANGREQ={
USA:'TOEFL iBT 80 to 100 or IELTS 6.5 to 7.0. Some universities accept Duolingo (about 115+). Many masters also ask GRE.',
UK:'IELTS 6.0 to 7.0, often "IELTS for UKVI". PTE and TOEFL are also accepted by many.',
Canada:'IELTS 6.5 (about 6.0 in each part) is common. PTE and TOEFL are also accepted.',
Germany:'English programs: IELTS 6.5 or TOEFL 88+. German programs: TestDaF, DSH or Goethe at B2 or C1.',
Australia:'IELTS 6.5 (about 6.0 in each part) or PTE 58+. Some accept TOEFL 79+.',
Ireland:'IELTS 6.5 or PTE 62. Some universities accept Duolingo.',
Japan:'Japanese programs: JLPT N2 or N1. English programs: TOEFL or IELTS (check each university).'};
const fmtINR=v=>v>=1e7?(v/1e7).toFixed(2)+' crore':(v/1e5).toFixed(1)+' lakh';
const copyTxt=async t=>{try{await navigator.clipboard.writeText(t);toast('Copied')}catch(e){toast('Select and copy')}};

function perksBody(){
  const cats=['all',...new Set(PERKS.map(p=>p.c))],n=Object.values(CLAIM).filter(Boolean).length;
  const L=PERKS.filter(p=>(S.pCat==='all'||p.c===S.pCat)&&match(p));
  return `<div class="card solo" style="padding:16px"><b>${n} of ${PERKS.length} unlocked</b><div class="bar" style="margin-top:10px"><i style="width:${n/PERKS.length*100}%"></i></div></div>
  <div class="chips">${cats.map(c=>`<button class="chip${S.pCat===c?' on':''}" onclick="set('pCat','${c}')">${c==='all'?'All':c}</button>`).join('')}</div>${L.map(perkRow).join('')}`;
}
function ytRows(groups){
  return groups.map(g=>{const L=VIDEOS.filter(v=>v.g===g&&match(v));return L.length?`<h2>${esc(g)}</h2>`+L.map(v=>`<div class="row" style="cursor:default"><div class="e">${v.e}</div><div class="t"><b>${esc(v.n)}</b><small>${esc(v.d)}</small></div>${A(v.link,v.type==='channel'?'Channel':'Search','go')}</div>`).join(''):''}).join('');
}

/* ---- abroad: language exams ---- */
function langSec(c){
  return `<h2>Language exams for ${esc(c.k)}</h2>
  <div class="card solo"><b>${esc(LANGREQ[c.k]||c.exams)}</b><p class="sub" style="font-size:14px;margin:8px 0 0">These are typical scores. Your university can ask for more, so check its admission page. Scores last about 2 years, so book a test about 2 months before the deadline.</p></div>
  ${EXAMS.map(e=>`<details class="acc"><summary>${e.e} ${esc(e.k)} <small style="color:var(--muted);font-weight:500">${esc(e.kind)}</small></summary><div class="in"><p><b>Used for:</b> ${esc(e.use)}</p><p><b>Typical score:</b> ${esc(e.score)}</p><p><b>Fee:</b> ${esc(e.cost)}</p><p><b>Valid:</b> ${esc(e.valid)}</p><p>${esc(e.tip)}</p>${A(e.link,'Official site ↗')}</div></details>`).join('')}
  <div class="card solo"><b>English score comparison (approx.)</b><div style="overflow-x:auto"><table class="tbl"><tr><th>Level</th><th>IELTS</th><th>TOEFL</th><th>PTE</th><th>Duolingo</th></tr>${LEVELS.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div><p class="sub" style="font-size:13px;margin:8px 0 0">Fees and rules change. Confirm on the official site before you pay.</p></div>`;
}

/* ---- abroad: budget estimator ---- */
function budRes(k,o){
  o=o||{};const b=BUD[k],y=o.y||S.byears,sch=(o.sch!=null?o.sch:S.sch)/100,rate=o.rate||S.rate[k]||b.rate;
  const pick=(r,m)=>m==='low'?r[0]:m==='high'?r[1]:(r[0]+r[1])/2;
  const ov=o.once!=null?o.once:S.onceOv[k];
  const once=ov!=null?ov:pick(b.once,'mid');
  const tuition=pick(b.tu,o.tuL||S.tuL)*(1-sch)*y*rate,living=pick(b.liv,o.livL||S.livL)*y*rate;
  const lo=(b.tu[0]*(1-sch)+b.liv[0])*y*rate+(ov!=null?ov:b.once[0]);
  const hi=(b.tu[1]*(1-sch)+b.liv[1])*y*rate+(ov!=null?ov:b.once[1]);
  return {tuition,living,once,total:tuition+living+once,lo,hi,rate,cur:b.cur,y};
}
function bset(k,v){S[k]=v;render()}
function budgetSec(c){
  const b=BUD[c.k],r=budRes(c.k);
  const sg=(key,opts)=>`<div class="seg fill" style="margin:4px 0 12px">${opts.map(o=>`<button class="${S[key]===o[0]?'on':''}" onclick="bset('${key}','${o[0]}')">${o[1]}</button>`).join('')}</div>`;
  return `<h2>Rough budget for ${esc(c.k)}</h2>
  <div class="card solo bud"><div class="kick">${c.f} ${esc(c.k)} · ${S.byears} year${S.byears>1?'s':''}</div>
  <div class="big-n" style="font-size:56px;color:var(--yellow);line-height:1;margin:6px 0">₹ ${fmtINR(r.total)}</div>
  <p class="sub" style="margin:0 0 14px">Likely range: ₹ ${fmtINR(r.lo)} to ₹ ${fmtINR(r.hi)}. About ₹ ${fmtINR(r.total/r.y)} per year.</p>
  <label class="l">Years of study</label>
  <div class="acts" style="margin:4px 0 12px"><button class="ic th" aria-label="Fewer years" onclick="bset('byears',Math.max(1,S.byears-1))">−</button><b style="min-width:70px;text-align:center">${S.byears} year${S.byears>1?'s':''}</b><button class="ic th" aria-label="More years" onclick="bset('byears',Math.min(6,S.byears+1))">+</button></div>
  <label class="l">Tuition level</label>${sg('tuL',[['low','Low (public)'],['mid','Middle'],['high','High (top private)']])}
  <label class="l">Living style</label>${sg('livL',[['low','Budget'],['mid','Standard'],['high','Comfortable']])}
  <label class="l">Scholarship on tuition</label>
  <div class="chips" style="padding:4px 0 10px;margin:0;flex-wrap:wrap">${[[0,'None'],[25,'25%'],[50,'50%'],[100,'Full']].map(x=>`<button class="chip${S.sch===x[0]?' on':''}" onclick="bset('sch',${x[0]})">${x[1]}</button>`).join('')}</div>
  <div class="two-in"><div><label class="l" for="brate">1 ${b.cur} = ₹ (edit to today's rate)</label><input class="f edit" id="brate" type="number" step="0.01" min="0" value="${r.rate}" onchange="S.rate['${c.k}']=+this.value||BUD['${c.k}'].rate;render()"></div>
  <div><label class="l" for="bonce">One-time costs in ₹ (visa, flights, tests, applications)</label><input class="f edit" id="bonce" type="number" step="10000" min="0" value="${Math.round(r.once)}" onchange="S.onceOv['${c.k}']=+this.value;render()"></div></div>
  <table class="tbl"><tr><td>Tuition</td><td>₹ ${fmtINR(r.tuition)}</td></tr><tr><td>Living</td><td>₹ ${fmtINR(r.living)}</td></tr><tr><td>One-time costs</td><td>₹ ${fmtINR(r.once)}</td></tr><tr><th>Total</th><th>₹ ${fmtINR(r.total)}</th></tr></table>
  <p class="sub" style="font-size:13px;margin:10px 0 0">This is a rough guess to help you plan, not an offer. Tuition and living ranges come from the guide above. Exchange rates are assumed and change daily, so edit the yellow boxes. Health insurance and visa renewals can add more.</p></div>
  <h2>Ways to pay less</h2>
  ${PAYLESS.map(p=>`<details class="acc"><summary>${esc(p[0])}</summary><div class="in"><p>${esc(p[1])}</p>${p[2].map(l=>A(l[1],esc(l[0])+' ↗','go')).join(' ')}</div></details>`).join('')}`;
}

/* ---- research ---- */
const ASKS=[['research internship','a research internship or summer project'],['thesis guidance','guidance for my thesis'],['project guidance','guidance for my project'],['masters or PhD enquiry','masters or PhD research opportunities'],['question about your paper','a short question about your paper']];
function vResearch(){
  return `<h1>Research help</h1><p class="sub">Find a professor, write the email, plan your thesis.</p>
  <div class="card solo"><div class="kick">Email a professor</div>
  <label class="l" for="r1">Professor's name</label><input class="f" id="r1" placeholder="Dr. Sharma" oninput="rmk()">
  <label class="l" for="r2">University and department</label><input class="f" id="r2" placeholder="IIT Delhi, Computer Science" oninput="rmk()">
  <label class="l" for="r3">Their paper or research area you read</label><input class="f" id="r3" placeholder="phishing detection using machine learning" oninput="rmk()">
  <label class="l" for="r4">What do you want?</label><select class="f" id="r4" onchange="rmk()">${ASKS.map(a=>`<option value="${a[0]}">${a[0]}</option>`).join('')}</select>
  <label class="l" for="r5">Your project or skill (one line)</label><input class="f" id="r5" placeholder="I built a Python tool that scans emails for phishing links." oninput="rmk()">
  <label class="l" for="rb">Your email (edit freely)</label><textarea class="f" id="rb" rows="12"></textarea>
  <div class="acts"><button class="btn" onclick="copyTxt($('rb').value)">Copy email</button><a class="btn ghost" id="rl" href="#">Open in mail</a></div>
  <p class="sub" style="font-size:13px;margin:10px 0 0">Use the professor's official email from the university page. Never guess or buy email lists. Attach your CV and send from your college email.</p></div>
  <h2>How to find the right professor</h2>
  <details class="acc" open><summary>Step by step</summary><div class="in"><ol class="steps">${RES_STEPS.map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ol></div></details>
  <details class="acc"><summary>Where to find a professor's email</summary><div class="in"><ul>${RES_FIND.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div></details>
  <h2>Programs for research experience</h2>
  ${RES_PROGS.map(p=>`<div class="row" style="cursor:default"><div class="e">🔬</div><div class="t"><b>${esc(p[0])}</b><small>${esc(p[1])}</small></div>${A(p[2],'Open','go')}</div>`).join('')}
  <h2>Thesis help</h2>
  <details class="acc"><summary>Thesis outline (chapter by chapter)</summary><div class="in"><ol class="steps">${THESIS.map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ol><div class="acts"><button class="btn ghost" onclick="copyTxt(THESIS.map((t,i)=>(i+1)+'. '+t).join('\\n'))">Copy outline</button></div></div></details>
  <details class="acc"><summary>Tips from start to viva</summary><div class="in"><ul><li>Write a one-page plan first and show it to your guide.</li><li>Meet your guide every week, even for 10 minutes.</li><li>Save every paper in Zotero from day one.</li><li>Write a little every day instead of one big push.</li><li>Run your college plagiarism check before you submit.</li><li>Practise your viva by explaining the thesis to a friend in 5 minutes.</li></ul></div></details>
  <h2>Free tools</h2>
  ${RES_TOOLS.map(t=>`<div class="row" style="cursor:default"><div class="e">🧰</div><div class="t"><b>${esc(t[0])}</b><small>${esc(t[1])}</small></div>${A(t[2],'Open','go')}</div>`).join('')}
  ${ytRows(['Abroad and research'])}`;
}
function rmk(){
  const g=id=>($(id)&&$(id).value.trim())||'';
  if(!$('rb'))return;
  const prof=g('r1')||'[Name]',uni=g('r2')||'[University and department]',area=g('r3')||'[paper or topic]',proj=g('r5')||'[One line about your project or skill.]';
  const ask=$('r4').value,txt=(ASKS.find(a=>a[0]===ask)||ASKS[0])[1];
  const me=(P&&P.name)||'[Your name]',yr=P?yl(P.year):'[year]',br=P?P.branch:'[branch]';
  const salute=/^(dr|prof)/i.test(prof)?prof:'Professor '+prof;
  const subject=ask.charAt(0).toUpperCase()+ask.slice(1)+': '+area;
  const body=`Dear ${salute},\n\nMy name is ${me}, a ${yr} ${br} student. I read your work on ${area} (${uni}) and found it very interesting because [one real reason].\n\nI am writing to ask about ${txt}. ${proj}\n\nI have attached my CV. If you have an opening, or can suggest the next step, I would be grateful. I am happy to have a short call at your convenience.\n\nThank you for your time.\nRegards,\n${me}\n[Phone] · [LinkedIn] · [GitHub]`;
  $('rb').value='Subject: '+subject+'\n\n'+body;
  $('rl').href='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
function afterRender(){if(S.tab==='research')rmk();const sg=$('dseg'),on=sg&&sg.querySelector('button.on');if(sg&&on&&sg.scrollWidth>sg.clientWidth)sg.scrollLeft=on.offsetLeft-(sg.clientWidth-on.offsetWidth)/2}

/* ---- talk to someone ---- */
function vSupport(){
  return `<h1>Talk to someone</h1><p class="sub">Free and private options. You do not have to handle things alone.</p>
  <div class="hero"><span class="big-n">14416</span><p>Tele-MANAS: free support from trained counsellors, in many languages. You can also call 1800-891-4416.</p><a class="btn" href="tel:14416">Call now</a></div>
  <div class="acts" style="margin:14px 0 4px;max-width:520px"><button class="btn ghost" onclick="openChat('talk')">Chat with Buddy</button><a class="btn ghost" href="tel:112">Emergency 112</a></div>
  ${HELP.map(g=>`<h2>${esc(g.g)}</h2>`+g.items.map(i=>`<div class="row" style="cursor:default"><div class="e">${i.tel?'📞':i.link?'🔗':'💡'}</div><div class="t"><b>${esc(i.n)}</b><small>${esc(i.d)}</small>${i.show?`<small><b>${esc(i.show)}</b></small>`:''}</div>${i.tel?`<a class="go" href="tel:${esc(i.tel)}">Call</a>`:i.link?A(i.link,'Open','go'):''}</div>`).join('')).join('')}
  <p class="sub" style="font-size:13px;margin-top:22px">Buddy is a helper inside this app. It is not a counsellor or a doctor. Helpline numbers and timings can change, so check the official source if a call does not connect.</p>`;
}

/* ================= Ask Buddy (works from the listings inside this app) ================= */
const AI_ENDPOINT=''; /* optional: URL of your own server that calls a real AI model. Leave empty to use the built-in helper. */
const CH={msgs:[],busy:false};
const CSUG=['What can I apply to?','Army jobs for me','Cost to study in Germany','IELTS or TOEFL?','How to email a professor','I want to talk to someone'];
const COUNTRY_ALIAS={usa:'USA',america:'USA',uk:'UK',england:'UK',britain:'UK',canada:'Canada',germany:'Germany',jarman:'Germany',australia:'Australia',ireland:'Ireland',japan:'Japan'};
const STOP=new Set(['the','and','for','can','you','are','what','how','who','kya','hai','mujhe','mere','liye','ke','ki','ka','me','main','mein','kaise','kab','apply','about','tell','show','give','any','some','with','from','that','this','please','plz','tum','aap','bata','batao','does','get','near','best','want','need','find','list','which','where','when','have','has','will','all','cost','much','study','year','years']);
const rx=s=>new RegExp('\\b('+s+')');
const RX={
 crisis:rx('suicide|kill myself|end my life|want to die|self harm|self-harm|hurt myself|mar jaun|marna chahta|marna chahti|jeena nahi|jina nahi'),
 career:rx('career counsel|career guidance|career advice|confused about career|which career|what career'),
 support:rx('counsel|stress|stressed|anxiety|anxious|depress|sad|lonely|akela|akeli|tension|panic|overthink|talk to someone|need to talk|baat karni|upset|ragging|harass'),
 hi:rx('hi|hello|hey|namaste|hii+|good (morning|evening|afternoon)'),
 thanks:rx('thanks|thank you|shukriya|dhanyavad|thx'),
 who:rx('who are you|what are you|kaun ho|your name|are you ai|are you real|who made you'),
 exam:rx('ielts|toefl|pte|duolingo|gre|gmat|jlpt|testdaf|language test|english test|language exam'),
 budget:rx('budget|cost|kharcha|kharch|expense|how much|kitna|fees|fee|price'),
 abroad:rx('abroad|videsh|study in|masters in|ms in|visa|university in|usa|uk|canada|germany|australia|ireland|japan|america|england'),
 docs:rx('document|checklist|papers needed'),
 research:rx('research|professor|prof|thesis|dissertation|phd|supervisor|fellowship'),
 video:rx('youtube|video|channel|tutorial|lecture|playlist'),
 learn:rx('course|learn|certificate|certification|cert'),
 perk:rx('perk|discount|student id|free tool|github|offer'),
 intern:rx('intern'),
 job:rx('job|naukri|sarkari|govt|government|recruit|vacancy|defence|defense|bharti'),
 elig:rx('eligible|eligibility|qualify|can i apply|apply kar|mere liye|for me|kya main|can i join|am i')
};
const JCAT=[['army','army|fauj|agniveer|nda|soldier|military'],['navy','navy|naval'],['airforce','air force|airforce|afcat|iaf|vayu'],['police','police|constable|ssc gd|cisf|crpf|bsf|capf|sub inspector'],['civil','income tax|tax|ssc|cgl|upsc|ias|ips|irs|civil service']];
const ETYPE=[['hackathon','hackathon|hack'],['meetup','meetup|gdg|community'],['marathon','marathon|cyclothon|running|run|5k|10k'],['fest','fest|festival|techfest'],['sports','sport|sports|khel|khelo|football|cricket|badminton|athlete|tournament|fitness|gym']];
const REG=[['Delhi NCR','delhi|ncr|gurugram|gurgaon|noida|faridabad'],['Bengaluru','bengaluru|bangalore'],['Hyderabad','hyderabad'],['Mumbai','mumbai'],['Pune','pune'],['Chennai','chennai'],['Kolkata','kolkata'],['Ahmedabad','ahmedabad'],['Chandigarh','chandigarh'],['Jaipur','jaipur']];
const BRX=[['CSE','cse|computer science'],['IT','information technology'],['AI/ML','ai ?ml|ai/ml|machine learning'],['ECE','ece|electronics'],['EEE','eee|electrical'],['Mechanical','mech|mechanical'],['Civil','civil engineering'],['Biotech','biotech'],['Commerce / BBA','commerce|bba|bcom'],['Arts / Humanities','arts|humanities']];

function qProfile(q){
  const o={};let m=q.match(/\b([1-5])(?:st|nd|rd|th)?\s*(?:year|yr)\b/);
  if(m)o.year=m[1];else{const w={first:'1',second:'2',third:'3',fourth:'4'};m=q.match(/\b(first|second|third|fourth)\s*year\b/);if(m)o.year=w[m[1]]}
  if(/\b(graduate|graduated|passed out)\b/.test(q))o.year='grad';
  for(const [b,r] of BRX)if(rx(r).test(q)){o.branch=b;break}
  m=q.match(/\b(\d{2})\s*(?:years?|yrs?|saal|sal)\b/);if(m&&+m[1]>=13&&+m[1]<=40)o.age=+m[1];
  if(/\b(female|girl|woman|ladki|mahila)\b/.test(q))o.gender='female';else if(/\b(male|boy|man|ladka)\b/.test(q))o.gender='male';
  for(const [r,s] of REG)if(rx(s).test(q)){o.region=r;break}
  return o;
}
const asP=o=>Object.assign({age:20,gender:'other',year:'2',branch:'CSE',region:'Delhi NCR'},P||{},o||{});
function chk(it,pp){const old=P;P=pp;let r;try{r=check(it)}finally{P=old}return r}
const kw=q=>q.split(/[^a-z0-9]+/).filter(w=>w.length>2&&!STOP.has(w));
function pillTxt(c){return c.st==='ok'?'✓ You can apply':c.st==='no'?'Not eligible: '+c.why.join(', '):''}
function itemRow(it,c){return {id:it.id,t:it.n,s:it.o||'',pill:c&&c.st!=='q'?`<span class="pill ${c.st}">${esc(pillTxt(c))}</span>`:''}}
function linkRow(n,d,l){return {t:n,s:d,href:l}}

function search(q,o,pp){
  const jc=JCAT.find(([k,r])=>rx(r).test(q)),et=ETYPE.find(([k,r])=>rx(r).test(q));
  const wantJob=RX.job.test(q)||!!jc,wantIn=RX.intern.test(q);
  let pool=et?EV.filter(e=>e.t===et[0]):(wantJob?JOBS.filter(j=>!jc||j.cats.includes(jc[0])):(wantIn?IN:[...EV,...IN,...JOBS]));
  if(/\bfree\b/.test(q))pool=pool.filter(i=>/free/i.test((i.fee||'')+(i.pay||'')));
  if(/\bremote\b|work from home|online/.test(q))pool=pool.filter(i=>i.remote||/online/i.test(i.mode||''));
  if(o.region&&wantIn)pool=pool.filter(i=>!i.loc||i.loc.includes('all')||i.remote||i.loc.includes(o.region));
  const skip=/hackathon|internship|intern|job|jobs|govt|government|sports|sport|army|navy|police|eligible|free|paid|remote|delhi|ncr|cse|ece|eee|mechanical|civil|fest|marathon|meetup|navy|force|air/;
  const words=kw(q).filter(w=>!skip.test(w));
  let L=pool.map(it=>{const txt=((it.n||'')+' '+(it.o||'')+' '+(it.d||it.roles||'')+' '+(it.tip||'')).toLowerCase();return {it,c:chk(it,pp),sc:words.reduce((a,w)=>a+(txt.includes(w)?1:0),0)}});
  if(words.length&&!et&&!jc&&!wantJob&&!wantIn)L=L.filter(x=>x.sc>0);
  if(RX.elig.test(q))L=L.filter(x=>x.c.st==='ok');
  L.sort((a,b)=>(rank[a.c.st]-rank[b.c.st])||(b.sc-a.sc));
  return L;
}
function profLine(o){
  const b=[];if(o.year)b.push(yl(o.year));if(o.branch)b.push(o.branch);if(o.age)b.push(o.age+' years');if(o.gender)b.push(o.gender);if(o.region)b.push(o.region);
  return b.length?'Checked for: '+b.join(', ')+'. ':'';
}

function answer(raw){
  const q=' '+raw.toLowerCase().replace(/["“”]/g,'').replace(/[?!.,]/g,' ').replace(/\s+/g,' ').trim()+' ';
  const o=qProfile(q),pp=asP(o);
  const ct=Object.keys(COUNTRY_ALIAS).find(k=>new RegExp('\\b'+k+'\\b').test(q));
  const cname=ct?COUNTRY_ALIAS[ct]:null,cinfo=cname?ABROAD.find(a=>a.k===cname):null;
  if(RX.crisis.test(q))return {safe:1,text:'I am really sorry you are going through this. You do not have to carry it alone. Please talk to a trained counsellor right now. It is free and private. If you are in danger, call 112 or go to someone near you.',calls:[['Tele-MANAS 14416','14416'],['KIRAN 1800-599-0019','18005990019'],['Emergency 112','112']],btns:[['More support',"closeChat();go('support')"]],chips:[]};
  if(RX.career.test(q))return {text:'It is normal to feel confused about career. A free career counsellor can help you compare options. You can also ask your college placement cell.',links:[['National Career Service','https://www.ncs.gov.in'],['ADPList mentors','https://adplist.org']],btns:[['Open support page',"closeChat();go('support')"]],chips:['Govt jobs I can apply to','Internships for me']};
  if(RX.support.test(q))return {safe:1,text:'It is okay to ask for help. These are free and private, and a trained counsellor can just listen. If it feels urgent, call 112.',calls:[['Tele-MANAS 14416','14416'],['KIRAN 1800-599-0019','18005990019'],['iCall 9152987821','9152987821']],btns:[['Open support page',"closeChat();go('support')"]],chips:['Career guidance']};
  if(RX.who.test(q))return {text:'I am Buddy, the helper inside Student Buddy. I search the listings in this app: events, internships, govt jobs, sports, study abroad, language exams, budget, research and support. '+(typeof TF_API!=='undefined'&&TF_API?'If something is not in my listings I can search the live web with TinyFish. ':'I do not browse the internet. ')+'Always check the official link before you apply.',chips:CSUG};
  if(RX.thanks.test(q))return {text:'Anytime! Ask me anything else.',chips:CSUG.slice(0,3)};
  if(RX.hi.test(q)&&q.trim().split(' ').length<=3)return {text:'Hi! What do you want to find? I can check events, internships, govt jobs, sports, studying abroad, exams, budget and research help.',chips:CSUG};
  if(RX.exam.test(q)){
    const ex=EXAMS.find(e=>q.includes(e.k.toLowerCase().split(' ')[0]))||(/testdaf|german/.test(q)?EXAMS.find(e=>e.k==='German tests'):null);
    if(/ielts/.test(q)&&/toefl/.test(q))return {text:'IELTS is accepted almost everywhere (UK, Canada, Australia, Ireland) and has a speaking test with a person. TOEFL is mostly for the USA and is fully on a computer. Both cost about ₹18,000 and last 2 years. PTE gives results in a few days. Duolingo is cheapest but not accepted everywhere. Check your university list first.',chips:['PTE details','Duolingo details','Cost to study in the USA']};
    if(ex)return {text:`${ex.k}: ${ex.use}. Typical score: ${ex.score}. Fee: ${ex.cost}. Valid: ${ex.valid}. ${ex.tip}`,links:[['Official site',ex.link]],btns:[['All exams',"closeChat();go('abroad')"]],chips:['IELTS or TOEFL?']};
    return {text:cinfo?`For ${cinfo.k}: ${LANGREQ[cinfo.k]}`:'IELTS, TOEFL, PTE and Duolingo are the common English tests. Most universities want about IELTS 6.5 or TOEFL 80 to 100. Scores last 2 years. Tell me a country for exact tips.',btns:[['Open exam guide',`closeChat();go('abroad'${cinfo?",{country:'"+cinfo.k+"'}":''})`]],chips:['IELTS or TOEFL?','Cost to study in Canada']};
  }
  if(RX.budget.test(q)&&(cname||RX.abroad.test(q))){
    if(!cname)return {text:'Which country? I can estimate USA, UK, Canada, Germany, Australia, Ireland or Japan.',chips:['Cost to study in USA','Cost to study in Germany','Cost to study in Canada','Cost to study in UK']};
    const ym=q.match(/\b([1-6])\s*(?:years?|yrs?|saal)\b/),y=ym?+ym[1]:2,r=budRes(cname,{y,tuL:'mid',livL:'mid',sch:0,once:S.onceOv[cname]});
    return {text:`Rough cost for ${y} year${y>1?'s':''} in ${cname}: about ₹${fmtINR(r.total)}. Likely range: ₹${fmtINR(r.lo)} to ₹${fmtINR(r.hi)}. This includes tuition, living and one-time costs (visa, flights, tests, applications). It is a rough guess, and fees and exchange rates change.`,btns:[['Open budget estimator',`closeChat();go('abroad',{country:'${cname}',byears:${y}})`]],chips:['Language exams for '+cname,'Documents for '+cname]};
  }
  if(cinfo&&RX.docs.test(q))return {text:`Documents for ${cinfo.k}: `+cinfo.docs.join('; ')+'.',btns:[['Open full checklist',`closeChat();go('abroad',{country:'${cinfo.k}'})`]],chips:['Cost to study in '+cinfo.k]};
  if(cinfo||(RX.abroad.test(q)&&!RX.job.test(q))){
    if(!cinfo)return {text:'I have guides for the USA, UK, Canada, Germany, Australia, Ireland and Japan: costs, visa, documents, exams and living tips. Pick a country.',chips:ABROAD.map(a=>a.k)};
    return {text:`${cinfo.k}: ${cinfo.tag}. Tuition ${cinfo.tuition}. Living ${cinfo.living}. Visa: ${cinfo.visa}. Tests: ${cinfo.exams}. Work: ${cinfo.work}`,btns:[['Open '+cinfo.k+' guide',`closeChat();go('abroad',{country:'${cinfo.k}'})`]],chips:['Cost to study in '+cinfo.k,'Language exams for '+cinfo.k,'Documents for '+cinfo.k]};
  }
  if(RX.research.test(q)){
    if(/thesis|dissertation/.test(q))return {text:'A simple thesis outline: '+THESIS.map((t,i)=>(i+1)+') '+t).join('. ')+'. Meet your guide every week and save papers in Zotero.',btns:[['Open thesis help',"closeChat();go('research')"]],chips:['How to email a professor']};
    if(/fellowship|internship|summer/.test(q))return {text:'Research programs: '+RES_PROGS.map(p=>p[0]).join('; ')+'. The IAS-INSA-NASI summer fellowship usually opens in October to November, so check it now.',btns:[['See programs',"closeChat();go('research')"]],chips:['How to email a professor']};
    return {text:'Keep your email under 150 words: who you are, one real thing you read in their paper, what you can do, and your CV attached. Use the official email from the university page and follow up once after 7 to 10 days.',btns:[['Write the email',"closeChat();go('research')"]],links:[['Google Scholar','https://scholar.google.com']],chips:['Thesis outline','Research fellowships']};
  }
  if(RX.video.test(q)){
    const w=kw(q).filter(x=>!/youtube|video|videos|channel|channels|tutorial|lecture|playlist/.test(x));
    let L=VIDEOS.filter(v=>w.some(x=>(v.n+' '+v.d+' '+v.g).toLowerCase().includes(x)));if(!L.length)L=VIDEOS.slice(0,5);
    return {text:'Here are some YouTube channels and searches to learn from.',rows:L.slice(0,5).map(v=>linkRow(v.n,v.d,v.link)),chips:['Cybersecurity videos','Hindi coding channels']};
  }
  if(RX.perk.test(q)&&!RX.job.test(q)){
    const w=kw(q).filter(x=>!/perk|perks|discount|student|free|tool|offer/.test(x));
    let L=PERKS.filter(p=>w.some(x=>(p.n+' '+p.d+' '+p.c).toLowerCase().includes(x)));if(!L.length)L=PERKS.slice(0,5);
    return {text:'Student perks you can use with your student ID or college email.',rows:L.slice(0,5).map(p=>linkRow(p.n,p.d,p.link)),chips:['Free dev tools']};
  }
  if(RX.learn.test(q)&&!RX.job.test(q)&&!RX.intern.test(q)){
    const w=kw(q).filter(x=>!/course|courses|learn|certificate|certification|free/.test(x));
    const all=[...COURSES.free,...COURSES.paid,...CERTS];let L=all.filter(c=>w.some(x=>(c.n+' '+(c.d||c.req||'')).toLowerCase().includes(x)));if(!L.length)L=COURSES.free.slice(0,5);
    return {text:'Courses and certificates to start with.',rows:L.slice(0,5).map(c=>linkRow(c.n,c.o+(c.d?' · '+c.d:''),c.link)),chips:['Cybersecurity videos']};
  }
  const L=search(q,o,pp);
  const isListing=RX.job.test(q)||RX.intern.test(q)||RX.elig.test(q)||ETYPE.some(([k,r])=>rx(r).test(q))||JCAT.some(([k,r])=>rx(r).test(q))||kw(q).length>0;
  if(isListing&&L.length){
    const top=L.slice(0,4);
    const hint=!P&&!Object.keys(o).length?' Set up your profile and I will check eligibility for you.':'';
    return {text:`${profLine(o)}I found ${L.length} match${L.length>1?'es':''}. Top ${top.length}:${hint}`,rows:top.map(x=>itemRow(x.it,x.c)),btns:!P?[['Set up my profile','closeChat();startOB()']]:[['See all in Discover',"closeChat();go('discover',{disc:'events'})"]],chips:['Army jobs for me','Sports near me','Internships for 2nd year CSE']};
  }
  if(isListing&&!L.length&&RX.elig.test(q))return {text:`${profLine(o)}I could not find anything you can apply to for that. Try another type or year.`,chips:CSUG};
  return {miss:1,text:'I could not find that in my listings. I can help with events, internships, govt jobs, sports, studying abroad, language exams, budget, research help and support. Try one of these:',chips:CSUG};
}

async function viaAI(q,a){
  if(!AI_ENDPOINT)return null;
  try{const r=await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,profile:P,context:a.text})});const j=await r.json();return j.reply||null}catch(e){return null}
}
function rowH(r){return `<div class="mini"><div class="mt"><b>${esc(r.t)}</b><small>${esc(r.s)}</small>${r.pill||''}</div>${r.href?A(r.href,'Open','go'):`<button class="go" onclick="detail('${esc(r.id)}')">View</button>`}</div>`}
function msgH(m){
  if(m.typing)return '<div class="b a typing"><i></i><i></i><i></i></div>';
  if(m.me)return `<div class="b u">${esc(m.text)}</div>`;
  const cb=(m.calls||[]).map(c=>`<a class="cbtn" href="tel:${esc(c[1])}">📞 ${esc(c[0])}</a>`).concat((m.links||[]).map(l=>`<a class="cbtn" href="${esc(l[1])}" target="_blank" rel="noopener noreferrer">${esc(l[0])} ↗</a>`)).concat((m.btns||[]).map(b=>`<button class="cbtn" onclick="${esc(b[1])}">${esc(b[0])}</button>`));
  return `<div class="b a">${esc(m.text).replace(/\n/g,'<br>')}${(m.rows||[]).map(rowH).join('')}${cb.length?`<div class="cbs">${cb.join('')}</div>`:''}</div>`;
}
function renderChat(){
  const box=$('cms');if(!box)return;
  box.innerHTML=CH.msgs.map(msgH).join('');box.scrollTop=box.scrollHeight;
  const last=[...CH.msgs].reverse().find(m=>!m.me&&!m.typing);
  const ch=(last&&last.chips)||CSUG;
  $('cch').innerHTML=ch.map(c=>`<button class="chip" data-t="${esc(c)}" onclick="sendChat(this.dataset.t)">${esc(c)}</button>`).join('');
}
function openChat(mode){
  $('chat').classList.add('on');document.body.classList.add('chatopen');
  if(!CH.msgs.length)CH.msgs.push({me:0,text:`Hi${P&&P.name?' '+P.name.split(' ')[0]:''}! I am Buddy. I search the listings in this app: events, internships, govt jobs, sports, study abroad, exams, budget, research help and support. What do you need?`,chips:CSUG});
  renderChat();
  if(mode==='talk')sendChat('I want to talk to someone');
  else setTimeout(()=>{const i=$('cin');if(i)i.focus()},80);
}
function closeChat(){$('chat').classList.remove('on');document.body.classList.remove('chatopen')}
async function sendChat(t){
  t=(t||'').trim();if(!t||CH.busy)return;
  CH.msgs.push({me:1,text:t});if($('cin'))$('cin').value='';
  CH.busy=true;CH.msgs.push({typing:1});renderChat();
  let a;try{a=answer(t)}catch(e){a={text:'Sorry, something went wrong. Please try another question.',chips:CSUG}}
  let ai=null;if(AI_ENDPOINT&&!a.safe)ai=await viaAI(t,a);
  if(a.miss&&!ai&&typeof tfSearch==='function'&&TF_API){try{const L=await tfSearch(t);if(L.length)a={text:'This is not in my listings, so I searched the live web with TinyFish. Please check the official site before you apply.',rows:L.slice(0,4).map(x=>linkRow(x.title,x.snippet,x.url)),chips:CSUG}}catch(e){}}
  if(!ai)await new Promise(r=>setTimeout(r,350));
  CH.msgs.pop();if(ai)a.text=ai;CH.msgs.push(Object.assign({me:0},a));CH.busy=false;renderChat();
}
function sendForm(e){e.preventDefault();sendChat($('cin').value);return false}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('chat').classList.contains('on')&&!$('sheet').classList.contains('on'))closeChat()});
