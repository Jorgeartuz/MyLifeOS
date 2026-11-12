import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Module, Panel, Field, SaveButton, Feedback } from '../components/ui/Module';
import { useModule } from '../hooks/useModule';
import { lifeService } from '../services/life.service';
import { today, dateLabel, errorMessage, automaticEvents } from '../lib/life';
import type { CalendarEvent } from '../types/life';
const load = async () => { const [events, debts, motorcycle] = await Promise.all([lifeService.getEvents(), lifeService.getDebts(), lifeService.getMoto()]); return { events, debts, motorcycle }; };
export default function Calendario() {
  const { data, loading, error, reload } = useModule(load);
  const [month, setMonth] = useState(today().slice(0, 7)); const [selectedDay, setSelectedDay] = useState(''); const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const automatic = data ? automaticEvents(data.debts, data.motorcycle.moto) : [];
  const all = [...(data?.events || []), ...automatic];
  const days = month ? new Date(Number(month.slice(0,4)), Number(month.slice(5)), 0).getDate() : 0;
  const offset = month ? (new Date(`${month}-01T12:00:00`).getDay() + 6) % 7 : 0;
  async function action(work: () => Promise<void>) { setBusy(true); setMessage(''); try { await work(); await reload(); } catch (err) { setMessage(errorMessage(err)); } finally { setBusy(false); } }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const el = e.currentTarget; const f = new FormData(el);
    await action(async () => { await lifeService.saveEvent({ title: String(f.get('title')).trim(), event_date: String(f.get('date')), notes: String(f.get('notes')).trim() }, editing?.id); el.reset(); setEditing(null); });
  }
  const visible = all.filter(e => selectedDay ? e.event_date === selectedDay : e.event_date.startsWith(month)).sort((a,b) => a.event_date.localeCompare(b.event_date));
  return <Module title="Calendario" subtitle="Tus eventos y los vencimientos de deudas y documentos de la moto." loading={loading} error={error} onRetry={reload}><Feedback error={message} />{data && <>
    <Panel title="Vista mensual"><div className="flex flex-wrap gap-3 items-end"><Field label="Mes"><input className="module-input" type="month" required value={month} onChange={e => { if (e.target.value) setMonth(e.target.value); setSelectedDay(''); }} /></Field>{selectedDay && <button className="text-sm text-primary py-2" onClick={() => setSelectedDay('')}>Ver todo el mes</button>}</div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => <div key={d} className="text-center text-xs text-text-secondary py-2">{d}</div>)}{Array.from({ length: offset }, (_, i) => <div key={`blank-${i}`} />)}{Array.from({ length: days }, (_, i) => { const date = `${month}-${String(i+1).padStart(2, '0')}`; const count = all.filter(e => e.event_date === date).length; return <button key={date} aria-label={`${dateLabel(date)}, ${count} eventos`} aria-pressed={selectedDay === date} onClick={() => setSelectedDay(date)} className={`min-h-14 sm:min-h-20 rounded-xl border p-1 sm:p-2 text-sm ${selectedDay === date ? 'bg-primary text-white border-primary' : date === today() ? 'border-primary bg-blue-50' : 'border-border hover:bg-background'}`}><span>{i+1}</span>{count > 0 && <span className="block text-xs mt-1">{count}<span className="hidden sm:inline"> evento{count > 1 ? 's' : ''}</span></span>}</button>; })}</div></Panel>
    <Panel title={selectedDay ? `Agenda · ${dateLabel(selectedDay)}` : 'Agenda del mes'}>{visible.length === 0 && <p className="text-sm text-text-secondary">No hay eventos para este período.</p>}{visible.map(e => <article key={e.id} className="border-b border-border pb-3 flex flex-wrap justify-between gap-3"><div><h3 className={`font-semibold ${'completed' in e && e.completed ? 'line-through text-text-secondary' : ''}`}>{e.title}</h3><p className="text-sm text-text-secondary">{dateLabel(e.event_date)}{e.event_date < today() && !('completed' in e && e.completed) ? ' · Pendiente vencido' : ''}</p>{'notes' in e && <p className="text-sm whitespace-pre-wrap">{e.notes}</p>}</div>{'href' in e ? <Link className="text-sm text-primary" to={e.href}>Ver detalle</Link> : <div className="flex flex-wrap gap-3 items-center text-sm"><button disabled={busy} onClick={() => action(() => lifeService.completeEvent(e.id, !e.completed))}>{e.completed ? 'Reabrir' : 'Completar'}</button><button disabled={busy} className="text-primary" onClick={() => setEditing(e)}>Editar</button><button disabled={busy} className="text-red-700" onClick={() => { if (window.confirm(`¿Eliminar el evento «${e.title}»?`)) void action(() => lifeService.deleteEvent(e.id)); }}>Eliminar</button></div>}</article>)}</Panel>
    <Panel title={editing ? 'Editar evento' : 'Nuevo evento'}><form key={editing?.id || selectedDay || 'new'} onSubmit={save} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><Field label="Título"><input className="module-input" name="title" required maxLength={150} defaultValue={editing?.title} /></Field><Field label="Fecha"><input className="module-input" name="date" type="date" required defaultValue={editing?.event_date || selectedDay || today()} /></Field></div><Field label="Notas"><textarea className="module-input" name="notes" maxLength={2000} defaultValue={editing?.notes} /></Field><div className="flex gap-3"><SaveButton busy={busy}>{editing ? 'Guardar cambios' : 'Crear evento'}</SaveButton>{editing && <button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button>}</div></form></Panel>
  </>}</Module>;
}
