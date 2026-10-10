// Same two Cloudflare Workers the live site uses. No TinyFish key here, it stays in the Worker.
export const TF_API = import.meta.env.VITE_TF_API || 'https://student-buddy-tf.nikunjkapoor33.workers.dev';
export const OPP_API = import.meta.env.VITE_OPP_API || 'https://student-buddy-ingest.nikunjkapoor33.workers.dev';
async function get(base, path, params) {
  const r = await fetch(base + path + '?' + new URLSearchParams(params), { signal: AbortSignal.timeout(40000) });
  if (!r.ok) throw new Error('http_' + r.status);
  return r.json();
}
export const fetchOpportunities = (p = {}) => get(OPP_API, '/api/opportunities', p);
export const checkScam = url => get(TF_API, '/scam', { url });
export const searchWeb = q => get(TF_API, '/search', { q });
export const quickVerify = (url, name) => get(TF_API, '/verify/quick', { url, name });
