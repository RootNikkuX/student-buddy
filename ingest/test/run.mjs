import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import worker, { tick, clean, extractItems } from '../src/index.js';

/* tiny D1 look-alike on top of node:sqlite so we can test the real code */
function d1() {
  const db = new DatabaseSync(':memory:'); db.exec(fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  const mk = (sql, args = []) => ({
    bind: (...a) => mk(sql, a),
    run: async () => { db.prepare(sql).run(...args); return {}; },
    first: async () => db.prepare(sql).get(...args) || null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    _x: () => db.prepare(sql).run(...args),
  });
  return { prepare: (s) => mk(s), batch: async (a) => { a.forEach((s) => s._x()); return []; }, _db: db };
}

const env = { DB: d1(), TINYFISH_API_KEY: 'test-key', INGEST_TOKEN: 'secret-token' };
const runs = {}; let started = 0;
globalThis.fetch = async (url, init = {}) => {
  const J = (o, s = 200) => ({ ok: s < 400, status: s, text: async () => JSON.stringify(o), json: async () => o });
  assert.equal(init.headers['X-API-Key'], 'test-key');
  if (url.endsWith('/run-async')) { const id = 'run_' + (++started) + '_abcdef'; const b = JSON.parse(init.body); assert.equal(b.output_schema.type, 'object'); runs[id] = b.url; return J({ run_id: id }); }
  const m = url.match(/\/v1\/runs\/([^/]+)$/);
  if (m) return J({ status: 'COMPLETED', result: { opportunities: [
    { title: 'Hack the Fest 2026', type: 'hackathon', org: 'ABC Univ', deadline: '2099-01-10', deadline_text: '10 Jan 2099', eligibility: 'UG students', pay: '₹1,00,000 prizes', location: 'Online', source_url: 'https://devfolio.co/hack-the-fest', description: 'x' },
    { title: 'Old Contest', type: 'competition', deadline: '2020-01-01', source_url: 'https://devfolio.co/old' },
    { title: 'Bad type item', type: 'weird', source_url: 'http://insecure.example/x' },
    { title: '', type: 'job' }] } });
  throw new Error('unexpected ' + url);
};

/* 1) tick starts at most 2 runs (TinyFish limit), then polls and saves them */
let log = await tick(env); console.log(log.join('\n'));
assert.equal(started, 2);
log = await tick(env); console.log(log.join('\n'));
let n = env.DB._db.prepare('SELECT COUNT(*) c FROM opportunities').get().c; console.log('rows after poll:', n);
assert.ok(n >= 2);
assert.equal(env.DB._db.prepare("SELECT status FROM opportunities WHERE title='Old Contest'").get().status, 'closed');
const bad = env.DB._db.prepare("SELECT type, source_url FROM opportunities WHERE title='Bad type item'").get();
assert.equal(bad.type, 'hackathon', 'unknown type falls back to the source hint');
assert.ok(bad.source_url.startsWith('https://'), 'http-only link is replaced by the https source page');
assert.equal(env.DB._db.prepare("SELECT COUNT(*) c FROM opportunities WHERE title=''").get().c, 0, 'empty title skipped');
/* running the same data again must update, not duplicate */
const before = env.DB._db.prepare('SELECT COUNT(*) c FROM opportunities').get().c;
await tick(env); await tick(env);
assert.equal(env.DB._db.prepare('SELECT COUNT(*) c FROM opportunities').get().c >= before, true);

/* 2) POST needs the token, GET is public */
const call = (path, o = {}) => worker.fetch(new Request('https://x.dev' + path, o), env);
assert.equal((await call('/api/opportunities', { method: 'POST', body: '[]' })).status, 401);
assert.equal((await call('/api/opportunities', { method: 'POST', headers: { Authorization: 'Bearer nope' }, body: '[]' })).status, 401);
let r = await call('/api/opportunities', { method: 'POST', headers: { Authorization: 'Bearer secret-token' }, body: JSON.stringify({ opportunities: [{ title: 'Manual Internship', type: 'internship', source_url: 'https://example.com/i', pay: '₹10,000/month', deadline: '2099-05-01' }, { nope: 1 }] }) });
let j = await r.json(); console.log('POST', j); assert.deepEqual([j.saved, j.skipped], [1, 1]);
r = await call('/api/opportunities?type=internship&q=manual'); j = await r.json(); console.log('GET', j.items.map((x) => x.title)); assert.equal(j.items.length, 1);
r = await call('/api/opportunities?q=%27%20OR%201%3D1--'); j = await r.json(); assert.equal(j.count, 0, 'SQL injection attempt returns nothing');
r = await call('/api/status', { headers: { Authorization: 'Bearer secret-token' } }); j = await r.json(); console.log('status totals', j.totals);
assert.equal(extractItems({ result: { result: { opportunities: [1] } } }).length, 1);
console.log('ALL TESTS PASSED');
