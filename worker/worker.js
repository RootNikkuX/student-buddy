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
    return json({ ok: true, service: 'student-buddy-tinyfish-proxy' }, 200, h);
  }
};
