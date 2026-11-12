import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Share, PlusSquare, X } from 'lucide-react';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
const installed = () => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

export function InstallAppButton() {
  const [standalone, setStandalone] = useState(installed);
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const update = () => setStandalone(installed());
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    window.addEventListener('beforeinstallprompt', capture); window.addEventListener('appinstalled', update); media.addEventListener('change', update);
    return () => { window.removeEventListener('beforeinstallprompt', capture); window.removeEventListener('appinstalled', update); media.removeEventListener('change', update); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const items = dialog.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
  async function install() {
    if (prompt) { await prompt.prompt(); const choice = await prompt.userChoice; setPrompt(null); if (choice.outcome === 'accepted') setOpen(false); }
  }
  if (standalone) return null;
  return <><button type="button" className="inline-flex items-center gap-2 min-h-11 rounded-xl px-3 text-primary bg-blue-50 text-xs font-bold" onClick={() => setOpen(true)} aria-label="Instalar MyLifeOs en mi iPhone"><Smartphone size={18} /><span className="hidden sm:inline">Instalar app</span></button>
    {open && createPortal(<div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="install-title" className="app-dialog bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl"><div className="flex items-start justify-between gap-4"><img src="/icons/app-180.png" width="64" height="64" alt="" className="rounded-2xl" /><button onClick={() => setOpen(false)} className="p-3 rounded-full hover:bg-background" aria-label="Cerrar instrucciones"><X size={20} /></button></div><h2 id="install-title" className="text-xl font-bold mt-5">MyLifeOs en tu iPhone</h2><p className="text-sm text-text-secondary mt-2">Tu dinero y tus planes, a un toque desde la pantalla de inicio.</p><ol className="space-y-4 mt-6 text-sm"><li className="flex gap-3"><span className="install-step">1</span><p>Abre esta misma página en <strong>Safari</strong>.</p></li><li className="flex gap-3"><span className="install-step">2</span><p>Toca <strong>Compartir</strong> <Share size={16} className="inline text-primary" /> y elige <strong>Añadir a pantalla de inicio</strong> <PlusSquare size={16} className="inline text-primary" />.</p></li><li className="flex gap-3"><span className="install-step">3</span><p>Si aparece, activa <strong>Abrir como app web</strong>. Confirma con <strong>Añadir</strong>.</p></li></ol><p className="text-xs text-text-secondary mt-6">Después abre el icono de MyLifeOs. Puede que necesites iniciar sesión la primera vez. Los datos y movimientos requieren conexión.</p>{prompt && <button className="module-button w-full mt-5" onClick={install}>Instalar en este dispositivo</button>}<button className="module-button w-full mt-3" onClick={() => setOpen(false)}>Entendido</button></div></div>, document.body)}
  </>;
}
