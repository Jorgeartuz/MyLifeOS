// src/components/dashboard/mockData.ts

export const workSummaries = {
  hoy: { 
    income: 0, 
    deliveries: 0, 
    kilometers: 0, 
    hours: 0, 
    fuelCost: 0, // Corregido a camelCase
    otherCosts: 0 // Corregido a camelCase
  },
  semana: { 
    income: 780000, 
    deliveries: 112, 
    kilometers: 520, 
    hours: 48, 
    fuelCost: 140000, // Corregido
    otherCosts: 25000 // Corregido
  },
  mes: { 
    income: 2850000, 
    deliveries: 420, 
    kilometers: 2100, 
    hours: 192, 
    fuelCost: 520000, // Corregido
    otherCosts: 90000 // Corregido
  }
};

// ... el resto del archivo (motoMock, goalMock, workInsights) se queda igual
export const motoMock = {
  model: 'AKT CR4 125',
  kilometers: 43205,
  status: 'Operativa' as const,
  nextMaintenance: 'Cambio de aceite',
  nextMaintenanceKm: 44000,
  lastMaintenanceKm: 41500
};

export const goalMock = {
  name: 'Fondo de emergencia',
  current: 800000,
  target: 2000000
};

export const workInsights: Record<string, string> = {
  hoy: "Inicia tu jornada para ver estadísticas en tiempo real.",
  semana: "Llevas un excelente promedio de entregas por hora.",
  mes: "Tus costos operativos están dentro del rango esperado."
};