import { useState, type FormEvent } from 'react';
import { Module, Panel, Field, SaveButton, Feedback } from '../components/ui/Module';
import { useModule } from '../hooks/useModule';
import { lifeService } from '../services/life.service';
import { planningService } from '../services/planning.service';
import { MotoPlanning } from '../components/finance/MotoPlanning';
import { today, money, dateLabel, errorMessage } from '../lib/life';

export default function Moto() {
  const { data, loading, error, reload } = useModule(planningService.overview);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [success, setSuccess] = useState('');
  const moto = data?.moto;
  async function save(e: FormEvent<HTMLFormElement>, maintenance = false) {
    e.preventDefault(); const el = e.currentTarget; const f = new FormData(el); setBusy(true); setMessage(''); setSuccess('');
    try {
      if (maintenance && moto) {
        await lifeService.addMaintenance({ motorcycle_id: moto.id, title: String(f.get('title')).trim(), performed_on: String(f.get('date')), odometer: Number(f.get('km')), cost: Number(f.get('cost')), notes: String(f.get('notes')).trim() }); el.reset();
      } else {
        if (moto && Number(f.get('km')) < Number(moto.odometer)) throw new Error('El kilometraje no puede disminuir.');
        await lifeService.saveMoto({ model: String(f.get('model')).trim(), plate: String(f.get('plate')).trim().toUpperCase(), odometer: Number(f.get('km')), next_maintenance_km: f.get('next') ? Number(f.get('next')) : null, soat_date: String(f.get('soat')) || null, inspection_date: String(f.get('inspection')) || null });
      }
      await reload(); setSuccess('Datos guardados.');
    } catch (err) { setMessage(errorMessage(err)); } finally { setBusy(false); }
  }
  return <Module title="Mi moto" subtitle="Kilometraje, documentos e historial de mantenimiento." loading={loading} error={error} onRetry={reload}>
    <Feedback error={message} success={success} />{data && <><Panel title="Datos de la moto"><form key={`${moto?.id}-${moto?.odometer}`} onSubmit={save} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4">
      <Field label="Modelo"><input className="module-input" name="model" required maxLength={100} defaultValue={moto?.model} placeholder="Ej. AKT CR4 125" /></Field><Field label="Placa"><input className="module-input" name="plate" maxLength={15} defaultValue={moto?.plate} /></Field>
      <Field label="Kilometraje actual"><input className="module-input" name="km" type="number" min={moto?.odometer || 0} step="1" required defaultValue={moto?.odometer || 0} /></Field><Field label="Próximo mantenimiento (km)"><input className="module-input" name="next" type="number" min="0" step="1" defaultValue={moto?.next_maintenance_km ?? ''} /></Field>
      <Field label="Vencimiento SOAT"><input className="module-input" name="soat" type="date" defaultValue={moto?.soat_date || ''} /></Field><Field label="Vencimiento tecnomecánica"><input className="module-input" name="inspection" type="date" defaultValue={moto?.inspection_date || ''} /></Field>
    </div><SaveButton busy={busy}>Guardar moto</SaveButton></form>
    {moto?.next_maintenance_km != null && <p className="text-sm text-primary">{Number(moto.odometer) >= moto.next_maintenance_km ? 'Mantenimiento pendiente' : `Faltan ${(moto.next_maintenance_km - Number(moto.odometer)).toLocaleString('es-CO')} km para el mantenimiento`}</p>}
    {moto && [['SOAT', moto.soat_date], ['Tecnomecánica', moto.inspection_date]].map(([label, date]) => date && <p key={label} className={date < today() ? 'text-sm text-red-700' : 'text-sm text-text-secondary'}>{label}: {dateLabel(date)}{date < today() ? ' · Vencido' : ''}</p>)}
    </Panel>{moto && <MotoPlanning data={data} reload={reload} />}{moto && <Panel title="Servicio ocasional (sin recurrencia)"><form onSubmit={e => save(e, true)} className="space-y-4"><Field label="Servicio realizado"><input className="module-input" name="title" required maxLength={120} placeholder="Cambio de aceite" /></Field><div className="grid sm:grid-cols-3 gap-4"><Field label="Fecha"><input className="module-input" name="date" type="date" required defaultValue={today()} max={today()} /></Field><Field label="Kilometraje del servicio"><input className="module-input" name="km" type="number" min="0" step="1" required defaultValue={moto.odometer} /></Field><Field label="Costo (COP)"><input className="module-input" name="cost" type="number" min="0" step="0.01" required defaultValue="0" /></Field></div><Field label="Notas"><textarea className="module-input" name="notes" maxLength={2000} /></Field><p className="text-xs text-text-secondary">El costo queda en este historial. Registra el gasto en Finanzas para descontarlo de una cuenta.</p><SaveButton busy={busy}>Registrar servicio</SaveButton></form></Panel>}
    <Panel title="Historial">{data.history.length === 0 ? <p className="text-sm text-text-secondary">No hay mantenimientos registrados.</p> : data.history.map(item => <article key={item.id} className="border-b border-border pb-3"><div className="flex justify-between gap-3"><h3 className="font-bold">{item.title}</h3><span>{money(Number(item.cost))}</span></div><p className="text-sm text-text-secondary">{dateLabel(item.performed_on)} · {Number(item.odometer).toLocaleString('es-CO')} km</p><p className="text-sm whitespace-pre-wrap">{item.notes}</p></article>)}</Panel></>}
  </Module>;
}
