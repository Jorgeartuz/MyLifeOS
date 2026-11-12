import { notifyPlanningChanged } from '../lib/planningEvents';
import { supabase } from '../lib/supabase';
import type { Motorcycle, Maintenance, Debt, CalendarEvent } from '../types/life';

async function userId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Inicia sesión para continuar.');
  return user.id;
}
export const lifeService = {
  async getMoto() {
    const id = await userId();
    const { data, error } = await supabase.from('motorcycles').select('*').eq('user_id', id).maybeSingle();
    if (error) throw error;
    const { data: history, error: historyError } = await supabase.from('motorcycle_maintenance').select('*').eq('user_id', id).order('performed_on', { ascending: false });
    if (historyError) throw historyError;
    return { moto: data as Motorcycle | null, history: history as Maintenance[] };
  },
  async saveMoto(payload: Omit<Motorcycle, 'id'>) {
    const id = await userId();
    const { error } = await supabase.from('motorcycles').upsert({ ...payload, user_id: id }, { onConflict: 'user_id' });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async addMaintenance(payload: Omit<Maintenance, 'id'>) {
    const { error } = await supabase.rpc('record_motorcycle_maintenance', { p_motorcycle_id: payload.motorcycle_id, p_title: payload.title, p_performed_on: payload.performed_on, p_odometer: payload.odometer, p_cost: payload.cost, p_notes: payload.notes });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async getDebts() {
    const id = await userId();
    const { data, error } = await supabase.from('debts').select('*, debt_payments(id, amount, paid_on, financial_transaction_id)').eq('user_id', id).order('created_at', { ascending: false });
    if (error) throw error;
    return data as Debt[];
  },
  async addDebt(payload: { name: string; creditor: string; original_amount: number; due_date: string | null; notes: string; annual_interest_rate?: number; minimum_payment?: number }) {
    const id = await userId();
    const { error } = await supabase.from('debts').insert({ ...payload, user_id: id });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async payDebt(debtId: string, accountId: string, amount: number, paidOn: string) {
    const { error } = await supabase.rpc('pay_personal_debt', { p_debt_id: debtId, p_account_id: accountId, p_amount: amount, p_paid_on: paidOn });
    if (error) throw error;
    notifyPlanningChanged();
  },
  async getEvents() {
    const id = await userId();
    const { data, error } = await supabase.from('calendar_events').select('*').eq('user_id', id).order('event_date');
    if (error) throw error;
    return data as CalendarEvent[];
  },
  async saveEvent(payload: { title: string; event_date: string; notes: string }, id?: string) {
    const uid = await userId();
    const query = id ? supabase.from('calendar_events').update(payload).eq('id', id).eq('user_id', uid) : supabase.from('calendar_events').insert({ ...payload, user_id: uid });
    const { error } = await query;
    if (error) throw error;
  },
  async completeEvent(id: string, completed: boolean) {
    const uid = await userId();
    const { error } = await supabase.from('calendar_events').update({ completed }).eq('id', id).eq('user_id', uid);
    if (error) throw error;
  },
  async deleteEvent(id: string) {
    const uid = await userId();
    const { error } = await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', uid);
    if (error) throw error;
  },
};
