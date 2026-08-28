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

  async createTransaction(payload: {
    account_id: string;
    category_id: string;
    amount: number;
    type: TransactionType;
    description: string;
    transaction_date: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Obtener saldo actual de la cuenta
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', payload.account_id)
      .single();

    if (!account) throw new Error("Cuenta no encontrada");

    // 2. Calcular nuevo saldo
    const newBalance = payload.type === 'income' 
      ? account.balance + payload.amount 
      : account.balance - payload.amount;

    if (newBalance < 0) throw new Error("Saldo insuficiente en la cuenta");

    // 3. Insertar transacción y actualizar cuenta (en orden)
    const { data: transaction, error: tError } = await supabase
      .from('transactions')
      .insert([{ ...payload, user_id: user?.id }])
      .select().single();

    if (tError) throw tError;

    const { error: aError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', payload.account_id);

    if (aError) throw aError;

    return transaction;
  },

  async deleteTransaction(transaction: Transaction) {
    // 1. Revertir el saldo en la cuenta
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', transaction.account_id)
      .single();

    if (account) {
      const restoredBalance = transaction.type === 'income'
        ? account.balance - transaction.amount
        : account.balance + transaction.amount;

      await supabase
        .from('accounts')
        .update({ balance: restoredBalance })
        .eq('id', transaction.account_id);
    }

    // 2. Eliminar
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.id);
    
    if (error) throw error;
  }
};