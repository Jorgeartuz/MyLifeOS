import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import { type SavingsGoal } from '../types/goals';

export const goalsService = {
  async getGoals() {
    const { data, error } = await supabase
      .from('savings_goals')
      .select(`
        *,
        goal_contributions (amount)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(goal => ({
      ...goal,
      current_amount: goal.goal_contributions?.reduce(
        (sum: number, c: { amount: number | string }) => sum + Number(c.amount),
        0
      ) || 0
    })) as SavingsGoal[];
  },

  async createGoal(name: string, target_amount: number, target_date: string | null) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{
        user_id: user?.id,
        name,
        target_amount,
        target_date,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return data as SavingsGoal;
  },

  async addContribution(payload: {
    goal_id: string;
    account_id: string;
    amount: number;
    notes?: string | null;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    // 1. Obtener nombre de la meta
    const { data: goal } = await supabase
      .from('savings_goals')
      .select('name')
      .eq('id', payload.goal_id)
      .maybeSingle();

    const goalName = goal?.name || 'Meta de Ahorro';

    // 2. Buscar categoría de ahorro si existe
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('type', 'expense');

    const savingCat = categories?.find(c => 
      c.name.toLowerCase().includes('ahorro') || 
      c.name.toLowerCase().includes('meta')
    );

    // 3. Crear transacción financiera para debitar la cuenta y que quede en el historial
    const tx = await financeService.createTransaction({
      account_id: payload.account_id,
      category_id: savingCat ? savingCat.id : (categories?.[0]?.id || null),
      amount: payload.amount,
      type: 'expense',
      description: `Aporte a meta: ${goalName}${payload.notes ? ` (${payload.notes})` : ''}`,
      transaction_date: new Date().toISOString()
    });

    try {
      const { error: contribError } = await supabase
        .from('goal_contributions')
        .insert([{
          ...payload,
          user_id: user.id,
          contribution_date: new Date().toISOString()
        }]);

      if (contribError) throw contribError;
    } catch (err) {
      // Revertir la transacción si falla la inserción de la contribución
      await financeService.deleteTransaction(tx);
      throw err;
    }
  }
};
