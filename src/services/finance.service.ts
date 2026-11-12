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
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Obtener saldo actual y tipo de la cuenta
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('id, balance, type')
      .eq('id', payload.account_id)
      .single();

    if (accError || !account) throw new Error("Cuenta no encontrada");

    // 2. Calcular nuevo saldo
    const currentBalance = Number(account.balance) || 0;
    const newBalance = payload.type === 'income' 
      ? currentBalance + payload.amount 
      : currentBalance - payload.amount;

    // Se permite saldo negativo si la cuenta es tarjeta de crédito
    if (newBalance < 0 && account.type !== 'credit_card') {
      throw new Error("Saldo insuficiente en la cuenta seleccionada");
    }

    // 3. Insertar transacción
    const { data: transaction, error: tError } = await supabase
      .from('transactions')
      .insert([{ ...payload, user_id: user?.id }])
      .select().single();

    if (tError) throw tError;

    // 4. Actualizar saldo de cuenta
    const { error: aError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', payload.account_id);

    if (aError) {
      // Revertir inserción de transacción si falla la actualización de saldo
      await supabase.from('transactions').delete().eq('id', transaction.id);
      throw aError;
    }

    return transaction as Transaction;
  },

  async deleteTransaction(transaction: Transaction) {
    // 1. Eliminar primero la transacción para garantizar integridad referencial
    const { error: tError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.id);
    
    if (tError) throw tError;

    // 2. Revertir el saldo en la cuenta
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', transaction.account_id)
      .single();

    if (account) {
      const currentBalance = Number(account.balance) || 0;
      const restoredBalance = transaction.type === 'income'
        ? currentBalance - Number(transaction.amount)
        : currentBalance + Number(transaction.amount);

      await supabase
        .from('accounts')
        .update({ balance: restoredBalance })
        .eq('id', transaction.account_id);
    }
  }
};
