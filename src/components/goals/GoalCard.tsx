import { Target } from 'lucide-react';
import type { SavingsGoal } from '../../types/goals';
import { goalSchedule, goalCompletionDate } from '../../lib/goalPlanning';
import { today, money, dateLabel } from '../../lib/life';

interface Props {
  goal: SavingsGoal;
  suggestedAmount?: number;
  projectedDaily?: number;
  onAddFunds: (goal: SavingsGoal, amount?: number) => void;
  onEdit?: (goal: SavingsGoal) => void;
}
export const GoalCard = ({ goal, onAddFunds, onEdit, suggestedAmount = 0, projectedDaily = 0 }: Props) => {
  const plan = goalSchedule(goal, today());
  const current = Number(goal.current_amount || 0);
  const progress = Number(goal.target_amount) > 0 ? Math.min(100, Math.round(current / Number(goal.target_amount) * 100)) : 0;
  const completion = plan.active ? goalCompletionDate(plan.remaining, projectedDaily, today()) : null;
  const statuses = { active: 'Activa', completed: 'Completada', paused: 'Pausada', cancelled: 'Cancelada' };
  return <article className="bg-surface p-6 rounded-card border border-border shadow-sm space-y-4">
    <div className="flex justify-between gap-3 items-center"><Target className="text-primary" size={24} /><span className="text-xs font-bold text-primary">{plan.remaining === 0 ? 'Completada' : statuses[goal.status]}</span></div>
    <div><h3 className="font-bold text-lg">{goal.name}</h3><p className={plan.overdue ? 'text-sm text-red-700' : 'text-sm text-text-secondary'}>{goal.target_date ? `Fecha límite: ${dateLabel(goal.target_date)}${plan.overdue ? ' · Vencida' : ''}` : 'Sin fecha límite'}</p></div>
    <div><div className="flex justify-between gap-2 text-xs mb-2"><span>{progress} %</span><span>{money(current)} / {money(Number(goal.target_amount))}</span></div><div className="h-2 rounded-full overflow-hidden bg-background" role="progressbar" aria-label={`Progreso de ${goal.name}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div></div>
    <p className="text-sm">Te faltan <strong>{money(plan.remaining)}</strong>.</p>
    {plan.active && <>
      {plan.daily !== null ? <div className="space-y-2"><p className="text-xs text-text-secondary">Ritmos alternativos para tu fecha; no se suman entre sí. Los aportes comienzan hoy.</p><div className="grid grid-cols-3 gap-2">{[['Diario', plan.daily], ['Semanal', plan.weekly], ['Mensual', plan.monthly]].map(([label, amount]) => <div key={label} className="bg-background rounded-xl p-2"><p className="text-xs text-text-secondary">{label}</p><p className="font-bold text-sm mt-1">{money(Number(amount))}</p></div>)}</div><p className="text-xs text-text-secondary">Quedan {plan.days} días calendario, {plan.weeks} aportes semanales o {plan.months} mensuales. El diario ya descuenta lo que ahorraste hoy.</p></div> : <p className="text-xs text-text-secondary">Añade una fecha límite para calcular aportes diarios, semanales y mensuales.</p>}
      <div className="p-3 bg-blue-50 rounded-xl space-y-1"><p className="text-sm">Con tus ingresos de hoy: <strong>{money(suggestedAmount)}</strong>.</p><p className="text-xs text-text-secondary">Ya aportaste hoy {money(plan.paidToday)}. Esta sugerencia comparte el mismo presupuesto de moto, deudas y gastos.</p>{plan.daily !== null && suggestedAmount < plan.daily && <p className="text-xs text-orange-700">Hoy faltan {money(plan.daily - suggestedAmount)} para sostener la fecha.</p>}</div>
      <p className="text-xs text-text-secondary">{completion ? `Con tu ritmo estimado de ${money(projectedDaily)}/día, terminarías aprox. el ${dateLabel(completion)}${goal.target_date && completion > goal.target_date ? ', después de la fecha límite' : ''}.` : 'Aún no hay un ritmo de ingresos suficiente para estimar cuándo terminarías.'} Es un escenario, no una fecha garantizada.</p>
      <button className="module-button w-full" disabled={suggestedAmount <= 0} onClick={() => onAddFunds(goal, suggestedAmount)}>Guardar {money(suggestedAmount)} hoy</button>
    </>}
    <div className="flex flex-wrap justify-between gap-3 text-sm">{plan.active && <button className="text-primary" onClick={() => onAddFunds(goal)}>Elegir otro aporte</button>}{onEdit && <button className="text-primary" onClick={() => onEdit(goal)}>Ajustar monto o fecha</button>}</div>
  </article>;
};
