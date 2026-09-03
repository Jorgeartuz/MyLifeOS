import { 
  type WorkSession, 
  type WorkSummaryData, 
  type WorkPeriod, 
  type WorkInsightData 
} from '../../types/work';

const dummyUser = '00000000-0000-0000-0000-000000000000';

export const currentSessionMock: WorkSession = {
  id: 'current-active',
  user_id: dummyUser,
  start_time: new Date().toISOString(),
  end_time: null,
  worked_minutes: 270,
  deliveries: 7,
  kilometers: 38,
  gross_income: 52000,
  fuel_cost: 12000,
  other_costs: 0,
  notes: null,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const workSummaries: Record<WorkPeriod, WorkSummaryData> = {
  hoy: {
    grossIncome: 52000,
    deliveries: 7,
    kilometers: 38,
    workedMinutes: 270,
    fuelCost: 12000,
    otherCosts: 0,
    totalSessions: 1,
    workedHours: 4.5
  },
  semana: {
    grossIncome: 780000,
    deliveries: 112,
    kilometers: 520,
    workedMinutes: 2880,
    fuelCost: 140000,
    otherCosts: 25000,
    totalSessions: 6,
    workedHours: 48
  },
  mes: {
    grossIncome: 2850000,
    deliveries: 420,
    kilometers: 2100,
    workedMinutes: 11520,
    fuelCost: 520000,
    otherCosts: 90000,
    totalSessions: 24,
    workedHours: 192
  }
};

export const workInsights: Record<WorkPeriod, WorkInsightData> = {
  hoy: { title: "Hoy", message: "Buen ritmo." },
  semana: { title: "Semana", message: "Estable." },
  mes: { title: "Mes", message: "Objetivo cumplido." }
};

export const recentSessions: WorkSession[] = [];