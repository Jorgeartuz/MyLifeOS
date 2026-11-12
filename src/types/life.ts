export interface Motorcycle {
  id: string;
  model: string;
  plate: string;
  odometer: number;
  next_maintenance_km: number | null;
  soat_date: string | null;
  inspection_date: string | null;
}
export interface Maintenance {
  id: string;
  motorcycle_id: string;
  title: string;
  performed_on: string;
  odometer: number;
  cost: number;
  notes: string;
}
export interface Debt {
  id: string;
  name: string;
  creditor: string;
  original_amount: number;
  due_date: string | null;
  notes: string;
  debt_payments: DebtPayment[];
  annual_interest_rate?: number;
  minimum_payment?: number;
}
export interface DebtPayment {
  id: string;
  amount: number;
  paid_on: string;
  financial_transaction_id?: string;
}
export interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  notes: string;
  completed: boolean;
}
