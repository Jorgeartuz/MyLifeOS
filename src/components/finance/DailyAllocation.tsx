import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Field, SaveButton, Feedback } from '../ui/Module';
import { ContributionModal } from '../goals/ContributionModal';
import { usePlanningOverview } from '../../hooks/usePlanningOverview';
import { planningService } from '../../services/planning.service';
import { planningSnapshot } from '../../lib/planning';
import { today, money, errorMessage } from '../../lib/life';
import type { SavingsGoal } from '../../types/goals';
import type { PlanningSettings } from '../../types/planning';

export function DailyAllocationPanel({ data, error, loading, reload }: ReturnType<typeof usePlanningOverview>) {
  const [busy, setBusy] = useState(false); const [formError, setFormError] = useState('');
  const [selected, setSelected] = useState<{ goal: SavingsGoal; amount: number } | null>(null);
  const plan = data ? planningSnapshot(data, today()) : null;
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!data) return;
    const f = new FormData(e.currentTarget); setBusy(true); setFormError('');
    try {
      await planningService.saveSettings({ ...data.settings,
        debt_percent: Number(f.get('debt')), goal_percent: Number(f.get('goals')),
        daily_essentials: Number(f.get('work')), daily_personal: Number(f.get('personal')),
        cash_buffer: Number(f.get('buffer')), strategy: String(f.get('strategy')) as PlanningSettings['strategy'],
        personal_category_ids: f.getAll('personalCategories').map(String),
      });
      await reload();
    } catch (err) { setFormError(errorMessage(err)); } finally { setBusy(false); }
  }
  if (loading) return <div className="mb-6 p-4 bg-surface rounded-card border border-border text-sm text-text-secondary" role="status">Calculando tu reparto de hoy…</div>;
  if (!data || !plan) return <div className="mb-6 p-4 bg-surface rounded-card border border-border"><Feedback error={error} /><button className="text-sm text-primary mt-2" onClick={reload}>Recalcular reparto</button></div>;
  const assigned = plan.workRemaining + plan.personalRemaining + plan.budget.provision + plan.budget.debt + plan.goals.total;
  const unavailable = Math.max(0, plan.budget.income - plan.spent - plan.debtPaid - plan.funded - plan.goalPaid - assigned - plan.base);
  return <div className="mb-8"><Panel title="Así puedes repartir lo que ganaste hoy">
    <Feedback error={error} />
    <div className="flex flex-wrap justify-between items-center gap-3"><p className="text-sm">Ingresos de hoy: <strong className="text-primary text-lg">{money(plan.budget.income)}</strong></p><button disabled={busy} className="text-sm text-primary" onClick={reload}>Recalcular</button></div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {[['Gastos generales / trabajo', plan.workRemaining], ['Tus gastos personales', plan.personalRemaining], ['Moto', plan.budget.provision], ['Deudas', plan.budget.debt], ['Metas', plan.goals.total], ['Base que te queda', plan.base]].map(([label, value]) => <div key={label} className={`p-4 rounded-xl border ${label === 'Base que te queda' ? 'bg-green-50 border-green-200' : 'bg-background border-border'}`}><p className="text-xs text-text-secondary">{label}</p><p className="text-xl font-bold mt-1">{money(Number(value))}</p></div>)}
    </div>
    <p className="text-xs text-text-secondary">Importes pendientes por reservar o aportar. Ya registraste {money(plan.spent)} en gastos, {money(plan.funded)} para moto, {money(plan.debtPaid)} en deudas y {money(plan.goalPaid)} en metas hoy: se descuentan del reparto.</p>
    <p className="text-sm">Tu base incluye hasta <strong>{money(plan.protectedBase)}</strong> de colchón protegido; quedan <strong>{money(plan.freeBase)}</strong> libres por encima de ese colchón.</p>
    <p className="text-xs text-text-secondary">Saldo líquido actual: {money(plan.liquid)}. Los apartados de moto y metas ya están fuera de ese saldo. Las sugerencias usan el ingreso recibido hoy y el saldo sin crédito; no mueven dinero por sí solas.</p>
    {plan.budget.income === 0 && <p className="text-sm text-orange-700">Aún no hay ingresos de hoy. No se sugieren aportes con ganancias futuras.</p>}
    {unavailable > 0.01 && <p className="text-sm text-orange-700">{money(unavailable)} del ingreso registrado no están disponibles en el saldo de cuentas para este reparto.</p>}
    {(plan.budget.shortfall > 0 || plan.goals.shortfall > 0 || plan.allocation.minimumShortfall > 0) && <p role="status" className="text-sm text-orange-700">El ritmo de hoy no alcanza para todo: moto {money(plan.budget.shortfall)}, cuotas de deuda {money(plan.allocation.minimumShortfall)}, metas con fecha {money(plan.goals.shortfall)} pendientes de cubrir. Revisa montos o fechas; el cálculo conserva los importes protegidos.</p>}
    {plan.livingShortfall > 0 && <p role="status" className="text-sm text-red-700">Faltan {money(plan.livingShortfall)} para cubrir tus gastos diarios y personales mínimos. No se sugieren aportes que comprometan esos mínimos.</p>}
    {Number(data.settings.daily_essentials) + Number(data.settings.daily_personal) === 0 && <p className="text-sm text-orange-700">Configura abajo tus gastos diarios y personales para protegerlos antes de ahorrar.</p>}
    <details><summary className="cursor-pointer text-sm font-semibold text-primary">Ver a qué deuda y a qué meta aportar</summary><div className="mt-4 space-y-3">{plan.allocation.rows.filter(r => r.amount > 0).map(r => <div className="flex flex-wrap justify-between gap-2 text-sm" key={r.debt.id}><span>Deuda · {r.debt.name}: <strong>{money(r.amount)}</strong></span><Link to="/deudas" className="text-primary">Ver abonos</Link></div>)}{plan.goals.rows.map(r => <div className="flex flex-wrap justify-between items-center gap-2 text-sm" key={r.goal.id}><span>Meta · {r.goal.name}: <strong>{money(r.amount)}</strong>{r.shortfall > 0 ? ` · faltan ${money(r.shortfall)} para el ritmo de hoy` : ''}</span><button className="module-button" disabled={r.amount <= 0} onClick={() => setSelected({ goal: r.goal, amount: r.amount })}>Guardar este aporte</button></div>)}<div className="flex flex-wrap gap-4 text-sm text-primary"><Link to="/metas">Ver planes de metas</Link><Link to="/moto">Apartar para la moto</Link><Link to="/finanzas">Registrar un gasto</Link></div></div></details>
    <details><summary className="cursor-pointer text-sm font-semibold text-primary">Configurar el reparto de mis ingresos</summary><form key={JSON.stringify(data.settings)} onSubmit={save} className="space-y-4 mt-4"><div className="grid sm:grid-cols-2 gap-4">
      <Field label="Gastos generales / trabajo al día (COP)"><input className="module-input" type="number" name="work" min="0" step="0.01" required defaultValue={data.settings.daily_essentials} /></Field>
      <Field label="Gastos personales al día (COP)"><input className="module-input" type="number" name="personal" min="0" step="0.01" required defaultValue={data.settings.daily_personal} /></Field>
      <Field label="Máximo para deudas (%) después de moto"><input className="module-input" type="number" name="debt" min="0" max="100" required defaultValue={data.settings.debt_percent} /></Field>
      <Field label="Máximo para metas (%) del remanente"><input className="module-input" type="number" name="goals" min="0" max="100" required defaultValue={data.settings.goal_percent} /></Field>
      <Field label="Colchón mínimo que no quieres tocar (COP)"><input className="module-input" type="number" name="buffer" min="0" step="0.01" required defaultValue={data.settings.cash_buffer} /></Field>
      <Field label="Prioridad del excedente para deudas"><select className="module-input" name="strategy" defaultValue={data.settings.strategy}><option value="avalanche">Mayor interés primero</option><option value="snowball">Menor saldo primero</option></select></Field>
    </div><Field label="Categorías de tus gastos personales"><select className="module-input min-h-28" name="personalCategories" multiple defaultValue={data.settings.personal_category_ids}>{data.categories.filter(c => c.type !== 'income').map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></Field><p className="text-xs text-text-secondary">Selecciona las categorías personales para que sus gastos reduzcan ese presupuesto. Los demás gastos reducen el presupuesto general/trabajo. El mínimo general anterior incluía todo: ajústalo si ahora separas personales para no duplicarlos.</p><Feedback error={formError} /><SaveButton busy={busy}>Guardar reparto</SaveButton></form></details>
    {selected && <ContributionModal key={`${selected.goal.id}-${selected.amount}`} isOpen onClose={() => setSelected(null)} goal={selected.goal} initialAmount={selected.amount} accounts={data.accounts} onSuccess={reload} />}
  </Panel></div>;
}

export function DailyAllocation() {
  return <DailyAllocationPanel {...usePlanningOverview()} />;
}
