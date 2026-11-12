import { notifyPlanningChanged } from '../lib/planningEvents';
import { supabase } from '../lib/supabase';
import type { Account, AccountType, Category, Transaction, TransactionType } from '../types/finance';

export const financeService = {
  // --- CUENTAS ---
  async getAccounts() {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data as Account[];
  },

  async createAccount(name: string, type: AccountType, balance: number) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('accounts')
      .insert([{ name, type, balance, user_id: user?.id }])
      .select().single();
    if (error) throw error;
    notifyPlanningChanged();
    return data as Account;
  },

  // --- CATEGORÍAS ---
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data as Category[];
  },

  // --- TRANSACCIONES ---
  async getTransactions(limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (name, icon),
        accounts (name)
      `)
      .order('transaction_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as Transaction[];
  },

  async getTransactionsByDateRange(startDate: string, endDate?: string) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (name, icon),
        accounts (name)
      `)
      .gte('transaction_date', startDate)
      .order('transaction_date', { ascending: false });

    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  },

  async getFinancialTotals() {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount');

    if (error) throw error;

    const income = (data || [])
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = (data || [])
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expenses };
  },

  async createTransaction(payload: {
    account_id: string;
    category_id: string | null;
    amount: number;
    type: TransactionType;
    description: string;
    transaction_date: string;
  }) {
    const { data, error } = await supabase.rpc('create_financial_entry', {
      p_account_id: payload.account_id,
      p_category_id: payload.category_id,
      p_amount: payload.amount,
      p_type: payload.type,
      p_description: payload.description,
      p_date: payload.transaction_date,
    });
    if (error) throw error;
    const transaction = Array.isArray(data) ? data[0] : data;
    if (!transaction?.id) throw new Error('No se recibió el movimiento registrado. Recarga antes de volver a intentarlo.');
    notifyPlanningChanged();
    return transaction as Transaction;
  },

  async deleteTransaction(transaction: Transaction) {
    const { error } = await supabase.rpc('reverse_financial_entry', { p_transaction_id: transaction.id });
    if (error) throw error;
    notifyPlanningChanged();
  }
};
