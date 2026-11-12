import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Module({ title, subtitle, loading, error, onRetry, children }: { title: string; subtitle: string; loading: boolean; error: string; onRetry: () => void; children: ReactNode }) {
  return <div className="space-y-6 pb-10"><div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-text-secondary mt-1">{subtitle}</p></div>
    {error && <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"><p>{error}</p><button className="underline mt-2" onClick={onRetry}>Volver a intentar</button></div>}
    {loading ? <div role="status" className="py-16 flex justify-center"><Loader2 className="animate-spin" /><span className="sr-only">Cargando</span></div> : children}</div>;
}
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="bg-surface border border-border rounded-card p-5 md:p-6 space-y-4"><h2 className="font-bold">{title}</h2>{children}</section>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium space-y-1"><span>{label}</span>{children}</label>;
}
export function SaveButton({ busy, children = 'Guardar' }: { busy: boolean; children?: ReactNode }) {
  return <button disabled={busy} className="module-button" type="submit">{busy ? 'Guardando…' : children}</button>;
}
export function Feedback({ error, success }: { error: string; success?: string }) {
  return <>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}{success && <p role="status" className="text-sm text-green-700">{success}</p>}</>;
}
