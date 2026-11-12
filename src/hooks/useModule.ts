import { useEffect, useState, useCallback } from 'react';
import { errorMessage } from '../lib/life';

export function useModule<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try { const result = await loader(); setData(result); setError(''); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [loader]);
  useEffect(() => {
    let active = true;
    loader().then(result => { if (active) { setData(result); setError(''); } })
      .catch(err => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loader]);
  return { data, error, loading, reload };
}

