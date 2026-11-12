import { useState, type FormEvent } from 'react';
import { Panel, Field, SaveButton, Feedback } from '../ui/Module';
import { planningService } from '../../services/planning.service';
import { planningSnapshot } from '../../lib/planning';
import { today, money, dateLabel, errorMessage } from '../../lib/life';
import type { PlanningSettings } from '../../types/planning';
import type { Debt } from '../../types/life';

export function DebtTerms({ debt, reload }: { debt: Debt; reload: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setError('');
    try { await planningService.updateDebtTerms(debt.id, Number(f.get('rate')), Number(f.get('minimum'))); await reload(); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <details><summary className="text-sm text-primary cursor-pointer">Interés y cuota mínima</summary><form onSubmit={save} className="space-y-3 mt-3"><div className="grid sm:grid-cols-2 gap-3"><Field label="Interés efectivo anual (% E.A.)"><input className="module-input" type="number" name="rate" required min="0" max="1000" step="0.0001" defaultValue={debt.annual_interest_rate || 0} /></Field><Field label="Cuota mínima mensual (COP)"><input className="module-input" type="number" name="minimum" required min="0" step="0.01" defaultValue={debt.minimum_payment || 0} /></Field></div><Feedback error={error} /><SaveButton busy={busy}>Actualizar condiciones</SaveButton></form></details>;
}

export function PersonalPlan({ data, reload, onPay }: { data: Awaited<ReturnType<typeof planningService.overview>>; reload: () => Promise<void>; onPay: (id: string, amount: number) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const plan = planningSnapshot(data, today());
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setError('');
    try {
      await planningService.saveSettings({ ...data.settings, debt_percent: Number(f.get('percent')), daily_essentials: Number(f.get('essentials')), cash_buffer: Number(f.get('buffer')), strategy: String(f.get('strategy')) as PlanningSettings['strategy'] });
      await reload();
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <Panel title="Tu plan para salir de deudas">
    <p className="text-sm text-text-secondary">Primero tus gastos diarios y tu moto; después, hasta el {data.settings.debt_percent} % del ingreso restante para deudas. Las sugerencias se actualizan con tus movimientos. Tú confirmas cada abono.</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[['Ingresos de hoy', plan.budget.income], ['Apartar para moto hoy', plan.budget.provision], ['Abono adicional de hoy', plan.budget.debt], ['Te queda hoy', plan.budget.forYou]].map(([label, amount]) => <div className="bg-background rounded-xl p-4" key={label}><p className="text-xs text-text-secondary">{label}</p><p className="text-xl font-bold mt-2">{money(Number(amount))}</p></div>)}
    </div>
    <p className="text-sm">Ya abonaste hoy: <strong>{money(plan.debtPaid)}</strong>. Ya apartaste para moto: <strong>{money(plan.funded)}</strong>.</p>
    {plan.budget.income === 0 && <p className="text-sm text-orange-700">Aún no hay ingresos registrados hoy: no se propone un abono con ingresos que todavía no has recibido.</p>}
    {plan.budget.shortfall > 0 && <p className="text-sm text-orange-700">Hoy faltan {money(plan.budget.shortfall)} para cubrir la provisión de moto. El cálculo no usa crédito ni tu colchón para completarla.</p>}
    {data.settings.daily_essentials === 0 && <p className="text-sm text-orange-700">Configura abajo tu mínimo diario para comida, combustible y otros gastos. Mientras esté en cero, el cálculo solo protege gastos ya registrados y tu colchón.</p>}
    {plan.allocation.minimumShortfall > 0 && <p role="alert" className="text-sm text-red-700">El presupuesto no alcanza para el ritmo requerido por las cuotas mínimas: faltan {money(plan.allocation.minimumShortfall)} hoy. Revisa vencimientos y cuotas con tus acreedores.</p>}
    <div className="space-y-3">{plan.allocation.rows.map(({ debt, amount }, index) => <div className="flex flex-wrap justify-between items-center gap-3 border-b border-border pb-3" key={debt.id}><div><p className="font-semibold">{index + 1}. {debt.name}</p><p className="text-xs text-text-secondary">{Number(debt.annual_interest_rate || 0)} % E.A. · cuota mínima {money(Number(debt.minimum_payment || 0))}/mes{debt.due_date && debt.due_date < today() ? ' · Vencida: revisar con el acreedor' : ''}</p></div><button className="module-button" disabled={amount <= 0} onClick={() => onPay(debt.id, amount)}>Abonar {money(amount)}</button></div>)}</div>
    <div className="bg-blue-50 rounded-xl p-4 space-y-2"><p className="font-semibold">{plan.projection?.days === 0 ? 'No tienes deudas pendientes.' : plan.projection ? `Podrías terminar aproximadamente el ${dateLabel(plan.projection.date)} (${plan.projection.days} días).` : 'No hay una fecha de pago estimable con el ritmo actual.'}</p><p className="text-xs text-text-secondary">Escenario con {money(plan.projectedDaily)} diarios, ingresos promedio de {money(plan.averageIncome)} sobre {plan.sampleDays} días calendario (máximo 30), gastos registrados y tasas E.A. que ingreses. No incluye cobros o cambios futuros del acreedor. La fecha cambia si cambian tus ingresos, gastos o recorridos.</p>{plan.sampleDays < 7 && <p className="text-xs text-orange-700">Hay menos de una semana de datos: esta proyección es preliminar.</p>}</div>
    <details><summary className="cursor-pointer text-sm font-semibold text-primary">Ajustar cuánto proteger y cómo pagar</summary><form key={JSON.stringify(data.settings)} onSubmit={save} className="space-y-4 mt-4"><div className="grid sm:grid-cols-2 gap-4">
      <Field label="Máximo para deudas (%)"><input className="module-input" name="percent" type="number" required min="0" max="100" defaultValue={data.settings.debt_percent} /></Field>
      <Field label="Mínimo para vivir y trabajar cada día (COP)"><input className="module-input" name="essentials" type="number" required min="0" step="0.01" defaultValue={data.settings.daily_essentials} /></Field>
      <Field label="Colchón que no quieres tocar (COP)"><input className="module-input" name="buffer" type="number" required min="0" step="0.01" defaultValue={data.settings.cash_buffer} /></Field>
      <Field label="Prioridad del dinero extra"><select className="module-input" name="strategy" defaultValue={data.settings.strategy}><option value="avalanche">Mayor interés primero</option><option value="snowball">Menor saldo primero</option></select></Field>
    </div><p className="text-xs text-text-secondary">Se cubre primero el ritmo de las cuotas mínimas registradas; el excedente sigue la prioridad elegida. Una sugerencia no sustituye el pago exigido por el acreedor.</p><Feedback error={error} /><SaveButton busy={busy}>Guardar preferencias</SaveButton></form></details>
  </Panel>;
}
