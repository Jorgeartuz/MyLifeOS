import { useEffect, useState, type FormEvent } from 'react';
import { Panel, Field, SaveButton, Feedback } from '../ui/Module';
import { planningService } from '../../services/planning.service';
import { planningSnapshot } from '../../lib/planning';
import { today, money, dateLabel, errorMessage } from '../../lib/life';
import type { MaintenancePlan } from '../../types/planning';

type Overview = Awaited<ReturnType<typeof planningService.overview>>;
export function MotoPlanning({ data, reload }: { data: Overview; reload: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState<MaintenancePlan | null>(null);
  const [selected, setSelected] = useState('');
  useEffect(() => { if (selected) document.getElementById('planned-service')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [selected]);
  useEffect(() => { if (editing) document.getElementById('service-plan')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [editing]);
  const snapshot = planningSnapshot(data, today());
  const moto = data.moto;
  async function action(work: () => Promise<void>, result: string) {
    setBusy(true); setError(''); setSuccess('');
    try { await work(); await reload(); setSuccess(result); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  function savePlan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const el = e.currentTarget;
    void action(async () => {
      await planningService.savePlan({ motorcycle_id: moto!.id, name: String(f.get('name')).trim(), interval_km: Number(f.get('interval')), last_service_km: Number(f.get('km')), last_service_date: String(f.get('date')), estimated_cost: Number(f.get('cost')), active: true }, editing?.id || undefined);
      el.reset(); setEditing(null);
    }, 'Plan guardado. La próxima fecha se recalculará con tu recorrido.');
  }
  function complete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    void action(async () => { await planningService.completeService(selected, String(f.get('date')), Number(f.get('km')), Number(f.get('cost')), String(f.get('notes')), f.get('fund') === 'on'); setSelected(''); }, 'Servicio registrado y próximo mantenimiento recalculado.');
  }
  function fund(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const el = e.currentTarget; const f = new FormData(el);
    void action(async () => { await planningService.fundMovement(String(f.get('account')), Number(f.get('amount')), f.get('mode') === 'refund'); el.reset(); }, 'Apartado actualizado y movimiento registrado en Finanzas.');
  }
  function mileage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    void action(() => planningService.saveSettings({ ...data.settings, daily_km: Number(f.get('daily')) }), 'Recorrido diario actualizado.');
  }
  const target = data.plans.find(p => p.id === selected);
  if (!moto) return null;
  return <div className="space-y-6">
    <Feedback error={error} success={success} />
    <Panel title="Prepárate para los próximos cambios">
      <p className="text-sm text-text-secondary">Recorrido usado: <strong>{snapshot.mileage.km.toLocaleString('es-CO', { maximumFractionDigits: 1 })} km por día calendario</strong> ({snapshot.mileage.source === 'readings' ? 'calculado con tus lecturas de los últimos 30 días' : 'estimación que puedes ajustar'}). Actualiza tu odómetro: con lecturas que cubran una semana se usará tu ritmo registrado.</p>
      {snapshot.forecasts.length === 0 && <p className="text-sm">Agrega abajo un plan para aceite, frenos, llantas u otro servicio. Usa el intervalo de tu manual o mecánico.</p>}
      {snapshot.forecasts.map(p => <article key={p.id} className="border border-border rounded-xl p-4 space-y-3"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{p.name}</h3><span className={p.remainingKm === 0 ? 'text-red-700 font-bold' : 'text-primary font-bold'}>{p.remainingKm === 0 ? 'Ya corresponde' : `Faltan ${p.remainingKm.toLocaleString('es-CO')} km`}</span></div>
        <p className="text-sm">Próximo: <strong>{p.nextKm.toLocaleString('es-CO')} km</strong> · {p.estimatedDate ? `aprox. ${dateLabel(p.estimatedDate)}` : 'Fecha pendiente: falta recorrido diario'}</p><p className="text-sm text-text-secondary">Último: {Number(p.last_service_km).toLocaleString('es-CO')} km, {dateLabel(p.last_service_date)}. Intervalo: {Number(p.interval_km).toLocaleString('es-CO')} km. Costo previsto: {money(Number(p.estimated_cost))}.</p>
        <div className="flex flex-wrap gap-4 text-sm"><button disabled={busy} className="module-button" onClick={() => setSelected(p.id)}>Registrar este cambio</button><button disabled={busy} className="text-primary" onClick={() => setEditing(p)}>Editar plan</button><button disabled={busy} className="text-red-700" onClick={() => { if (window.confirm(`¿Desactivar el plan «${p.name}»? Su historial se conservará.`)) void action(() => planningService.archivePlan(p.id), 'Plan desactivado.'); }}>Desactivar</button></div>
      </article>)}
      <p className="text-xs text-text-secondary">Las fechas son aproximadas; el kilometraje indicado por el fabricante tiene prioridad. No se fijan intervalos mecánicos automáticamente.</p>
      <form onSubmit={mileage} className="flex flex-wrap gap-3 items-end"><Field label="Estimación inicial de km diarios"><input className="module-input" name="daily" type="number" min="0" max="2000" step="0.1" required defaultValue={data.settings.daily_km} /></Field><SaveButton busy={busy}>Actualizar recorrido</SaveButton></form>
    </Panel>
    {target && <Panel title={`Registrar ${target.name}`}><form id="planned-service" key={target.id} onSubmit={complete} className="space-y-4"><div className="grid sm:grid-cols-3 gap-4"><Field label="Fecha del servicio"><input className="module-input" name="date" type="date" min={target.last_service_date} max={today()} defaultValue={today()} required /></Field><Field label="Kilometraje real del servicio"><input className="module-input" name="km" type="number" min={target.last_service_km} step="1" required defaultValue={moto.odometer} /></Field><Field label="Costo real (COP)"><input className="module-input" name="cost" type="number" min="0" step="0.01" required defaultValue={target.estimated_cost} /></Field></div><Field label="Notas"><textarea className="module-input" name="notes" maxLength={2000} /></Field><label className="flex gap-2 text-sm items-center"><input type="checkbox" name="fund" />Pagar con mi apartado moto ({money(Number(data.fund.balance))})</label><p className="text-xs text-text-secondary">Si usas el apartado, se descuenta su saldo y se evita cobrarlo nuevamente de tus cuentas. Si pagas por fuera del apartado, registra ese gasto en Finanzas.</p><div className="flex gap-3"><SaveButton busy={busy}>Guardar y calcular próximo</SaveButton><button type="button" disabled={busy} onClick={() => setSelected('')}>Cancelar</button></div></form></Panel>}
    <Panel title="Mi apartado para la moto"><div className="grid sm:grid-cols-3 gap-4">{[['Ya apartado', Number(data.fund.balance)], ['Conviene apartar por día', snapshot.provision], ['Puedes apartar hoy', snapshot.budget.provision]].map(([label, value]) => <div key={label} className="bg-background p-4 rounded-xl"><p className="text-xs text-text-secondary">{label}</p><p className="text-xl font-bold mt-2">{money(Number(value))}</p></div>)}</div>
      <p className="text-sm text-text-secondary">La provisión suma el desgaste de cada plan y lo que falta para llegar a sus próximos servicios. El dinero apartado sale del saldo disponible de tus cuentas y queda separado aquí; no se usa para sugerir abonos a deudas.</p>
      <form onSubmit={fund} className="space-y-4"><div className="grid sm:grid-cols-3 gap-4"><Field label="Cuenta"><select className="module-input" name="account" required><option value="">Seleccionar</option>{data.accounts.filter(a => a.type !== 'credit_card').map(a => <option key={a.id} value={a.id}>{a.name} · {money(Number(a.balance))}</option>)}</select></Field><Field label="Monto (COP)"><input className="module-input" name="amount" type="number" min="0.01" step="0.01" required /></Field><Field label="Movimiento"><select className="module-input" name="mode"><option value="contribution">Apartar desde la cuenta</option><option value="refund">Devolver a la cuenta</option></select></Field></div><p className="text-xs text-text-secondary">Es una separación dentro de MyLifeOs: mueve también el dinero en tu banco si deseas separarlo físicamente. En Finanzas, el aporte se cuenta como salida al apartado y un retiro como entrada; el servicio pagado con ese fondo no se cobra otra vez.</p><SaveButton busy={busy}>Confirmar movimiento</SaveButton></form>
      <details><summary className="cursor-pointer text-sm text-primary">Últimos movimientos del apartado</summary><div className="mt-3 divide-y divide-border">{data.movements.length === 0 && <p className="text-sm text-text-secondary">Todavía no hay movimientos.</p>}{data.movements.map(m => <div key={m.id} className="py-2 flex flex-wrap justify-between gap-2 text-sm"><span>{m.description} · {new Date(m.created_at).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}</span><strong>{m.kind === 'contribution' ? '+' : '−'}{money(Number(m.amount))}</strong></div>)}</div></details>
    </Panel>
    <Panel title={editing ? `Editar ${editing.name}` : 'Programar un mantenimiento recurrente'}><form id="service-plan" key={editing?.id || editing?.name || 'new'} onSubmit={savePlan} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><Field label="Servicio"><input className="module-input" name="name" required maxLength={120} placeholder="Cambio de aceite" defaultValue={editing?.name} /></Field><Field label="Repetir cada cuántos km"><input className="module-input" name="interval" type="number" min="1" max="1000000" step="1" required defaultValue={editing?.interval_km} /></Field><Field label="Km del último servicio"><input className="module-input" name="km" type="number" min="0" max={moto.odometer} step="1" required defaultValue={editing?.last_service_km ?? moto.odometer} /></Field><Field label="Fecha del último servicio"><input className="module-input" name="date" type="date" max={today()} required defaultValue={editing?.last_service_date || today()} /></Field><Field label="Costo previsto del próximo servicio (COP)"><input className="module-input" name="cost" type="number" min="0" step="0.01" required defaultValue={editing?.estimated_cost} /></Field></div>
      {data.history.length > 0 && <Field label="Usar un servicio de mi historial como punto de partida"><select className="module-input" value="" onChange={e => { const h = data.history.find(item => item.id === e.target.value); if (h) setEditing({ id: '', motorcycle_id: moto.id, name: h.title, last_service_km: Number(h.odometer), last_service_date: h.performed_on, estimated_cost: Number(h.cost), interval_km: 0, active: true }); }}><option value="">Seleccionar servicio anterior</option>{data.history.map(h => <option value={h.id} key={h.id}>{h.title} · {Number(h.odometer).toLocaleString('es-CO')} km</option>)}</select></Field>}
      <div className="flex gap-3"><SaveButton busy={busy}>Guardar plan</SaveButton>{editing && <button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button>}</div></form></Panel>
  </div>;
}
