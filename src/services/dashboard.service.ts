// src/services/dashboard.service.ts
import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import { workService } from './work.service';
import { goalsService } from './goals.service';
import { type WorkPeriod } from '../types/work';

export const dashboardService = {
  async getDashboardData(period: WorkPeriod) {
    const [accounts, transactions, sessions, goals, { data: profile }] = await Promise.all([
      financeService.getAccounts(),
      financeService.getTransactions(5),
      workService.getSessions(period),
      goalsService.getGoals(),
      supabase.from('profiles').select('full_name').single()
    ]);

    const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
    const periodIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const periodExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // ACTUALIZACIÓN: Incluimos costos en el acumulador
    const workStats = sessions.reduce((acc, s) => ({
      income: acc.income + Number(s.gross_income),
      deliveries: acc.deliveries + s.deliveries,
      kilometers: acc.kilometers + Number(s.kilometers),
      minutes: acc.minutes + (s.worked_minutes || 0),
      fuelCost: acc.fuelCost + Number(s.fuel_cost), // Agregado
      otherCosts: acc.otherCosts + Number(s.other_costs) // Agregado
    }), { income: 0, deliveries: 0, kilometers: 0, minutes: 0, fuelCost: 0, otherCosts: 0 });

    const baseKm = 43205;
    const totalKmEver = sessions.reduce((acc, s) => acc + Number(s.kilometers), 0);
    const currentMotoKm = baseKm + totalKmEver;

    return {
      user: {
        firstName: profile?.full_name?.split(' ')[0] || 'Usuario'
      },
      finances: {
        balance: totalBalance,
        income: periodIncome,
        expenses: periodExpenses,
        recentTransactions: transactions
      },
      work: {
        income: workStats.income,
        deliveries: workStats.deliveries,
        kilometers: workStats.kilometers,
        hours: workStats.minutes / 60,
        fuelCost: workStats.fuelCost, // Agregado
        otherCosts: workStats.otherCosts // Agregado
      },
      moto: {
        kilometers: currentMotoKm,
        nextMaintenanceKm: 44000
      },
      goal: goals.length > 0 ? goals[0] : null
    };
  }
};