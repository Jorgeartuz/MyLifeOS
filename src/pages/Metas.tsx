import { useState } from 'react';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { ContributionModal } from '../components/goals/ContributionModal';
import { Module, Panel } from '../components/ui/Module';
import { usePlanningOverview } from '../hooks/usePlanningOverview';
import { planningSnapshot } from '../lib/planning';
import { today, money } from '../lib/life';
import type { SavingsGoal } from '../types/goals';

export default function Metas() {
  const { data, loading, error, reload } = usePlanningOverview();
  const [isGoalOpen, setGoalOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [selected, setSelected] = useState<{ goal: SavingsGoal; amount?: number } | null>(null);
  const plan = data ? planningSnapshot(data, today()) : null;
  return <Module title="Mis metas" subtitle="Tu fecha límite marca el ritmo; tus ingresos reales determinan cuánto puedes aportar hoy." loading={loading} error={error} onRetry={reload}>
    <button className="module-button" onClick={() => { setEditing(null); setGoalOpen(true); }}>Nueva meta</button>
    {data && plan && <>
      <Panel title="Ahorro posible hoy"><p className="text-3xl font-bold text-primary">{money(plan.goals.total)}</p><p className="text-sm text-text-secondary">Hasta el {data.settings.goal_percent} % del remanente, después de gastos, personales, moto y deudas, conservando tu colchón. Ya ahorraste {money(plan.goalPaid)} hoy.</p>{plan.goals.shortfall > 0 && <p className="text-sm text-orange-700">Faltan {money(plan.goals.shortfall)} para cubrir el ritmo diario de todas las metas con fecha. Puedes ajustar la fecha o el objetivo; no se toma dinero protegido.</p>}</Panel>
      {data.goals.length === 0 ? <Panel title="Tu primera meta"><p className="text-sm text-text-secondary">Crea una meta con monto y fecha. El sistema calculará su plan y la incluirá en el reparto diario.</p></Panel> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{data.goals.map(goal => <GoalCard key={goal.id} goal={goal} suggestedAmount={plan.goals.rows.find(r => r.goal.id === goal.id)?.amount || 0} projectedDaily={plan.goalProjection.rows.find(r => r.goal.id === goal.id)?.amount || 0} onAddFunds={(g, amount) => setSelected({ goal: g, amount })} onEdit={g => { setEditing(g); setGoalOpen(true); }} />)}</div>}
      {selected && <ContributionModal key={`${selected.goal.id}-${selected.amount ?? 'manual'}`} isOpen onClose={() => setSelected(null)} goal={selected.goal} initialAmount={selected.amount} accounts={data.accounts} onSuccess={reload} />}
    </>}
    {isGoalOpen && <GoalModal key={editing?.id || 'new'} isOpen onClose={() => setGoalOpen(false)} onSuccess={reload} goal={editing} />}
  </Module>;
}