import { supabase } from '../lib/supabase';
import { type WorkSession, type WorkPeriod } from '../types/work';

export const workService = {
  async getActiveSession() {
    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();
    if (error) throw error;
    return data as WorkSession | null;
  },

  async getSessions(period: WorkPeriod) {
    let query = supabase.from('work_sessions').select('*').order('start_time', { ascending: false });

    const now = new Date();
    if (period === 'hoy') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      query = query.gte('start_time', startOfDay);
    } else if (period === 'semana') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
      query = query.gte('start_time', startOfWeek);
    } else if (period === 'mes') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      query = query.gte('start_time', startOfMonth);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as WorkSession[];
  },

  async startSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No auth user');

    const active = await this.getActiveSession();
    if (active) throw new Error('Ya tienes una jornada activa');

    const { data, error } = await supabase
      .from('work_sessions')
      .insert([{
        user_id: user.id,
        start_time: new Date().toISOString(),
        status: 'active',
        deliveries: 0,
        kilometers: 0,
        gross_income: 0,
        fuel_cost: 0,
        other_costs: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkSession;
  },

  async updateSession(id: string, updates: Partial<WorkSession>) {
    const { data, error } = await supabase
      .from('work_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as WorkSession;
  },

  async endSession(session: WorkSession) {
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const workedMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

    const { data, error } = await supabase
      .from('work_sessions')
      .update({
        end_time: endTime.toISOString(),
        worked_minutes: workedMinutes,
        status: 'completed'
      })
      .eq('id', session.id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkSession;
  }
};