/* Student Buddy ingestion backend (Cloudflare Worker + D1).
   - scheduled(): every 10 min polls running TinyFish agent runs, saves finished results, and starts new runs for sources that are due.
   - POST /api/opportunities  (Bearer INGEST_TOKEN)  save items from any agent or script
   - GET  /api/opportunities  (public)               the website reads from here
   - POST /api/run            (Bearer INGEST_TOKEN)  run one tick now (for testing)
   - GET  /api/status         (Bearer INGEST_TOKEN)  sources and recent runs
   Secrets: TINYFISH_API_KEY, INGEST_TOKEN.  Variable (optional): ALLOWED_ORIGIN.  Binding: DB (D1). */
import { SOURCES, REFRESH_HOURS, MAX_ACTIVE } from './sources.js';

const AGENT_URL = 'https://agent.tinyfish.ai/v1/automation/run-async';
const RUNS_URL = 'https://agent.tinyfish.ai/v1/runs/';
const TYPES = ['hackathon', 'internship', 'job', 'scholarship', 'competition', 'workshop', 'other'];
const RUN_TIMEOUT_MIN = 20;

/* ---------- what we ask the agent to return ---------- */
const S = { type: 'string', nullable: true };
export const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    opportunities: {
      type: 'array', maxItems: 15,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' }, type: { type: 'string' }, org: S,
          deadline: S, deadline_text: S, eligibility: S, pay: S, location: S,
          source_url: S, description: S,
        },
        required: ['title'],
        propertyOrdering: ['title', 'type', 'org', 'deadline', 'deadline_text', 'eligibility', 'pay', 'location', 'source_url', 'description'],
      },
    },
  },
  required: ['opportunities'],
};
export const goal = (src) =>
  `This public page lists opportunities for students (${src.type_hint || 'hackathons, internships, jobs'}). Do not log in and do not submit any form. ` +
  `Read the list and return up to 15 items that are open now or upcoming. For each item return: title; type (one of ${TYPES.join(', ')}); org (the organizer or company); ` +
  `deadline as YYYY-MM-DD if shown, else null; deadline_text exactly as written, else null; eligibility (who can apply, one short line); ` +
  `pay (stipend, prize pool or fee as written); location (city, Remote or Online); source_url (the full link to that item's own page); description (max 25 words). ` +
  `Use null for anything not shown on the page. Never guess or invent items.`;

/* ---------- helpers ---------- */
const nowIso = () => new Date().toISOString();
const today = () => nowIso().slice(0, 10);
const txt = (v, n) => { if (v === null || v === undefined) return null; const s = String(v).replace(/\s+/g, ' ').trim(); return !s || /^(null|n\/a|na|none|unknown|not (found|specified))$/i.test(s) ? null : s.slice(0, n); };
const okHttps = (u) => { try { return new URL(u).protocol === 'https:'; } catch (e) { return false; } };
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, '0')).join(''); }
export async function authed(req, env) {
  const got = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.INGEST_TOKEN || !got) return false;
  const [a, b] = await Promise.all([sha(got + '|x'), sha(env.INGEST_TOKEN + '|x')]);
  return a === b;
}

/* Validate and clean one item. Returns null if it should be skipped. */
export async function clean(o, ctx = {}) {
  if (!o || typeof o !== 'object') return null;
  const title = txt(o.title, 200); if (!title || title.length < 3) return null;
  let type = String(o.type || '').toLowerCase().trim(); if (!TYPES.includes(type)) type = TYPES.includes(ctx.type_hint) ? ctx.type_hint : 'other';
  let url = txt(o.source_url, 500); if (!url || !okHttps(url)) url = ctx.source_page && okHttps(ctx.source_page) ? ctx.source_page : null;
  if (!url) return null;
  const dl = txt(o.deadline, 10), deadline = dl && /^\d{4}-\d{2}-\d{2}$/.test(dl) && !isNaN(Date.parse(dl)) ? dl : null;
  const host = new URL(url).hostname.replace(/^www\./, '');
  return {
    id: await sha(title.toLowerCase() + '|' + host), title, type, org: txt(o.org, 150), deadline, deadline_text: txt(o.deadline_text, 120),
    eligibility: txt(o.eligibility, 300), pay: txt(o.pay, 120), location: txt(o.location, 100), description: txt(o.description, 300),
    source_url: url, source_page: ctx.source_page || null, status: deadline && deadline < today() ? 'closed' : 'open',
  };
}

