import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import { workService } from './work.service';
import { goalsService } from './goals.service';
import { lifeService } from './life.service';
import { planningService } from './planning.service';
import type { WorkPeriod, WorkDelivery } from '../types/work';
import type { Account, Transaction } from '../types/finance';
import type { SavingsGoal } from '../types/goals';

interface WorkAccumulator {
  income: number;
  deliveries: number;
  kilometers: number;
  minutes: number;
}

const getPeriodStartDate = (period: WorkPeriod): string => {
  const now = new Date();
  if (period === 'hoy') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  }
  if (period === 'semana') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0).toISOString();
  }
  if (period === 'mes') {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString();
  }
  return new Date(0).toISOString();
};

export const dashboardService = {
  async getDashboardData(period: WorkPeriod) {
    const startDate = getPeriodStartDate(period);

    const [accounts, periodTransactions, recentTransactions, deliveries, goals, motorcycle, planning, userProfile] = await Promise.all([
      financeService.getAccounts(),
      financeService.getTransactionsByDateRange(startDate),
      financeService.getTransactions(5),
      workService.getDeliveries(period),
      goalsService.getGoals(),
      lifeService.getMoto(),
      planningService.context(),
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return null;
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        return { full_name: user.user_metadata.full_name || data?.full_name };
      })
    ]);

    const totalBalance = (accounts as Account[]).reduce(
      (acc: number, curr: Account) => acc + (Number(curr.balance) || 0),
      0
    );
    
    const periodIncome = (periodTransactions as Transaction[])
      .filter((t: Transaction) => t.type === 'income')
      .reduce((acc: number, curr: Transaction) => acc + (Number(curr.amount) || 0), 0);
      
    const periodExpenses = (periodTransactions as Transaction[])
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: number, curr: Transaction) => acc + (Number(curr.amount) || 0), 0);

    // Cálculos de Trabajo
    const workStats = (deliveries as WorkDelivery[]).reduce(
      (acc: WorkAccumulator, d: WorkDelivery) => ({
        income: acc.income + (Number(d.net_amount) || 0),
        deliveries: acc.deliveries + 1,
        kilometers: acc.kilometers, 
        minutes: acc.minutes 
      }),
      { income: 0, deliveries: 0, kilometers: 0, minutes: 0 }
    );

    const nextService = planning.plans.filter(p => p.active).sort((a,b) => (Number(a.last_service_km) + Number(a.interval_km)) - (Number(b.last_service_km) + Number(b.interval_km)))[0];

    return {
      user: {
        firstName: userProfile?.full_name?.split(' ')[0] || 'Usuario'
      },
      finances: {
        balance: totalBalance,
        income: periodIncome,
        expenses: periodExpenses,
        recentTransactions: recentTransactions as Transaction[]
      },
      work: {
        income: workStats.income,
        deliveries: workStats.deliveries,
        kilometers: workStats.kilometers,
        hours: workStats.minutes / 60,
        fuelCost: 0,
        otherCosts: 0
      },
      moto: motorcycle.moto ? { ...motorcycle.moto,
        next_maintenance_km: nextService ? Number(nextService.last_service_km) + Number(nextService.interval_km) : motorcycle.moto.next_maintenance_km,
        next_service_name: nextService?.name || 'Mantenimiento programado',
      } : null,
      goal: (goals as SavingsGoal[]).length > 0 ? goals[0] : null
    };
  }
};
