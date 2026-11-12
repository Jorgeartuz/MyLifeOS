import { useEffect } from 'react';
import { useModule } from './useModule';
import { planningService } from '../services/planning.service';

export function usePlanningOverview() {
  const state = useModule(planningService.overview);
  const { reload } = state;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => { clearTimeout(timer); timer = setTimeout(() => { void reload(); }, 150); };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('lifeos:planning-changed', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', visible);
    const interval = setInterval(visible, 60000);
    return () => {
      clearTimeout(timer); clearInterval(interval);
      window.removeEventListener('lifeos:planning-changed', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [reload]);
  return state;
}