export async function saveItems(env, list, ctx = {}) {
  let saved = 0, skipped = 0; const t = nowIso(); const stmts = [];
  for (const raw of list.slice(0, 100)) {
    const c = await clean(raw, ctx); if (!c) { skipped++; continue; }
    stmts.push(env.DB.prepare(
      `INSERT INTO opportunities (id,title,type,org,deadline,deadline_text,eligibility,pay,location,description,source_url,source_page,status,first_seen,last_seen,updated_at)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?14,?14)
       ON CONFLICT(id) DO UPDATE SET type=?3, org=COALESCE(?4,org), deadline=COALESCE(?5,deadline), deadline_text=COALESCE(?6,deadline_text), eligibility=COALESCE(?7,eligibility),
         pay=COALESCE(?8,pay), location=COALESCE(?9,location), description=COALESCE(?10,description), source_url=?11, source_page=COALESCE(?12,source_page),
         status=?13, last_seen=?14, updated_at=?14`)
      .bind(c.id, c.title, c.type, c.org, c.deadline, c.deadline_text, c.eligibility, c.pay, c.location, c.description, c.source_url, c.source_page, c.status, t));
    saved++;
  }
  if (stmts.length) await env.DB.batch(stmts);
  return { saved, skipped };
}

/* The agent result can be {opportunities:[...]} or wrapped one level deeper. */
export function extractItems(run) {
  let d = run && run.result; if (typeof d === 'string') { const m = d.match(/\{[\s\S]*\}/); if (m) { try { d = JSON.parse(m[0]); } catch (e) { d = null; } } }
  if (d && !Array.isArray(d.opportunities) && d.result) d = d.result;
  return d && Array.isArray(d.opportunities) ? d.opportunities : null;
}

