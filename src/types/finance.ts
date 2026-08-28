// src/types/finance.ts

export type AccountType = 'cash' | 'bank' | 'digital_wallet' | 'debit_card' | 'credit_card' | 'other';
export type CategoryType = 'income' | 'expense' | 'both';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  description: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  // Campos de JOIN (opcionales para la UI)
  categories?: { name: string; icon: string | null };
  accounts?: { name: string };
}

// ESTA ES LA INTERFAZ QUE TE FALTABA:
export interface CategoryBreakdown {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FinanceData {
  summary: {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
    incomeChange: number;
    expenseChange: number;
  };
  transactions: Transaction[];
  incomeSources: CategoryBreakdown[];
  expenseCategories: CategoryBreakdown[];
}