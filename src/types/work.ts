// src/types/work.ts

export type WorkPeriod = 'hoy' | 'semana' | 'mes';
export type WorkSessionStatus = 'active' | 'completed';

export interface WorkSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  worked_minutes: number | null;
  deliveries: number;
  kilometers: number;
  gross_income: number;
  fuel_cost: number;
  other_costs: number;
  notes: string | null;
  status: WorkSessionStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkSummaryData {
  grossIncome: number;
  deliveries: number;
  kilometers: number;
  workedMinutes: number;
  fuelCost: number;
  otherCosts: number;
  totalSessions: number;
  workedHours: number;
}

export interface WorkInsightData {
  title: string;
  message: string;
}

export interface WorkPackage {
  id: string;
  user_id: string;
  package_size: number;
  price: number;
  used_deliveries: number;
  remaining_deliveries: number;
  status: 'active' | 'exhausted';
  purchased_at: string;
  financial_transaction_id: string | null;
}

export interface WorkDelivery {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'cash' | 'transfer';
  account_id: string | null;
  package_id: string | null;
  commission_amount: number;
  net_amount: number;
  financial_transaction_id: string | null;
  created_at: string;
  accounts?: { name: string };
}