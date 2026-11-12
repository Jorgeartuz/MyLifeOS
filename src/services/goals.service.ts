import { notifyPlanningChanged } from '../lib/planningEvents';
import { supabase } from '../lib/supabase';
import { type SavingsGoal } from '../types/goals';

export const goalsService = {
  async getGoals() {
    const { data, error } = await supabase.rpc('get_savings_goal_overview');
    if (error) throw error;
    return (data || []) as SavingsGoal[];
  },
  async createGoal(name: string, target_amount: number, target_date: string | null) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Inicia sesión para continuar.');
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
    notifyPlanningChanged();
    return data as SavingsGoal;
  },

  async addContribution(payload: {
    goal_id: string;
    account_id: string;
    amount: number;
    notes?: string | null;
  }) {
    const { error } = await supabase.rpc('contribute_to_savings_goal', {
      p_goal_id: payload.goal_id, p_account_id: payload.account_id,
      p_amount: payload.amount, p_notes: payload.notes || null,
    });
    if (error) throw error;
    notifyPlanningChanged();
  },

  async updateGoal(id: string, name: string, target: number, date: string | null) {
    const { error } = await supabase.rpc('update_savings_goal_plan', { p_goal_id: id, p_name: name, p_target: target, p_date: date });
    if (error) throw error;
    notifyPlanningChanged();
  }
};
