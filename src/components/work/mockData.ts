import { 
  type WorkSession, 
  type WorkSummaryData, 
  type WorkPeriod, 
  type WorkInsightData 
} from '../../types/work';

// Datos de la sesión activa
export const currentSessionMock: WorkSession = {
  id: 'current-active',
  date: '26 Ago',
  startTime: '08:00 AM',
  workedHours: 4.5,
  deliveries: 7,
  kilometers: 38,
  grossIncome: 52000,
  fuelCost: 12000,
  otherCosts: 0,
  totalCosts: 12000,
  netProfit: 40000,
  status: 'active'
};

// Resúmenes coherentes (Hoy coincide con la sesión activa)
export const workSummaries: Record<WorkPeriod, WorkSummaryData> = {
  hoy: {
    grossIncome: 52000,
    deliveries: 7,
    kilometers: 38,
    workedHours: 4.5,
    fuelCost: 12000,
    otherCosts: 0
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

// Insights estáticos vinculados al período
export const workInsights: Record<WorkPeriod, WorkInsightData> = {
  hoy: {
    title: "Insight de hoy",
    message: "Tu ganancia neta actual es de $40.000 tras 4.5 horas de ruta."
  },
  semana: {
    title: "Rendimiento semanal",
    message: "Esta semana tu costo de combustible representa el 18% de tus ingresos."
  },
  mes: {
    title: "Balance mensual",
    message: "Llevas 420 domicilios realizados. Tu promedio de ganancia por entrega es de $5.333."
  }
};

export const recentSessions: WorkSession[] = [
  {
    id: 's-prev-1',
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
  }
];