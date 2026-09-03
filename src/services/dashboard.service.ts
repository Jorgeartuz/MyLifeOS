import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import { workService } from './work.service';
import { goalsService } from './goals.service';
import type { WorkPeriod, WorkDelivery } from '../types/work';
import type { Account, Transaction } from '../types/finance';
import type { SavingsGoal } from '../types/goals';

// Definimos la forma del acumulador para que TypeScript no se queje
interface WorkAccumulator {
  income: number;
  deliveries: number;
  kilometers: number;
  minutes: number;
}

export const dashboardService = {
  async getDashboardData(period: WorkPeriod) {
    const [accounts, transactions, deliveries, goals, { data: profile }] = await Promise.all([
      financeService.getAccounts(),
      financeService.getTransactions(5),
      workService.getDeliveries(period),
      goalsService.getGoals(),
      supabase.from('profiles').select('full_name').single()
    ]);

    const totalBalance = (accounts as Account[]).reduce((acc: number, curr: Account) => acc + Number(curr.balance), 0);
    
    const periodIncome = (transactions as Transaction[])
      .filter((t: Transaction) => t.type === 'income')
      .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0);
      
    const periodExpenses = (transactions as Transaction[])
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0);

    // 2. Cálculos de Trabajo (Acumulador tipado para eliminar el error rojo)
    const workStats = (deliveries as WorkDelivery[]).reduce((acc: WorkAccumulator, d: WorkDelivery) => ({
      income: acc.income + Number(d.net_amount),
      deliveries: acc.deliveries + 1,
      kilometers: acc.kilometers + 0, 
      minutes: acc.minutes + 0 
    }), { income: 0, deliveries: 0, kilometers: 0, minutes: 0 });

    // 3. Cálculos de Moto (Usamos '_' para decirle a TS que ignoramos el segundo parámetro)
    const baseKm = 43205;
    const totalKmEver = (deliveries as WorkDelivery[]).reduce((acc: number) => acc + 0, 0);
    const currentMotoKm = baseKm + totalKmEver;

    return {
      user: {
        firstName: profile?.full_name?.split(' ')[0] || 'Usuario'
      },
      finances: {
        balance: totalBalance,
        income: periodIncome,
        expenses: periodExpenses,
        recentTransactions: transactions as Transaction[]
      },
      work: {
        income: workStats.income,
        deliveries: workStats.deliveries,
        kilometers: workStats.kilometers,
        hours: workStats.minutes / 60,
        fuelCost: 0,
        otherCosts: 0
      },
      moto: {
        kilometers: currentMotoKm,
        nextMaintenanceKm: 44000
      },
      goal: (goals as SavingsGoal[]).length > 0 ? goals[0] : null
    };
  }
};