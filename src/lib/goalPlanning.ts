import type { SavingsGoal } from '../types/goals';

const dayNumber = (date: string) => Date.parse(`${date.slice(0, 10)}T00:00:00Z`) / 86400000;
const up = (n: number) => Math.max(0, Math.ceil((n - 1e-8) * 100) / 100);
const down = (n: number) => Math.max(0, Math.floor((n + 1e-8) * 100) / 100);
export const bogotaDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : new Date(new Date(value).getTime() - 5 * 3600000).toISOString().slice(0, 10);

export function goalCompletionDate(remaining: number, daily: number, date: string) {
  if (daily <= 0 || remaining <= 0) return null;
  const days = Math.ceil(remaining / daily);
  if (!Number.isFinite(days) || days > 3650) return null;
  return new Date((dayNumber(date) + Math.max(0, days - 1)) * 86400000).toISOString().slice(0, 10);
}

export function goalSchedule(goal: SavingsGoal, date: string) {
  const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount || 0));
  const paidToday = (goal.goal_contributions || []).filter(c => bogotaDay(c.contribution_date) === date).reduce((sum, c) => sum + Number(c.amount), 0);
  const active = goal.status === 'active' && remaining > 0;
  const overdue = !!goal.target_date && goal.target_date < date && remaining > 0;
  const days = goal.target_date ? Math.max(1, dayNumber(goal.target_date) - dayNumber(date) + 1) : null;
  const weeks = days === null ? null : Math.floor((days - 1) / 7) + 1;
  // Calendar-month deposits start today and keep the same anchor day, clamped in short months.
  let months: number | null = null;
  if (goal.target_date) {
    const [year, month, day] = date.split('-').map(Number);
    const end = new Date(`${goal.target_date}T00:00:00Z`);
    const offset = Math.max(0, (end.getUTCFullYear() - year) * 12 + end.getUTCMonth() - (month - 1));
    const last = new Date(Date.UTC(year, month + offset, 0)).getUTCDate();
    const deposit = new Date(Date.UTC(year, month - 1 + offset, Math.min(day, last)));
    months = Math.max(1, offset + 1 - (deposit > end ? 1 : 0));
  }
  // Start-of-day outstanding amount prevents the daily quota shrinking twice after a contribution.
  const daily = days === null ? null : Math.min(remaining, Math.max(0, up((remaining + paidToday) / days) - paidToday));
  return { goal, remaining, paidToday, active, overdue, days, weeks, months, daily,
    weekly: weeks === null ? null : up(remaining / weeks), monthly: months === null ? null : up(remaining / months) };
}

export function allocateGoals(goals: SavingsGoal[], budget: number, date: string) {
  const schedules = goals.map(g => goalSchedule(g, date));
  let available = down(budget);
  const ordered = schedules.filter(s => s.active).sort((a,b) => (a.goal.target_date || '9999').localeCompare(b.goal.target_date || '9999') || a.goal.id.localeCompare(b.goal.id));
  const rows = ordered.map(schedule => {
    const need = schedule.daily ?? schedule.remaining;
    const amount = down(Math.min(available, need, schedule.remaining));
    available = down(available - amount);
    return { ...schedule, amount, shortfall: schedule.daily === null ? 0 : up(Math.max(0, schedule.daily - amount)) };
  });
  return { rows, total: down(rows.reduce((sum,r) => sum + r.amount, 0)), shortfall: up(rows.reduce((sum,r) => sum + r.shortfall, 0)) };
}