/* ---------- TinyFish scheduling ---------- */
const tf = (env, url, init = {}) => fetch(url, { ...init, headers: { 'X-API-Key': env.TINYFISH_API_KEY, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(25000) });

async function pollRuns(env, log) {
  const { results: running } = await env.DB.prepare(`SELECT run_id, source_url, started_at FROM runs WHERE state='running' ORDER BY started_at LIMIT 6`).all();
  for (const r of running || []) {
    try {
      const res = await tf(env, RUNS_URL + r.run_id);
      if (!res.ok) { log.push(`poll ${r.run_id}: http ${res.status}`); continue; }
      const j = await res.json(), st = String(j.status || '').toUpperCase();
      if (st === 'COMPLETED') {
        const items = extractItems(j), src = await env.DB.prepare('SELECT type_hint FROM sources WHERE url=?1').bind(r.source_url).first();
        if (!items) { await finish(env, r, 'failed', 0, 'no opportunities in result'); continue; }
        const out = await saveItems(env, items, { source_page: r.source_url, type_hint: src && src.type_hint });
        await finish(env, r, 'done', out.saved, null); log.push(`done ${r.source_url}: saved ${out.saved}, skipped ${out.skipped}`);
      } else if (st === 'FAILED' || st === 'CANCELLED') {
        await finish(env, r, 'failed', 0, (j.error && (j.error.message || j.error.code)) || st);
      } else if (Date.now() - Date.parse(r.started_at) > RUN_TIMEOUT_MIN * 60000) {
        try { await tf(env, RUNS_URL + r.run_id + '/cancel', { method: 'POST' }); } catch (e) {}
        await finish(env, r, 'timeout', 0, 'took too long');
      }
    } catch (e) { log.push(`poll ${r.run_id}: ${e && e.name}`); }
  }
}
async function finish(env, r, state, n, err) {
  await env.DB.batch([
    env.DB.prepare('UPDATE runs SET state=?1, n_items=?2, error=?3 WHERE run_id=?4').bind(state, n, err, r.run_id),
    state === 'done'
      ? env.DB.prepare('UPDATE sources SET last_ok=?1, last_error=NULL WHERE url=?2').bind(nowIso(), r.source_url)
      : env.DB.prepare('UPDATE sources SET last_error=?1 WHERE url=?2').bind(String(err || state), r.source_url),
  ]);
}

async function startRuns(env, log) {
  const a = await env.DB.prepare(`SELECT COUNT(*) AS n FROM runs WHERE state='running'`).first();
  let slots = MAX_ACTIVE - ((a && a.n) || 0); if (slots <= 0) return;
  const cutoff = new Date(Date.now() - REFRESH_HOURS * 3600000).toISOString();
  const { results: due } = await env.DB.prepare(`SELECT url,name,type_hint FROM sources WHERE enabled=1 AND (last_started IS NULL OR last_started < ?1) ORDER BY last_started LIMIT ?2`).bind(cutoff, slots).all();
  for (const s of due || []) {
    await env.DB.prepare('UPDATE sources SET last_started=?1 WHERE url=?2').bind(nowIso(), s.url).run();   // mark first so a failing source is not retried every tick
    try {
      const res = await tf(env, AGENT_URL, { method: 'POST', body: JSON.stringify({ url: s.url, goal: goal(s), output_schema: OUTPUT_SCHEMA }) });
      const t = await res.text(); let j = {}; try { j = JSON.parse(t); } catch (e) {}
      const id = j.run_id || j.id;
      if (!res.ok || !id) { await env.DB.prepare('UPDATE sources SET last_error=?1 WHERE url=?2').bind('start http ' + res.status + ' ' + t.slice(0, 120), s.url).run(); log.push(`start ${s.url}: http ${res.status}`); if (res.status === 402 || res.status === 429) break; continue; }
      await env.DB.prepare('INSERT INTO runs (run_id,source_url,started_at) VALUES (?1,?2,?3)').bind(id, s.url, nowIso()).run();
      log.push(`started ${s.url}: ${id}`);
    } catch (e) { log.push(`start ${s.url}: ${e && e.name}`); }
  }
}

export async function tick(env) {
  const log = [];
  if (!env.TINYFISH_API_KEY) return ['TINYFISH_API_KEY is not set'];
  for (const s of SOURCES) await env.DB.prepare('INSERT INTO sources (url,name,type_hint) VALUES (?1,?2,?3) ON CONFLICT(url) DO UPDATE SET name=?2, type_hint=?3').bind(s.url, s.name, s.type_hint).run();
  await pollRuns(env, log);
  await startRuns(env, log);
  await env.DB.batch([
    env.DB.prepare(`UPDATE opportunities SET status='closed' WHERE status='open' AND deadline IS NOT NULL AND deadline < ?1`).bind(today()),
    env.DB.prepare(`UPDATE opportunities SET status='closed' WHERE status='open' AND last_seen < ?1`).bind(new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);
  return log;
}

/* ---------- HTTP API ---------- */
const FIELDS = 'id,title,type,org,deadline,deadline_text,eligibility,pay,location,description,source_url,status,last_seen';
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Vary': 'Origin' };
    const out = (o, s = 200, extra = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...cors, ...extra } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const u = new URL(req.url);

    if (u.pathname === '/api/opportunities' && req.method === 'GET') {
      const p = u.searchParams, where = ['hidden=0'], args = [];
      if (p.get('open') !== '0') where.push(`status='open'`);
      const type = p.get('type'); if (type && TYPES.includes(type)) { where.push('type=?'); args.push(type); }
      const q = (p.get('q') || '').trim().slice(0, 60); if (q) { where.push('(title LIKE ? OR org LIKE ? OR description LIKE ?)'); const l = `%${q.replace(/[%_]/g, '')}%`; args.push(l, l, l); }
      const limit = Math.max(1, Math.min(200, parseInt(p.get('limit'), 10) || 50)), offset = Math.max(0, parseInt(p.get('offset'), 10) || 0);
      const sql = `SELECT ${FIELDS} FROM opportunities WHERE ${where.join(' AND ')} ORDER BY (deadline IS NULL), deadline, last_seen DESC LIMIT ${limit} OFFSET ${offset}`;
      const { results } = await env.DB.prepare(sql).bind(...args).all();
      return out({ ok: true, count: (results || []).length, items: results || [] }, 200, { 'Cache-Control': 'public, max-age=300' });
    }
    if (u.pathname.startsWith('/api/') && !(await authed(req, env))) return out({ ok: false, error: 'unauthorized' }, 401);

    if (u.pathname === '/api/opportunities' && req.method === 'POST') {
      let b; try { b = await req.json(); } catch (e) { return out({ ok: false, error: 'bad_json' }, 400); }
      const list = Array.isArray(b) ? b : Array.isArray(b.opportunities) ? b.opportunities : (b && b.title ? [b] : null);
      if (!list) return out({ ok: false, error: 'send an array or {opportunities:[...]}' }, 400);
      return out({ ok: true, ...(await saveItems(env, list, { source_page: b.source_url || null, type_hint: b.type_hint })) });
    }
    if (u.pathname === '/api/run' && req.method === 'POST') return out({ ok: true, log: await tick(env) });
    if (u.pathname === '/api/status' && req.method === 'GET') {
      const [s, r, n] = await Promise.all([env.DB.prepare('SELECT * FROM sources').all(), env.DB.prepare('SELECT * FROM runs ORDER BY started_at DESC LIMIT 15').all(), env.DB.prepare(`SELECT COUNT(*) AS n, SUM(status='open') AS open FROM opportunities`).first()]);
      return out({ ok: true, totals: n, sources: s.results, runs: r.results });
    }
    return out({ ok: true, service: 'student-buddy-ingest' });
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(tick(env)); },
};
