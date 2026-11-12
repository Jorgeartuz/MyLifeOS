import type { Transaction } from '../types/finance';
import type { WorkDelivery, WorkPeriod } from '../types/work';
import type { CalendarEvent } from '../types/life';
import type { planningService } from '../services/planning.service';
import { addDays, planningSnapshot } from './planning';
import { bogotaDay } from './goalPlanning';
import { automaticEvents, debtRemaining } from './life';

type Overview = Awaited<ReturnType<typeof planningService.overview>>;
export function dashboardWindow(period: WorkPeriod, date: string) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  const start = period === 'hoy' ? date : period === 'mes' ? `${date.slice(0,7)}-01` : addDays(date, -(day === 0 ? 6 : day - 1));
  const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;
  return { start, end: addDays(date, 1), previousStart: addDays(start, -days), days };
}

export function dashboardAnalytics(overview: Overview, ledger: Transaction[], deliveries: WorkDelivery[], events: CalendarEvent[], period: WorkPeriod, date: string) {
  const window = dashboardWindow(period, date);
  const plan = planningSnapshot(overview, date);
  const isReserve = (t: Transaction) => t.source === 'moto_reserve' || t.source === 'goal_contribution' || !!t.description?.startsWith('Aporte a meta: ');
  const summarize = (rows: Transaction[]) => ({
    income: rows.filter(t => t.type === 'income' && t.source !== 'moto_reserve_refund').reduce((sum,t) => sum + Number(t.amount),0),
    expenses: rows.filter(t => t.type === 'expense' && !isReserve(t)).reduce((sum,t) => sum + Number(t.amount),0),
    reserved: rows.filter(t => t.type === 'expense' && isReserve(t)).reduce((sum,t) => sum + Number(t.amount),0),
    cashflow: rows.reduce((sum,t) => sum + (t.type === 'income' ? Number(t.amount) : t.type === 'expense' ? -Number(t.amount) : 0),0),
  });
  const current = ledger.filter(t => bogotaDay(t.transaction_date) >= window.start && bogotaDay(t.transaction_date) < window.end);
  const previous = ledger.filter(t => bogotaDay(t.transaction_date) >= window.previousStart && bogotaDay(t.transaction_date) < window.start);
  const totals = summarize(current); const prior = summarize(previous);
  const change = (value: number, before: number) => before === 0 ? null : Math.round((value - before) / before * 1000) / 10;
  const chart = Array.from({ length: window.days }, (_,i) => {
    const day = addDays(window.start, i);
    return { date: day, ...summarize(current.filter(t => bogotaDay(t.transaction_date) === day)) };
  });
  const activeGoals = overview.goals.filter(g => g.status === 'active' && Number(g.current_amount || 0) < Number(g.target_amount))
    .sort((a,b) => (a.target_date || '9999').localeCompare(b.target_date || '9999'));
  const work = deliveries.filter(d => bogotaDay(d.created_at) >= window.start && bogotaDay(d.created_at) < window.end).reduce((sum,d) => ({
    count: sum.count + 1, gross: sum.gross + Number(d.amount), net: sum.net + Number(d.net_amount),
    commissions: sum.commissions + Number(d.commission_amount), cash: sum.cash + (d.payment_method === 'cash' ? Number(d.net_amount) : 0),
    transfer: sum.transfer + (d.payment_method === 'transfer' ? Number(d.net_amount) : 0),
  }), { count: 0, gross: 0, net: 0, commissions: 0, cash: 0, transfer: 0 });
  const deadlines = [
    ...automaticEvents(overview.debts, overview.moto).map(e => ({ id: e.id, title: e.title, date: e.event_date, href: e.href, approximate: false })),
    ...events.filter(e => !e.completed).map(e => ({ id: `event-${e.id}`, title: e.title, date: e.event_date, href: '/calendario', approximate: false })),
    ...activeGoals.filter(g => g.target_date).map(g => ({ id: `goal-${g.id}`, title: `Meta: ${g.name}`, date: g.target_date!, href: '/metas', approximate: false })),
    ...plan.forecasts.filter(p => p.estimatedDate).map(p => ({ id: `service-${p.id}`, title: p.name, date: p.estimatedDate!, href: '/moto', approximate: true })),
  ].filter(e => e.date <= addDays(date, 30)).sort((a,b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return {
    window, totals, incomeChange: change(totals.income, prior.income), expenseChange: change(totals.expenses, prior.expenses),
    chart, work, activeGoals, deadlines, plan,
    liquid: overview.accounts.filter(a => a.type !== 'credit_card').reduce((sum,a) => sum + Math.max(0, Number(a.balance)),0),
    creditDebt: overview.accounts.filter(a => a.type === 'credit_card').reduce((sum,a) => sum + Math.max(0, -Number(a.balance)),0),
    debtRemaining: overview.debts.reduce((sum,d) => sum + debtRemaining(d),0),
    savings: overview.goals.reduce((sum,g) => sum + Number(g.current_amount || 0),0),
    recentTransactions: [...current].sort((a,b) => b.transaction_date.localeCompare(a.transaction_date)).slice(0, 6),
  };
}
