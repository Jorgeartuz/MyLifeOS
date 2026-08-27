
export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'nequi' | 'bank' | 'credit_card' | 'debit_card' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: PaymentMethod;
  source?: string;
  notes?: string;
}

export interface FinanceSummary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  incomeChange: number;
  expenseChange: number;
}

export interface CategoryBreakdown {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FinanceData {
  summary: FinanceSummary;
  transactions: Transaction[];
  incomeSources: CategoryBreakdown[];
  expenseCategories: CategoryBreakdown[];
  chartData: { label: string; income: number; expense: number }[];
}