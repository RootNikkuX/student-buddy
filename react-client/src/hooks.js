import { useEffect, useState, useCallback } from 'react';
import { fetchOpportunities, checkScam } from './api.js';

export function useOpportunities(type = '', q = '') {
  const [s, set] = useState({ items: [], loading: true, error: null });
  useEffect(() => {
    let live = true;
    set(x => ({ ...x, loading: true, error: null }));
    fetchOpportunities({ ...(type && { type }), ...(q && { q }), limit: 60 })
      .then(d => live && set({ items: d.items || [], loading: false, error: null }))
      .catch(e => live && set({ items: [], loading: false, error: e.message }));
    return () => { live = false; };
  }, [type, q]);
  return s;
}

export function useScamCheck() {
  const [s, set] = useState({ data: null, loading: false, error: null });
  const run = useCallback(async url => {
    set({ data: null, loading: true, error: null });
    try { set({ data: await checkScam(url), loading: false, error: null }); }
    catch (e) { set({ data: null, loading: false, error: e.message }); }
  }, []);
  return { ...s, run };
}
