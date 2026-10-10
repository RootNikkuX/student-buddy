import { useState } from 'react';
import { useOpportunities, useScamCheck } from './hooks.js';

const TYPES = ['', 'hackathon', 'internship', 'job', 'event'];

function Opportunities() {
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const { items, loading, error } = useOpportunities(type, q);
  return (
    <section>
      <h2>Live opportunities</h2>
      <select value={type} onChange={e => setType(e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{t || 'all'}</option>)}</select>{' '}
      <input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
      {loading && <p>Loading...</p>}
      {error && <p>Could not load ({error}).</p>}
      <ul>{items.map(o => <li key={o.id || o.url}><a href={o.url} target="_blank" rel="noreferrer">{o.title}</a> <small>{o.org} {o.deadline ? '· ' + o.deadline : ''}</small></li>)}</ul>
    </section>
  );
}

function ScamChecker() {
  const [url, setUrl] = useState('');
  const { data, loading, error, run } = useScamCheck();
  return (
    <section>
      <h2>Is this real?</h2>
      <input style={{ width: '60%' }} placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />{' '}
      <button disabled={loading || !url} onClick={() => run(url)}>{loading ? 'Checking...' : 'Check'}</button>
      {error && <p>Could not check right now.</p>}
      {data && data.ok && (<div><b>Risk: {data.level}</b> ({data.risk}/100)<ul>{data.reasons.map((r, i) => <li key={i}>{r.t}</li>)}</ul></div>)}
    </section>
  );
}

export default function App() {
  return <main style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'system-ui', padding: '0 1rem' }}><h1>Student Buddy</h1><Opportunities /><ScamChecker /></main>;
}
