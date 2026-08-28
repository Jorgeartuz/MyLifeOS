import { supabase } from '../lib/supabase';
import type { Account, AccountType, Category } from '../types/finance'; 

export const financeService = {
  // --- CUENTAS ---
  async getAccounts() {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Account[];
  },

  async createAccount(name: string, type: AccountType, balance: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ 
        name, 
        type, 
        balance, 
        user_id: user.id,
        is_active: true 
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  },

  async updateAccount(id: string, updates: Partial<Account>) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  },

  // --- CATEGORÍAS ---
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Category[];
  }
};