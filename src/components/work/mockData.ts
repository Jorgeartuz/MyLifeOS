import { type WorkSession, type WorkSummaryData } from '../../types/work';

export const currentSessionMock: WorkSession = {
  id: 'current-1',
  date: '2026-08-26',
  startTime: '08:00 AM',
  workedHours: 4.58, // 4h 35m
  deliveries: 7,
  kilometers: 38,
  grossIncome: 52000,
  fuelCost: 12000,
  otherCosts: 0,
  totalCosts: 12000,
  netProfit: 40000,
  status: 'active'
};

export const workSummaries: Record<string, WorkSummaryData> = {
  hoy: {
    grossIncome: 120000,
    deliveries: 16,
    kilometers: 84,
    workedHours: 8.5,
    fuelCost: 22000,
    otherCosts: 5000
  },
  semana: {
    grossIncome: 780000,
    deliveries: 112,
    kilometers: 520,
    workedHours: 48,
    fuelCost: 140000,
    otherCosts: 25000
  },
  mes: {
    grossIncome: 2850000,
    deliveries: 420,
    kilometers: 2100,
    workedHours: 192,
    fuelCost: 520000,
    otherCosts: 90000
  }
};

export const recentSessions: WorkSession[] = [
  {
    id: 's-1',
    date: '25 Ago',
    startTime: '08:00 AM',
    endTime: '04:30 PM',
    workedHours: 8.5,
    deliveries: 12,
    kilometers: 74,
    grossIncome: 90000,
    fuelCost: 18000,
    otherCosts: 2000,
    totalCosts: 20000,
    netProfit: 70000,
    status: 'completed'
  },
  {
    id: 's-2',
    date: '24 Ago',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    workedHours: 9,
    deliveries: 15,
    kilometers: 92,
    grossIncome: 110000,
    fuelCost: 22000,
    otherCosts: 0,
    totalCosts: 22000,
    netProfit: 88000,
    status: 'completed'
  }
];