/* Student Buddy -> TinyFish proxy (Cloudflare Worker)
   Why this exists: your TinyFish API key must stay SECRET. If you put it in the website's JS,
   anyone can steal it. So the website talks to this Worker, and only the Worker knows the key.

   Setup: Cloudflare dashboard > Workers & Pages > Create > Hello World > Edit code > paste this file > Deploy.
   Then Settings > Variables and Secrets > add a SECRET named TINYFISH_API_KEY (your key).
   Optional: add a plain variable ALLOWED_ORIGIN (example https://yourname.github.io) to accept calls only from your site.

   Routes:
     GET  /search?q=...        -> TinyFish Search API (free)  -> top web results
     POST /verify {url,name}   -> TinyFish Agent API reads the official page and returns deadline, fee, status.
                                  If the agent fails, falls back to TinyFish Fetch API (free) and returns key lines.
*/
const SEARCH_URL = 'https://api.search.tinyfish.ai';
const FETCH_URL = 'https://api.fetch.tinyfish.ai';
const AGENT_URL = 'https://agent.tinyfish.ai/v1/automation/run';

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

async function verify(body, env) {
  const url = String(body.url || ''), name = String(body.name || 'this opportunity').slice(0, 120);
  if (!/^https:\/\/[^\s]{3,480}$/.test(url)) return { ok: false, error: 'bad_url' };
  const key = env.TINYFISH_API_KEY;
  if (!key) return { ok: false, error: 'no_key' };
  const goal =
    `You are on the official page for "${name}". Read the page (do not log in, do not submit any form). ` +
    `Find the CURRENT application or registration details. Return ONLY JSON like: ` +
    `{"status":"open|closed|upcoming|unknown","deadline":"YYYY-MM-DD or null","deadline_text":"deadline as written on the page or null",` +
    `"fee":"fee as written or null","eligibility":"age/year/branch rule in one short line or null","summary":"max 25 words"}. ` +
    `If something is not on the page use null. Do not guess.`;
  const why = [];
  try {
    const r = await fetch(AGENT_URL, {
      method: 'POST',
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, goal }),
      signal: AbortSignal.timeout(75000)
    });
    if (r.ok) {
      const j = await r.json();
      const data = parseAgent(j);
      if (data) return { ok: true, source: 'agent', data };
      why.push('agent: no usable data: ' + JSON.stringify(j).slice(0, 200));
    } else {
      why.push('agent http ' + r.status + ': ' + (await r.text()).slice(0, 150));
    }
  } catch (e) { why.push('agent ' + (e && e.name || 'error')); }
  try {
    const r = await fetch(FETCH_URL, {
      method: 'POST',
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [url], format: 'markdown' }),
      signal: AbortSignal.timeout(30000)
    });
    if (r.ok) {
      const j = await r.json();
      const t = j.results && j.results[0] && j.results[0].text;
      const lines = keyLines(typeof t === 'string' ? t : JSON.stringify(t || ''));
      if (lines.length) return { ok: true, source: 'fetch', fallback: true, lines };
      why.push('fetch: page read but no date/fee lines found');
    } else {
      why.push('fetch http ' + r.status);
    }
  } catch (e) { why.push('fetch ' + (e && e.name || 'error')); }
  return { ok: false, error: 'unavailable', why };
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
    if (u.pathname === '/verify' && req.method === 'POST') {
      let b = {}; try { b = await req.json(); } catch (e) {}
      return json(await verify(b, env), 200, h);
    }
    return json({ ok: true, service: 'student-buddy-tinyfish-proxy' }, 200, h);
  }
};
