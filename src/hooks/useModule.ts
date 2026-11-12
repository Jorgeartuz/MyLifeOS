import { useEffect, useState, useCallback, useRef } from 'react';
import { errorMessage } from '../lib/life';

export function useModule<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const mounted = useRef(false);
  const reload = useCallback(async () => {
    const request = ++generation.current;
    try { const result = await loader(); if (mounted.current && request === generation.current) { setData(result); setError(''); } }
    catch (err) { if (mounted.current && request === generation.current) setError(errorMessage(err)); }
    finally { if (mounted.current && request === generation.current) setLoading(false); }
  }, [loader]);
  useEffect(() => {
    let active = true;
    mounted.current = true;
    const request = ++generation.current;
    loader().then(result => { if (active && request === generation.current) { setData(result); setError(''); } })
      .catch(err => { if (active && request === generation.current) setError(errorMessage(err)); })
      .finally(() => { if (active && request === generation.current) setLoading(false); });
    return () => { active = false; mounted.current = false; };
  }, [loader]);
  return { data, error, loading, reload };
}

