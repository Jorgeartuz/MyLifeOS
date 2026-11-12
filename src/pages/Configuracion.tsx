import { useState, type FormEvent } from 'react';
import { Module, Panel, Field, SaveButton, Feedback } from '../components/ui/Module';
import { useModule } from '../hooks/useModule';
import { settingsService } from '../services/settings.service';
import { signOut } from '../services/auth.service';
import { errorMessage } from '../lib/life';
import type { CategoryType } from '../types/finance';
export default function Configuracion() {
  const { data, loading, error, reload } = useModule(settingsService.load);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [success, setSuccess] = useState('');
  async function action(work: () => Promise<void>, result: string) {
    setBusy(true); setMessage(''); setSuccess('');
    try { await work(); await reload(); setSuccess(result); } catch (err) { setMessage(errorMessage(err)); } finally { setBusy(false); }
  }
  function submit(e: FormEvent<HTMLFormElement>, kind: 'name' | 'password' | 'category') {
    e.preventDefault(); const el = e.currentTarget; const f = new FormData(el);
    void action(async () => {
      if (kind === 'name') await settingsService.saveName(String(f.get('name')));
      if (kind === 'category') await settingsService.addCategory(String(f.get('name')), String(f.get('type')) as CategoryType);
      if (kind === 'password') {
        if (String(f.get('password')) !== String(f.get('confirm'))) throw new Error('Las contraseñas no coinciden.');
        await settingsService.changePassword(String(f.get('password')), String(f.get('current')), data!.user.email!);
      }
      if (kind !== 'name') el.reset();
    }, kind === 'name' ? 'Perfil actualizado.' : kind === 'password' ? 'Contraseña actualizada.' : 'Categoría creada.');
  }
  return <Module title="Configuración" subtitle="Administra tu perfil, seguridad y categorías financieras." loading={loading} error={error} onRetry={reload}><Feedback error={message} success={success} />{data && <>
    <Panel title="Mi perfil"><form onSubmit={e => submit(e, 'name')} className="space-y-4"><p className="text-sm text-text-secondary">{data.user.email}</p><Field label="Nombre completo"><input className="module-input" name="name" required maxLength={100} defaultValue={String(data.user.user_metadata.full_name || '')} autoComplete="name" /></Field><SaveButton busy={busy}>Guardar perfil</SaveButton></form></Panel>
    <Panel title="Cambiar contraseña"><form onSubmit={e => submit(e, 'password')} className="space-y-4"><Field label="Contraseña actual"><input className="module-input" name="current" type="password" autoComplete="current-password" required /></Field><div className="grid sm:grid-cols-2 gap-4"><Field label="Nueva contraseña (mínimo 8 caracteres)"><input className="module-input" name="password" type="password" minLength={8} autoComplete="new-password" required /></Field><Field label="Confirmar nueva contraseña"><input className="module-input" name="confirm" type="password" minLength={8} autoComplete="new-password" required /></Field></div><SaveButton busy={busy}>Actualizar contraseña</SaveButton></form></Panel>
    <Panel title="Categorías"><form onSubmit={e => submit(e, 'category')} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><Field label="Nombre"><input className="module-input" name="name" required maxLength={80} /></Field><Field label="Tipo"><select className="module-input" name="type"><option value="expense">Gasto</option><option value="income">Ingreso</option><option value="both">Ingreso y gasto</option></select></Field></div><SaveButton busy={busy}>Crear categoría</SaveButton></form><div className="divide-y divide-border">{data.categories.length === 0 && <p className="text-sm text-text-secondary">Crea categorías para registrar movimientos en Finanzas.</p>}{data.categories.map(c => <div key={c.id} className="py-3 flex justify-between gap-3 items-center"><div><p className="font-medium">{c.name}</p><p className="text-xs text-text-secondary">{c.type === 'income' ? 'Ingreso' : c.type === 'expense' ? 'Gasto' : 'Ingreso y gasto'}</p></div><button disabled={busy} className="text-sm text-red-700" onClick={() => { if (window.confirm(`¿Archivar «${c.name}»? Su historial se conservará.`)) void action(() => settingsService.archiveCategory(c.id), 'Categoría archivada.'); }}>Archivar</button></div>)}</div></Panel>
    <Panel title="Sesión"><button disabled={busy} className="module-button" onClick={() => action(signOut, '')}>Cerrar sesión</button></Panel>
  </>}</Module>;
}
