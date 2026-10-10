/* Student Buddy -> TinyFish proxy (Cloudflare Worker)
   Why this exists: your TinyFish API key must stay SECRET. If you put it in the website's JS,
   anyone can steal it. So the website talks to this Worker, and only the Worker knows the key.

   Setup: Cloudflare dashboard > Workers & Pages > Create > Hello World > Edit code > paste this file > Deploy.
   Then Settings > Variables and Secrets > add a SECRET named TINYFISH_API_KEY (your key).
   Optional: add a plain variable ALLOWED_ORIGIN (example https://yourname.github.io) to accept calls only from your site.

   Routes:
     GET  /search?q=...                 -> TinyFish Search API (free)  -> top web results
     POST /verify/start {url,name}      -> starts a TinyFish Agent run (run-async) and returns its run_id
     GET  /verify/status?id=RUN_ID      -> running / done (with deadline, fee, status) / failed
     POST /verify/cancel?id=RUN_ID      -> stops a run (saves credits)
     GET  /verify/quick?url=..&name=..  -> free backup: TinyFish Search restricted to the official site
*/
const SEARCH_URL = 'https://api.search.tinyfish.ai';
const FETCH_URL = 'https://api.fetch.tinyfish.ai';
const AGENT_URL = 'https://agent.tinyfish.ai/v1/automation/run-async';
const RUNS_URL = 'https://agent.tinyfish.ai/v1/runs/';

function cors(env, req) {
  const allow = env.ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}
function json(obj, status, h) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, h) });
}

/* Turn whatever the agent returns into a small clean object (or null) */
export function parseAgent(j) {
  if (!j || j.error || /FAIL|ERROR|CANCEL/i.test(String(j.status || ''))) return null;
  let d = j.result !== undefined ? j.result : j;
  if (d && typeof d === 'object' && d.result !== undefined && Object.keys(d).length === 1) d = d.result;
  if (typeof d === 'string') {
    const m = d.match(/\{[\s\S]*\}/);
    if (m) { try { d = JSON.parse(m[0]); } catch (e) {} }
  }
  if (!d || typeof d !== 'object') return null;
  if (d.status === 'failure' && (d.reason || d.error)) return null;
  const s = v => (v === null || v === undefined || v === '' || /^(null|n\/a|na|none|not found|unknown)$/i.test(String(v).trim())) ? null : String(v).slice(0, 300);
  const dl = s(d.deadline);
  const iso = dl && /^\d{4}-\d{2}-\d{2}$/.test(dl);
  const out = {
    status: s(d.status),
    deadline: iso ? dl : null,
    deadline_text: s(d.deadline_text) || (dl && !iso ? dl : null),
    fee: s(d.fee),
    eligibility: s(d.eligibility),
    summary: s(d.summary)
  };
  return Object.values(out).some(Boolean) ? out : null;
}

