import { type DashboardData, type Transaction, type EventItem } from '../../types/dashboard';

export const mockDashboardData: Record<string, DashboardData> = {
  hoy: {
    financials: {
      available: 742500,
      income: { title: 'Ingresos', value: 120000, change: 15.2, trend: 'up' },
      expenses: { title: 'Gastos', value: 45000, change: -5.4, trend: 'down' },
      savings: { title: 'Ahorro', value: 75000, change: 2.1, trend: 'up' },
    },
    work: { income: 120000, deliveries: 12, kilometers: 74, hours: 7.5, fuelCost: 20000, otherCosts: 0 },
    moto: {
      model: 'AKT CR4 125',
      kilometers: 43205,
      status: 'Operativa',
      nextMaintenance: 'Cambio de aceite',
      nextMaintenanceKm: 44000,
      lastMaintenanceKm: 41500
    },
    goal: { name: 'Fondo de emergencia', current: 800000, target: 2000000 }
  },
  semana: {
    financials: {
      available: 742500,
      income: { title: 'Ingresos', value: 850000, change: 8.5, trend: 'up' },
      expenses: { title: 'Gastos', value: 320000, change: 12.1, trend: 'up' },
      savings: { title: 'Ahorro', value: 530000, change: 5.2, trend: 'up' },
    },
    work: { income: 850000, deliveries: 84, kilometers: 420, hours: 45, fuelCost: 120000, otherCosts: 15000 },
    moto: { model: 'AKT CR4 125', kilometers: 43205, status: 'Operativa', nextMaintenance: 'Cambio de aceite', nextMaintenanceKm: 44000, lastMaintenanceKm: 41500 },
    goal: { name: 'Fondo de emergencia', current: 800000, target: 2000000 }
  },
  mes: {
    financials: {
      available: 1245000,
      income: { title: 'Ingresos', value: 2850000, change: 10.2, trend: 'up' },
      expenses: { title: 'Gastos', value: 1605000, change: 4.1, trend: 'up' },
      savings: { title: 'Ahorro', value: 1245000, change: 15.0, trend: 'up' },
    },
    work: { income: 2850000, deliveries: 214, kilometers: 2340, hours: 126, fuelCost: 450000, otherCosts: 90000 },
    moto: { model: 'AKT CR4 125', kilometers: 43205, status: 'Operativa', nextMaintenance: 'Cambio de aceite', nextMaintenanceKm: 44000, lastMaintenanceKm: 41500 },
    goal: { name: 'Fondo de emergencia', current: 800000, target: 2000000 }
  }
};

export const recentTransactions: Transaction[] = [
  { id: '1', category: 'Trabajo', description: 'Domicilios turno mañana', date: 'Hoy, 10:30 AM', amount: 90000, type: 'income' },
  { id: '2', category: 'Moto', description: 'Gasolina Mobil', date: 'Hoy, 08:15 AM', amount: -20000, type: 'expense' },
  { id: '3', category: 'Alimentación', description: 'Almuerzo corriente', date: 'Ayer', amount: -18000, type: 'expense' },
  { id: '4', category: 'Universidad', description: 'Copia de materiales', date: '22 Ago', amount: -5000, type: 'expense' },
];

export const upcomingEvents: EventItem[] = [
  { title: 'Cambio de aceite', date: '28 Ago', category: 'Moto' },
  { title: 'Pago universidad', date: '30 Ago', category: 'U' },
  { title: 'Meta de ahorro', date: '31 Ago', category: 'Finanzas' },
];

export const insights = [
  "Esta semana llevas $42.000 más de ganancias que la semana pasada.",
  "Has gastado 23% más en gasolina esta semana.",
  "Estás a $35.000 de alcanzar tu meta semanal.",
  "Tu próximo mantenimiento está a 795 km de distancia.",
];