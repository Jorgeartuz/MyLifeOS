export type WorkPeriod = 'hoy' | 'semana' | 'mes';

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
  // Campos vinculados
  accounts?: { name: string };
}

export interface WorkSummaryData {
  totalDeliveries: number;
  totalGross: number;
  totalCash: number;
  totalTransfer: number;
  totalCommission: number;
  totalNet: number;
}