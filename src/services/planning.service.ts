import { notifyPlanningChanged } from '../lib/planningEvents';
import { supabase } from '../lib/supabase';
import { lifeService } from './life.service';
import { financeService } from './finance.service';
import { goalsService } from './goals.service';
import { today } from '../lib/life';
import { addDays, defaultSettings } from '../lib/planning';
import type { PlanningSettings, MaintenancePlan, OdometerReading, MotoFund, FundMovement } from '../types/planning';
import type { Transaction } from '../types/finance';

async function requireUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Inicia sesión para continuar.');
  return user.id;
}

export const planningService = {
  async context() {
    const uid = await requireUser();
    const results = await Promise.all([
      supabase.from('personal_planning_settings').select('*').eq('user_id', uid).maybeSingle(),
      supabase.from('motorcycle_service_plans').select('*').eq('user_id', uid).order('name'),
      supabase.from('motorcycle_odometer_readings').select('reading_date, odometer').eq('user_id', uid).gte('reading_date', addDays(today(), -30)).order('reading_date'),
      supabase.from('motorcycle_funds').select('balance').eq('user_id', uid).maybeSingle(),
      supabase.from('motorcycle_fund_movements').select('id, amount, kind, created_at, description').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
    ]);
    for (const result of results) if (result.error) throw result.error;
    return {
      settings: { ...defaultSettings, ...results[0].data } as PlanningSettings,
      plans: results[1].data as unknown as MaintenancePlan[],
      readings: results[2].data as unknown as OdometerReading[],
      fund: (results[3].data || { balance: 0 }) as MotoFund,
      movements: results[4].data as unknown as FundMovement[],
    };
  },
  async transactions() {
    const uid = await requireUser();
    const transactions: Transaction[] = [];
    // Bounded lookback and explicit pagination avoid Supabase's default row cap.
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.from('transactions').select('*').eq('user_id', uid)
        .gte('transaction_date', `${addDays(today(), -29)}T00:00:00-05:00`)
        .lt('transaction_date', `${addDays(today(), 1)}T00:00:00-05:00`)
        .order('transaction_date').order('id').range(offset, offset + 499);
      if (error) throw error;
      transactions.push(...data as Transaction[]);
      if (data.length < 500) break;
    }
    return transactions;
  },
  async overview() {
    const [context, motorcycle, debts, accounts, transactions, goals, categories] = await Promise.all([
      planningService.context(), lifeService.getMoto(), lifeService.getDebts(), financeService.getAccounts(), planningService.transactions(), goalsService.getGoals(), financeService.getCategories(),
    ]);
    return { ...context, ...motorcycle, debts, accounts, transactions, goals, categories };
  },
  async saveSettings(settings: PlanningSettings) {
    const uid = await requireUser();
    const { error } = await supabase.from('personal_planning_settings').upsert({
      user_id: uid, debt_percent: settings.debt_percent, daily_essentials: settings.daily_essentials,
      cash_buffer: settings.cash_buffer, daily_km: settings.daily_km, strategy: settings.strategy,
      goal_percent: settings.goal_percent, daily_personal: settings.daily_personal, personal_category_ids: settings.personal_category_ids,
    }, { onConflict: 'user_id' });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async savePlan(plan: Omit<MaintenancePlan, 'id'>, id?: string) {
    const uid = await requireUser();
    const { error } = id
      ? await supabase.from('motorcycle_service_plans').update(plan).eq('id', id).eq('user_id', uid)
      : await supabase.from('motorcycle_service_plans').insert({ ...plan, user_id: uid });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async archivePlan(id: string) {
    const uid = await requireUser();
    const { error } = await supabase.from('motorcycle_service_plans').update({ active: false }).eq('id', id).eq('user_id', uid);
    if (error) throw error;
    notifyPlanningChanged();
  },
  async completeService(planId: string, date: string, odometer: number, cost: number, notes: string, fromFund: boolean) {
    const { error } = await supabase.rpc('complete_planned_service', { p_plan_id: planId, p_date: date, p_odometer: odometer, p_cost: cost, p_notes: notes, p_from_fund: fromFund });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async fundMovement(accountId: string, amount: number, refund: boolean) {
    const { error } = await supabase.rpc('move_motorcycle_fund', { p_account_id: accountId, p_amount: amount, p_refund: refund });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async updateDebtTerms(id: string, annualRate: number, minimum: number) {
    const uid = await requireUser();
    const { error } = await supabase.from('debts').update({ annual_interest_rate: annualRate, minimum_payment: minimum }).eq('id', id).eq('user_id', uid);
    if (error) throw error;
    notifyPlanningChanged();
  },
};
