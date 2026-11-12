import { useEffect, useRef, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function PwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const upgrading = useRef(false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let active = true;
    let registration: ServiceWorkerRegistration | undefined;
    const refresh = () => { if (upgrading.current) window.location.reload(); };
    const check = () => { if (document.visibilityState === 'visible') void registration?.update().catch(() => undefined); };
    navigator.serviceWorker.addEventListener('controllerchange', refresh);
    document.addEventListener('visibilitychange', check);
    void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(result => {
      if (!active) return;
      registration = result;
      if (result.waiting) setWaiting(result.waiting);
      result.addEventListener('updatefound', () => {
        const worker = result.installing;
        const previousController = navigator.serviceWorker.controller;
        worker?.addEventListener('statechange', () => { if (active && worker.state === 'installed' && previousController && previousController !== worker) setWaiting(worker); });
      });
    }).catch(() => { /* Installation still works online when offline support is unavailable. */ });
    return () => { active = false; navigator.serviceWorker.removeEventListener('controllerchange', refresh); document.removeEventListener('visibilitychange', check); };
  }, []);
  if (online && !waiting) return null;
  return <div className="pwa-status" role="status">{!online ? <><WifiOff size={18} className="shrink-0" /><span>Sin conexión. Reconecta para consultar o guardar movimientos.</span></> : <><RefreshCw size={18} className="shrink-0" /><span>Hay una nueva versión disponible.</span><button className="font-bold underline shrink-0 min-h-11" onClick={() => { if (window.confirm('Se actualizará la app. Guarda primero cualquier formulario abierto.')) { upgrading.current = true; waiting?.postMessage({ type: 'SKIP_WAITING' }); } }}>Actualizar</button></>}</div>;
}
