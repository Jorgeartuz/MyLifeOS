import type { Debt } from '../types/life';
import type { MaintenancePlan, OdometerReading, PlanningSettings } from '../types/planning';
import type { Account, Transaction } from '../types/finance';
import type { Motorcycle } from '../types/life';
import { debtRemaining } from './life';

export const defaultSettings: PlanningSettings = {
  debt_percent: 20, daily_essentials: 0, cash_buffer: 0, daily_km: 100, strategy: 'avalanche',
};
const cents = (n: number) => Math.max(0, Math.floor((n + 1e-8) * 100) / 100);
const dayNumber = (date: string) => Date.parse(`${date.slice(0, 10)}T00:00:00Z`) / 86400000;
export function addDays(date: string, days: number) {
  return new Date((dayNumber(date) + days) * 86400000).toISOString().slice(0, 10);
}

// Calendar-day use includes rest days. A manual estimate is used until readings span a week.
export function dailyMileage(readings: OdometerReading[], fallback: number) {
  const sorted = [...readings].sort((a, b) => a.reading_date.localeCompare(b.reading_date));
  const last = sorted.at(-1);
  const recent = last ? sorted.filter(r => dayNumber(last.reading_date) - dayNumber(r.reading_date) <= 30) : [];
  const first = recent[0];
  const span = last && first ? dayNumber(last.reading_date) - dayNumber(first.reading_date) : 0;
  if (span >= 7) return { km: Math.max(0, (Number(last!.odometer) - Number(first.odometer)) / span), source: 'readings' as const };
  return { km: Math.max(0, fallback), source: 'manual' as const };
}

export function maintenanceForecast(plans: MaintenancePlan[], odometer: number, kmPerDay: number, date: string) {
  return plans.filter(p => p.active).map(plan => {
    const nextKm = Number(plan.last_service_km) + Number(plan.interval_km);
    const remainingKm = Math.max(0, nextKm - odometer);
    const days = remainingKm === 0 ? 0 : kmPerDay > 0 ? Math.ceil(remainingKm / kmPerDay) : null;
    return { ...plan, nextKm, remainingKm, days, estimatedDate: days === null ? null : addDays(date, days), dailyProvision: kmPerDay > 0 ? Number(plan.estimated_cost) * kmPerDay / Number(plan.interval_km) : 0 };
  }).sort((a, b) => a.remainingKm - b.remainingKm);
}

// Provision covers both normal wear and any unfunded portion of the next services.
export function motoProvision(forecasts: ReturnType<typeof maintenanceForecast>, fund: number) {
  let available = Math.max(0, fund);
  return forecasts.reduce((total, plan) => {
    const covered = Math.min(available, Number(plan.estimated_cost)); available -= covered;
    const gap = Math.max(0, Number(plan.estimated_cost) - covered);
    const catchUp = plan.days === null ? 0 : gap / Math.max(1, plan.days);
    return total + Math.max(plan.dailyProvision, catchUp);
  }, 0);
}

export function dailyBudget(input: {
  income: number; essentials: number; spent: number; debtPaid: number;
  motoNeeded: number; motoFunded: number; percent: number; liquid: number; buffer: number;
}) {
  const income = Math.max(0, input.income);
  const living = Math.max(input.essentials, input.spent);
  const moto = Math.max(0, input.motoNeeded - input.motoFunded);
  const rate = Math.min(100, Math.max(0, input.percent)) / 100;
  // Today's funded provision and debt payments are not available again after a refresh.
  const room = Math.max(0, income - living - input.motoFunded - input.debtPaid);
  const cashRoom = Math.max(0, input.liquid - input.buffer - Math.max(0, input.essentials - input.spent));
  const provision = cents(Math.min(moto, room, cashRoom));
  const debtCap = Math.max(0, (income - input.motoFunded - provision) * rate - input.debtPaid);
  const debt = cents(Math.min(debtCap, Math.max(0, room - provision), Math.max(0, cashRoom - provision)));
  return { income, living, provision, debt, forYou: cents(Math.min(Math.max(0, input.liquid - provision - debt), Math.max(0, income - input.spent - input.motoFunded - input.debtPaid - provision - debt))), shortfall: cents(Math.max(0, moto - provision)) };
}

