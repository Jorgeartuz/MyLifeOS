import { supabase } from '../lib/supabase';
import { planningService } from './planning.service';
import { lifeService } from './life.service';
import { workService } from './work.service';
import { today } from '../lib/life';
import { dashboardAnalytics, dashboardWindow } from '../lib/dashboardAnalytics';
import type { Transaction } from '../types/finance';
import type { WorkDelivery, WorkPeriod } from '../types/work';

export const dashboardService = {
  async getDashboardData(period: WorkPeriod) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Inicia sesión para continuar.');
    const date = today();
    const window = dashboardWindow(period, date);
    async function ledger() {
      const rows: Transaction[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from('transactions').select('*, categories(name, icon), accounts(name)')
          .eq('user_id', user!.id).gte('transaction_date', `${window.previousStart}T00:00:00-05:00`)
          .lt('transaction_date', `${window.end}T00:00:00-05:00`).order('transaction_date').order('id').range(offset, offset + 499);
        if (error) throw error;
        rows.push(...data as Transaction[]);
        if (data.length < 500) return rows;
      }
    }
    async function deliveries() {
      const rows: WorkDelivery[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from('work_deliveries').select('*').eq('user_id', user!.id)
          .gte('created_at', `${window.start}T00:00:00-05:00`).lt('created_at', `${window.end}T00:00:00-05:00`)
          .order('created_at').order('id').range(offset, offset + 499);
        if (error) throw error;
        rows.push(...data as WorkDelivery[]);
        if (data.length < 500) return rows;
      }
    }
    const [overview, transactions, work, events, activePackage] = await Promise.all([
      planningService.overview(), ledger(), deliveries(), lifeService.getEvents(), workService.getActivePackage(),
    ]);
    return {
      overview, activePackage, period, firstName: String(user.user_metadata.full_name || 'Usuario').split(' ')[0],
      ...dashboardAnalytics(overview, transactions, work, events, period, date), updatedAt: new Date().toISOString(),
    };
  },
};
