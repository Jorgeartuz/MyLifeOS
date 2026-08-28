// src/types/finance.ts
export type AccountType = 'cash' | 'bank' | 'digital_wallet' | 'debit_card' | 'credit_card' | 'other';

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
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}

// Actualizamos Transaction para que soporte los campos de la UI
export interface Transaction {
  id: string;
  account_id: string;
  category_id?: string; // El ID de la DB
  category?: string;    // El nombre para la UI
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  paymentMethod?: string;
  created_at: string;
}

// Añadimos estas interfaces que los componentes de UI necesitan
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