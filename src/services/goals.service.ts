import { supabase } from '../lib/supabase';
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
      // Tipamos 'c' como un objeto que contiene amount en lugar de usar any
      current_amount: goal.goal_contributions?.reduce((sum: number, c: { amount: number | string }) => sum + Number(c.amount), 0) || 0
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
    
    const { error: contribError } = await supabase
      .from('goal_contributions')
      .insert([{
        ...payload,
        user_id: user?.id,
        contribution_date: new Date().toISOString()
      }]);

    if (contribError) throw contribError;

    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', payload.account_id)
      .single();

    if (account) {
      await supabase
        .from('accounts')
        .update({ balance: Number(account.balance) - payload.amount })
        .eq('id', payload.account_id);
    }
  }
};