export function planningSnapshot(data: {
  settings: PlanningSettings; plans: MaintenancePlan[]; readings: OdometerReading[];
  fund: { balance: number }; moto: Motorcycle | null; debts: Debt[]; accounts: Account[]; transactions: Transaction[];
}, date: string) {
  const mileage = dailyMileage(data.readings, Number(data.settings.daily_km));
  const forecasts = maintenanceForecast(data.plans, Number(data.moto?.odometer || 0), mileage.km, date);
  const localDay = (value: string) => new Date(new Date(value).getTime() - 5 * 3600000).toISOString().slice(0, 10);
  const transactions = data.transactions.filter(t => localDay(t.transaction_date) <= date);
  const current = transactions.filter(t => localDay(t.transaction_date) === date);
  const income = (rows: Transaction[]) => rows.filter(t => t.type === 'income' && t.source !== 'moto_reserve_refund').reduce((s,t) => s + Number(t.amount), 0);
  const paidIds = new Set(data.debts.flatMap(d => d.debt_payments.map(p => p.financial_transaction_id)));
  const livingSpent = (rows: Transaction[]) => rows.filter(t => t.type === 'expense' && t.source !== 'moto_reserve' && !paidIds.has(t.id)).reduce((s,t) => s + Number(t.amount), 0);
  const debtPaid = data.debts.flatMap(d => d.debt_payments).filter(p => p.paid_on === date).reduce((s,p) => s + Number(p.amount),0);
  const funded = current.filter(t => t.source === 'moto_reserve').reduce((s,t) => s + Number(t.amount),0);
  // Reconstruct the pre-contribution fund so today's catch-up is not reduced twice.
  const refunded = current.filter(t => t.source === 'moto_reserve_refund').reduce((s,t) => s + Number(t.amount),0);
  const netFunded = Math.max(0, funded - refunded);
  const provision = motoProvision(forecasts, Math.max(0, Number(data.fund.balance) - netFunded));
  const liquid = data.accounts.filter(a => a.type !== 'credit_card').reduce((s,a) => s + Math.max(0, Number(a.balance)),0);
  const budget = dailyBudget({ income: income(current), essentials: Number(data.settings.daily_essentials), spent: livingSpent(current), debtPaid, motoNeeded: provision, motoFunded: netFunded, percent: Number(data.settings.debt_percent), liquid, buffer: Number(data.settings.cash_buffer) });
  const firstDay = transactions.length ? transactions.map(t => localDay(t.transaction_date)).sort()[0] : date;
  const sampleDays = Math.max(1, Math.min(30, dayNumber(date) - dayNumber(firstDay) + 1));
  const averageIncome = income(transactions) / sampleDays;
  const averageSpending = livingSpent(transactions) / sampleDays;
  const futureBudget = dailyBudget({ income: averageIncome, essentials: Number(data.settings.daily_essentials), spent: averageSpending, debtPaid: 0, motoNeeded: motoProvision(forecasts, Number(data.fund.balance)), motoFunded: 0, percent: Number(data.settings.debt_percent), liquid: Number.MAX_SAFE_INTEGER, buffer: 0 });
  return { mileage, forecasts, provision, budget, debtPaid, funded: netFunded, sampleDays, averageIncome, averageSpending,
    allocation: allocateDebts(data.debts, budget.debt, data.settings.strategy, date),
    projection: payoffProjection(data.debts, futureBudget.debt, data.settings.strategy, date),
    projectedDaily: futureBudget.debt,
  };
}

export function allocateDebts(debts: Debt[], budget: number, strategy: PlanningSettings['strategy'], date: string) {
  const open = debts.filter(d => debtRemaining(d) > 0);
  const ordered = [...open].sort((a, b) => strategy === 'avalanche'
    ? Number(b.annual_interest_rate || 0) - Number(a.annual_interest_rate || 0) || debtRemaining(a) - debtRemaining(b)
    : debtRemaining(a) - debtRemaining(b));
  let available = cents(budget);
  const month = date.slice(0, 7);
  const allocations = new Map<string, number>();
  let minimumShortfall = 0;
  // Monthly minimums first, due dates first; extras then follow the chosen strategy.
  for (const debt of [...open].sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'))) {
    const paid = debt.debt_payments.filter(p => p.paid_on.startsWith(month)).reduce((s, p) => s + Number(p.amount), 0);
    const due = Math.min(debtRemaining(debt), Math.max(0, Number(debt.minimum_payment || 0) - paid));
    const daysInMonth = new Date(Date.UTC(Number(date.slice(0,4)), Number(date.slice(5,7)), 0)).getUTCDate();
    const days = debt.due_date && debt.due_date <= `${month}-31` ? Math.max(1, dayNumber(debt.due_date) - dayNumber(date) + 1) : daysInMonth - Number(date.slice(8)) + 1;
    const needed = Math.min(due, Math.ceil(due / Math.max(1, days) * 100) / 100);
    const amount = Math.min(available, needed); allocations.set(debt.id, amount); available = cents(available - amount); minimumShortfall += needed - amount;
  }
  for (const debt of ordered) {
    const current = allocations.get(debt.id) || 0;
    const extra = Math.min(available, debtRemaining(debt) - current);
    allocations.set(debt.id, cents(current + extra)); available = cents(available - extra);
  }
  return { rows: ordered.map(debt => ({ debt, amount: allocations.get(debt.id) || 0 })), minimumShortfall: cents(minimumShortfall) };
}

// Illustration with constant calendar-day contributions and entered effective annual rates.
// It does not change the creditor's recorded balance or generate automatic payments.
export function payoffProjection(debts: Debt[], dailyAmount: number, strategy: PlanningSettings['strategy'], date: string) {
  const balances = debts.filter(d => debtRemaining(d) > 0).map(d => ({ debt: d, balance: debtRemaining(d) }));
  if (!balances.length) return { days: 0, date, interest: 0 };
  if (dailyAmount <= 0) return null;
  let interest = 0;
  for (let day = 1; day <= 3650; day++) {
    let available = dailyAmount;
    for (const item of balances) {
      const charge = item.balance * (Math.pow(1 + Number(item.debt.annual_interest_rate || 0) / 100, 1 / 365) - 1);
      interest += charge; item.balance += charge;
    }
    // Honor the daily equivalent of each monthly minimum before the extra payment.
    for (const item of balances) { const minimum = Math.min(available, item.balance, Number(item.debt.minimum_payment || 0) / 30); item.balance -= minimum; available -= minimum; }
    balances.sort((a,b) => strategy === 'avalanche' ? Number(b.debt.annual_interest_rate || 0) - Number(a.debt.annual_interest_rate || 0) || a.balance - b.balance : a.balance - b.balance);
    for (const item of balances) { const paid = Math.min(available, item.balance); item.balance -= paid; available -= paid; }
    if (balances.every(item => item.balance < 0.005)) return { days: day, date: addDays(date, day), interest: cents(interest) };
  }
  return null;
}