/* Pick the lines of a page that talk about dates, fees, registration */
export function keyLines(text) {
  const re = /(deadline|last date|closing|closes|apply (by|before)|registration|register|opens|fee|₹|rs\.?\s?\d|free of cost)/i;
  const hasNum = /(\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
  return String(text || '').split(/\n+/).map(l => l.replace(/[#*_`>|]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 6 && l.length < 260 && re.test(l) && hasNum.test(l)).slice(0, 5);
}

const GOAL = name =>
  `You are on the official page for "${name}". Read the page (do not log in, do not submit any form). ` +
  `Find the CURRENT application or registration details. Return ONLY JSON like: ` +
  `{"status":"open|closed|upcoming|unknown","deadline":"YYYY-MM-DD or null","deadline_text":"deadline as written on the page or null",` +
  `"fee":"fee as written or null","eligibility":"age/year/branch rule in one short line or null","summary":"max 25 words"}. ` +
  `If something is not on the page use null. Do not guess.`;
const validId = id => /^[A-Za-z0-9_-]{6,100}$/.test(String(id || ''));

async function verifyStart(body, env) {
  const url = String(body.url || ''), name = String(body.name || 'this opportunity').slice(0, 120);
  if (!/^https:\/\/[^\s]{3,480}$/.test(url)) return { ok: false, error: 'bad_url' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  try {
    const r = await fetch(AGENT_URL, {
      method: 'POST',
      headers: { 'X-API-Key': env.TINYFISH_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, goal: GOAL(name) }),
      signal: AbortSignal.timeout(20000)
    });
    const txt = await r.text();
    if (!r.ok) return { ok: false, error: 'agent_http_' + r.status, why: txt.slice(0, 200) };
    let j = {}; try { j = JSON.parse(txt); } catch (e) {}
    const id = j.run_id || j.id || j.runId;
    if (!validId(id)) return { ok: false, error: 'no_run_id', why: txt.slice(0, 200) };
    return { ok: true, run_id: id };
  } catch (e) { return { ok: false, error: 'agent_start_' + (e && e.name || 'error') }; }
}

async function verifyStatus(id, env) {
  if (!validId(id)) return { ok: false, error: 'bad_id' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  try {
    const r = await fetch(RUNS_URL + id, { headers: { 'X-API-Key': env.TINYFISH_API_KEY }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) return { ok: false, error: 'status_http_' + r.status };
    const j = await r.json();
    const st = String(j.status || '').toUpperCase();
    if (st === 'COMPLETED') {
      const data = parseAgent(j);
      return data ? { ok: true, state: 'done', data } : { ok: true, state: 'failed', why: 'agent finished but found no details' };
    }
    if (st === 'FAILED' || st === 'CANCELLED') return { ok: true, state: 'failed', why: String((j.error && (j.error.message || j.error)) || st).slice(0, 200) };
    return { ok: true, state: 'running' };
  } catch (e) { return { ok: false, error: 'status_' + (e && e.name || 'error') }; }
}

async function verifyCancel(id, env) {
  if (!validId(id) || !env.TINYFISH_API_KEY) return { ok: false };
  try { await fetch(RUNS_URL + id + '/cancel', { method: 'POST', headers: { 'X-API-Key': env.TINYFISH_API_KEY }, signal: AbortSignal.timeout(10000) }); } catch (e) {}
  return { ok: true };
}

/* Free backup: TinyFish Search limited to the official site, keep the snippets that mention dates or fees */
async function quick(url, name, env) {
  let host = '';
  try { host = new URL(String(url)).hostname; } catch (e) { return { ok: false, error: 'bad_url' }; }
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  name = String(name || '').slice(0, 120);
  const run = async q => {
    const r = await fetch(SEARCH_URL + '?query=' + encodeURIComponent(q), { headers: { 'X-API-Key': env.TINYFISH_API_KEY }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) return [];
    return ((await r.json()).results || []);
  };
  try {
    let res = await run(`site:${host} ${name} registration deadline last date fee`);
    if (!res.length) res = await run(`${name} ${host} registration deadline last date`);
    const re = /(deadline|last date|closing|closes|apply (by|before)|registration|opens|fee|₹|rs\.?\s?\d|free)/i;
    const hasNum = /(\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
    let lines = res.filter(x => x.snippet && re.test(x.snippet) && hasNum.test(x.snippet))
      .map(x => (x.snippet.replace(/\s+/g, ' ').slice(0, 220) + ' (' + (x.site_name || host) + ')'));
    lines = lines.slice(0, 4);
    return lines.length ? { ok: true, lines } : { ok: false, error: 'nothing_found' };
  } catch (e) { return { ok: false, error: 'quick_' + (e && e.name || 'error') }; }
}

async function search(q, env) {
  q = String(q || '').trim().slice(0, 200);
  if (!q) return { ok: false, error: 'empty' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  try {
    const r = await fetch(SEARCH_URL + '?query=' + encodeURIComponent(q), {
      headers: { 'X-API-Key': env.TINYFISH_API_KEY },
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) return { ok: false, error: 'search_' + r.status };
    const j = await r.json();
    const results = (j.results || []).slice(0, 5).map(x => ({
      title: String(x.title || '').slice(0, 120),
      snippet: String(x.snippet || '').slice(0, 160),
      url: x.url, site: x.site_name || ''
    })).filter(x => /^https?:\/\//.test(x.url || ''));
    return { ok: true, results };
  } catch (e) { return { ok: false, error: 'search_failed' }; }
}


/* ===================== v2 features ===================== */
const MON_URL = 'https://agent.tinyfish.ai/v1/monitors';
const RES_START = 'https://agent.tinyfish.ai/v1/automation/run-research-async';
const RES_GET = 'https://agent.tinyfish.ai/v1/research-run/';
const okUrl = u => /^https:\/\/[^\s]{3,480}$/.test(String(u || ''));
const hdr = env => ({ 'X-API-Key': env.TINYFISH_API_KEY, 'Content-Type': 'application/json' });
const plain = s => String(s || '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_`>|]/g, ' ').replace(/\s+/g, ' ').trim();

/* 1) Alert me = TinyFish Monitor (page monitor, runs every day at 9:00 IST) */
async function monCreate(b, env) {
  const url = String(b.url || ''), name = String(b.name || 'Student Buddy alert').slice(0, 90);
  if (!okUrl(url)) return { ok: false, error: 'bad_url' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  try {
    const r = await fetch(MON_URL, { method: 'POST', headers: hdr(env), signal: AbortSignal.timeout(25000), body: JSON.stringify({
      type: 'fetch', name: 'SB: ' + name, config: { url, format: 'markdown' },
      schedule_cron: 'CRON_TZ=Asia/Kolkata 0 9 * * *',
      purpose: 'A new notice, last date, registration status or fee change for ' + name }) });
    const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch (e) {}
    if (!r.ok) return { ok: false, error: 'monitor_http_' + r.status, why: t.slice(0, 200) };
    const id = j.monitor && j.monitor.id;
    if (!validId(id)) return { ok: false, error: 'no_monitor_id' };
    return { ok: true, id };
  } catch (e) { return { ok: false, error: 'monitor_' + (e && e.name || 'error') }; }
}
async function monRun(id, env) {
  if (!validId(id) || !env.TINYFISH_API_KEY) return { ok: false, error: 'bad_id' };
  try {
    const r = await fetch(MON_URL + '/' + id + '/runs', { method: 'POST', headers: hdr(env), signal: AbortSignal.timeout(40000) });
    if (!r.ok) return { ok: false, error: 'run_http_' + r.status };
    const j = await r.json(); const run = j.run || j;
    const ch = run.changed ?? run.has_changed ?? run.is_changed ?? null;
    return { ok: true, changed: typeof ch === 'boolean' ? ch : null, baseline: !!run.is_baseline };
  } catch (e) { return { ok: false, error: 'run_' + (e && e.name || 'error') }; }
}
async function monDelete(id, env) {
  if (!validId(id) || !env.TINYFISH_API_KEY) return { ok: false };
  try { await fetch(MON_URL + '/' + id, { method: 'DELETE', headers: hdr(env), signal: AbortSignal.timeout(15000) }); } catch (e) {}
  return { ok: true };
}

/* 2) "Is this real?" = Fetch API (reads the page) + Search API (looks for scam reports) + domain rules */
const SHORT = /(^|\.)(bit\.ly|tinyurl\.com|t\.co|rb\.gy|cutt\.ly|is\.gd|shorturl\.at|tiny\.cc)$/i;
const TRUST = /\.(gov\.in|nic\.in|ac\.in|edu\.in|res\.in|edu|gov)$/i;
const ODD_TLD = /\.(xyz|top|click|buzz|work|site|shop|live|icu|vip|rest|fit|cfd|sbs)$/i;
async function scam(url, env) {
  if (!okUrl(url)) return { ok: false, error: 'need_https_link' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  let host; try { host = new URL(url).hostname.toLowerCase(); } catch (e) { return { ok: false, error: 'bad_url' }; }
  const bare = host.replace(/^www\./, '');
  const reasons = []; let risk = 25;
  const add = (pts, good, t) => { risk += pts; reasons.push({ good, t }); };
  if (TRUST.test(bare)) add(-30, true, 'Official-style domain (' + bare.split('.').slice(-2).join('.') + '). Government and college sites use these.');
  if (SHORT.test(bare)) add(30, false, 'Shortened link. You cannot see where it really goes.');
  if (ODD_TLD.test(bare)) add(20, false, 'Unusual domain ending that scam sites often use.');
  if ((bare.match(/-/g) || []).length >= 2 || /\d{3,}/.test(bare.split('.')[0]) || bare.split('.').length >= 5) add(15, false, 'Domain looks stretched or numbered, a common look-alike trick.');
  const [pg, sr] = await Promise.all([
    fetch(FETCH_URL, { method: 'POST', headers: hdr(env), signal: AbortSignal.timeout(30000), body: JSON.stringify({ urls: [url], format: 'markdown', links: false, per_url_timeout_ms: 25000 }) }).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(SEARCH_URL + '?query=' + encodeURIComponent(bare + ' scam OR fake OR fraud complaint'), { headers: { 'X-API-Key': env.TINYFISH_API_KEY }, signal: AbortSignal.timeout(20000) }).then(r => r.ok ? r.json() : null).catch(() => null)
  ]);
  const page = pg && pg.results && pg.results[0];
  const text = page && typeof page.text === 'string' ? page.text.slice(0, 20000) : '';
  if (!page) reasons.push({ good: false, t: 'TinyFish could not read this page. Do not trust it just because of that, and do not share personal data on it.' });
  if (text) {
    if (/(registration|processing|security|joining|training|kit)\s+(fee|charge|deposit)|advance payment|pay\s*(rs\.?|₹|inr)\s*\d/i.test(text)) add(25, false, 'Page asks you to pay a fee or deposit. Real government and big-company jobs and internships do not.');
    if (/(guaranteed|100%)\s*(job|placement|selection)|without interview|no interview|limited seats|hurry up|last chance/i.test(text)) add(15, false, 'Page uses pressure or guarantee words ("guaranteed job", "limited seats").');
    if (/aadhaar|aadhar|\bpan\b|\botp\b|bank account|card number|cvv/i.test(text)) add(15, false, 'Page asks for sensitive details (Aadhaar, PAN, OTP or bank).');
    if (/whatsapp|telegram/i.test(text) && !TRUST.test(bare)) add(8, false, 'Contact is mainly WhatsApp or Telegram.');
    if (!reasons.some(x => !x.good)) reasons.push({ good: true, t: 'No fee, pressure or sensitive-data words found on the page.' });
  }
  const reports = ((sr && sr.results) || []).filter(x => !String(x.url || '').includes(bare) && /scam|fake|fraud|cheat|complaint/i.test((x.title || '') + ' ' + (x.snippet || '')))
    .slice(0, 3).map(x => ({ title: String(x.title || '').slice(0, 110), snippet: String(x.snippet || '').slice(0, 160), url: x.url, site: x.site_name || '' }));
  if (reports.length) add(25, false, 'Other sites mention this domain with words like scam or fraud. See below.');
  risk = Math.max(0, Math.min(100, risk));
  const level = risk >= 60 ? 'high' : risk >= 35 ? 'careful' : 'low';
  return { ok: true, host: bare, risk, level, title: page ? plain(page.title).slice(0, 120) : '', reasons, reports };
}

/* 3) Professor email = Fetch API reads the faculty page, we pick research area + paper lines */
async function profRead(url, env) {
  if (!okUrl(url)) return { ok: false, error: 'need_https_link' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  try {
    const r = await fetch(FETCH_URL, { method: 'POST', headers: hdr(env), signal: AbortSignal.timeout(35000), body: JSON.stringify({ urls: [url], format: 'markdown', links: false, per_url_timeout_ms: 30000 }) });
    if (!r.ok) return { ok: false, error: 'fetch_http_' + r.status };
    const j = await r.json(); const p = j.results && j.results[0];
    if (!p || typeof p.text !== 'string') return { ok: false, error: (j.errors && j.errors[0] && j.errors[0].error) || 'no_page' };
    const lines = p.text.split(/\n+/).map(plain).filter(Boolean);
    let area = '';
    for (let i = 0; i < lines.length && !area; i++) {
      if (/(research (interests?|areas?)|areas? of (research|interest)|specializ|interests?\s*:)/i.test(lines[i]) && lines[i].length < 400) {
        const after = lines[i].replace(/^.*?(interests?|areas?|specializ\w*)\s*[:\-–]?\s*/i, '');
        area = (after.length > 6 ? after : (lines[i + 1] || '')).slice(0, 160);
      }
    }
    const papers = lines.filter(l => /\b(19|20)\d\d\b/.test(l) && l.length > 45 && l.length < 260 && /["“”.]/.test(l) && !/copyright|all rights|last updated/i.test(l)).slice(0, 4);
    return { ok: true, title: plain(p.title).slice(0, 120), area, papers };
  } catch (e) { return { ok: false, error: 'prof_' + (e && e.name || 'error') }; }
}

/* 4) Study-abroad cited answers = TinyFish Research API (instant mode) */
async function resStart(b, env) {
  const country = String(b.country || '').slice(0, 40), q = String(b.q || '').slice(0, 300);
  if (!q) return { ok: false, error: 'empty' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  const query = `An Indian college student asks about studying in ${country || 'abroad'}: ${q}. Use official government and university sources. Give amounts in the local currency and approximate INR. Keep the answer under 180 words and say if something changes often.`;
  try {
    const r = await fetch(RES_START, { method: 'POST', headers: hdr(env), signal: AbortSignal.timeout(25000), body: JSON.stringify({ query, mode: 'instant', output_language: 'en' }) });
    const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch (e) {}
    if (!r.ok) return { ok: false, error: 'research_http_' + r.status };
    const id = j.research_run_id;
    return validId(id) ? { ok: true, id } : { ok: false, error: 'no_run_id' };
  } catch (e) { return { ok: false, error: 'research_' + (e && e.name || 'error') }; }
}
async function resStatus(id, env) {
  if (!validId(id) || !env.TINYFISH_API_KEY) return { ok: false, error: 'bad_id' };
  try {
    const r = await fetch(RES_GET + id, { headers: { 'X-API-Key': env.TINYFISH_API_KEY }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return { ok: false, error: 'status_http_' + r.status };
    const j = await r.json(); const st = String(j.status || '').toUpperCase();
    if (st === 'COMPLETED') {
      const dr = j.deep_result || {}, qr = j.quick_result || {};
      const ans = plain(dr.result || qr.answer || (typeof j.quick_result_summary === 'string' ? j.quick_result_summary : '')).slice(0, 1800);
      const cit = (dr.citations || qr.citations || []).filter(u => /^https?:\/\//.test(u)).slice(0, 6);
      return ans ? { ok: true, state: 'done', answer: ans, citations: cit } : { ok: true, state: 'failed' };
    }
    if (['FAILED', 'CANCELLED', 'TIMED_OUT'].includes(st)) return { ok: true, state: 'failed' };
    return { ok: true, state: 'running' };
  } catch (e) { return { ok: false, error: 'status_' + (e && e.name || 'error') }; }
}

/* ===================== field finder: professors and theses by specialization ===================== */
const FIELDS = {
  ai_ml:   { q: 'machine learning deep learning artificial intelligence', kw: ['machine learning','deep learning','neural','reinforcement','natural language','nlp','computer vision','artificial intelligence','generative','language model','pattern recognition'] },
  data_sci:{ q: 'data science data mining big data analytics statistics', kw: ['data science','data mining','big data','analytics','statistic','database','visualization','information retrieval','data engineering','time series'] },
  cyber:   { q: 'cybersecurity cryptography network security privacy', kw: ['security','cryptograph','privacy','malware','intrusion','blockchain','forensic','threat','vulnerab','trust'] },
  mech:    { q: 'mechanical engineering thermal fluid mechanics manufacturing robotics', kw: ['mechanical','thermal','fluid','manufacturing','heat transfer','combustion','robot','mechatronic','vibration','cfd','turbine','additive','tribology','solid mechanics'] },
  ece:     { q: 'electronics communication signal processing vlsi embedded wireless', kw: ['vlsi','signal processing','wireless','communication','embedded','antenna','semiconductor','analog','iot','photonic','5g'] },
  elec:    { q: 'electrical engineering power systems control systems energy', kw: ['power system','power electronics','smart grid','control system','electric machine','renewable','energy storage','electric vehicle','drives'] },
  civil:   { q: 'civil engineering structural geotechnical transportation water environmental', kw: ['structural','geotechnical','transportation','hydrology','water resources','earthquake','concrete','environmental','construction','remote sensing'] },
  chembio: { q: 'chemical engineering biotechnology bioinformatics materials', kw: ['chemical','biotechnology','bioinformatics','biomedical','genomic','protein','catalysis','polymer','nanomaterial','drug'] }
};
const INST = /^[a-z0-9.-]{3,40}$/i;
function classify(text, want) {
  const t = String(text || '').toLowerCase(), hits = {};
  for (const k in FIELDS) { let n = 0; for (const w of FIELDS[k].kw) if (t.includes(w)) n++; if (n) hits[k] = n; }
  const labels = Object.keys(hits).sort((a, b) => hits[b] - hits[a]).slice(0, 2);
  return { labels, score: want ? (hits[want] || 0) : 0 };
}
async function facultyFind(field, inst, env) {
  if (!FIELDS[field]) return { ok: false, error: 'bad_field' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  const dom = INST.test(inst || '') ? inst : 'ac.in';
  const p = new URLSearchParams({ query: 'faculty professor research interests ' + FIELDS[field].q, include_domains: dom, location: 'IN', language: 'en',
    purpose: 'Help an Indian student find professors working in ' + field.replace('_', ' ') });
  try {
    const r = await fetch(SEARCH_URL + '?' + p, { headers: { 'X-API-Key': env.TINYFISH_API_KEY }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return { ok: false, error: 'search_' + r.status };
    const j = await r.json();
    const out = (j.results || []).map(x => {
      const text = (x.title || '') + ' ' + (x.snippet || ''), c = classify(text, field);
      const m = String(x.snippet || '').match(/(research (interests?|areas?)|area of interest|areas? of (research|interest)|specializ\w+)\s*[:\-–]\s*([^.]{6,180})/i);
      const list = /faculty|people|staff|directory|department|\/dept|group|centre|center/i.test((x.title || '') + ' ' + (x.url || '')) && !/~/.test(x.url || '');
      return { title: plain(x.title).slice(0, 110), snippet: plain(x.snippet).slice(0, 220), interests: m ? plain(m[4]) : '', url: x.url, site: x.site_name || '', kind: list ? 'list' : 'profile', labels: c.labels, score: c.score };
    }).filter(x => /^https?:\/\//.test(x.url || '') && x.score > 0).sort((a, b) => b.score - a.score || (a.kind === 'profile' ? -1 : 1)).slice(0, 10);
    return { ok: true, results: out };
  } catch (e) { return { ok: false, error: 'faculty_' + (e && e.name || 'error') }; }
}
async function thesisFind(field, sort, year, env) {
  if (!FIELDS[field]) return { ok: false, error: 'bad_field' };
  if (!env.TINYFISH_API_KEY) return { ok: false, error: 'no_key' };
  const y = Math.max(2015, Math.min(2026, parseInt(year, 10) || 2022));
  const p = new URLSearchParams({ query: FIELDS[field].q + ' thesis dissertation India', domain_type: 'research_paper', pub_year_min: String(y), language: 'en',
    purpose: 'Help an Indian student find recent thesis topics and papers in ' + field.replace('_', ' ') });
  try {
    const r = await fetch(SEARCH_URL + '?' + p, { headers: { 'X-API-Key': env.TINYFISH_API_KEY }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return { ok: false, error: 'search_' + r.status };
    const j = await r.json();
    let out = (j.results || []).map(x => ({ title: plain(x.title).slice(0, 150), authors: (x.authors || []).slice(0, 3).join(', '), year: x.year || null, venue: plain(x.venue).slice(0, 60),
      cited: x.cited_by_count || 0, pdf: /^https?:\/\//.test(x.pdf_url || '') ? x.pdf_url : '', url: x.url, labels: classify((x.title || '') + ' ' + (x.snippet || ''), field).labels })).filter(x => /^https?:\/\//.test(x.url || ''));
    out = sort === 'cited' ? out.sort((a, b) => b.cited - a.cited) : out.sort((a, b) => (b.year || 0) - (a.year || 0) || b.cited - a.cited);
    return { ok: true, results: out.slice(0, 10) };
  } catch (e) { return { ok: false, error: 'thesis_' + (e && e.name || 'error') }; }
}

export default {
  async fetch(req, env) {
    const h = cors(env, req);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    const u = new URL(req.url);
    if (u.pathname === '/search' && req.method === 'GET') return json(await search(u.searchParams.get('q'), env), 200, h);
    if (u.pathname === '/verify/start' && req.method === 'POST') {
      let b = {}; try { b = await req.json(); } catch (e) {}
      return json(await verifyStart(b, env), 200, h);
    }
    if (u.pathname === '/verify/status' && req.method === 'GET') return json(await verifyStatus(u.searchParams.get('id'), env), 200, h);
    if (u.pathname === '/verify/cancel' && req.method === 'POST') return json(await verifyCancel(u.searchParams.get('id'), env), 200, h);
    if (u.pathname === '/verify/quick' && req.method === 'GET') return json(await quick(u.searchParams.get('url'), u.searchParams.get('name'), env), 200, h);
    if (u.pathname === '/monitor/create' && req.method === 'POST') { let b = {}; try { b = await req.json(); } catch (e) {} return json(await monCreate(b, env), 200, h); }
    if (u.pathname === '/monitor/run' && req.method === 'POST') return json(await monRun(u.searchParams.get('id'), env), 200, h);
    if (u.pathname === '/monitor/delete' && req.method === 'POST') return json(await monDelete(u.searchParams.get('id'), env), 200, h);
    if (u.pathname === '/scam' && req.method === 'GET') return json(await scam(u.searchParams.get('url'), env), 200, h);
    if (u.pathname === '/prof' && req.method === 'GET') return json(await profRead(u.searchParams.get('url'), env), 200, h);
    if (u.pathname === '/research/start' && req.method === 'POST') { let b = {}; try { b = await req.json(); } catch (e) {} return json(await resStart(b, env), 200, h); }
    if (u.pathname === '/research/status' && req.method === 'GET') return json(await resStatus(u.searchParams.get('id'), env), 200, h);
    if (u.pathname === '/faculty' && req.method === 'GET') return json(await facultyFind(u.searchParams.get('field'), u.searchParams.get('inst'), env), 200, h);
    if (u.pathname === '/theses' && req.method === 'GET') return json(await thesisFind(u.searchParams.get('field'), u.searchParams.get('sort'), u.searchParams.get('year'), env), 200, h);
    return json({ ok: true, service: 'student-buddy-tinyfish-proxy', v: 3 }, 200, h);
  }
};
