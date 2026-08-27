export type WorkPeriod = 'hoy' | 'semana' | 'mes';

export type WorkSessionStatus = 'active' | 'completed' | 'not_started';

export interface WorkSession {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  workedHours: number;
  deliveries: number;
  kilometers: number;
  grossIncome: number;
  fuelCost: number;
  otherCosts: number;
  totalCosts: number;
  netProfit: number;
  status: WorkSessionStatus;
}

export interface WorkSummaryData {
  grossIncome: number;
  deliveries: number;
  kilometers: number;
  workedHours: number;
  fuelCost: number;
  otherCosts: number;
}

export interface WorkInsightData {
  title: string;
  message: string;
}