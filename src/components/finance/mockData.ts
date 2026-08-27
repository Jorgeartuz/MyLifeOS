import { type FinanceData } from '../../types/finance';

export const mockFinanceData: Record<string, FinanceData> = {
  hoy: {
    summary: {
      balance: 72000,
      totalIncome: 120000,
      totalExpenses: 48000,
      savings: 72000,
      savingsRate: 60,
      incomeChange: 12.5,
      expenseChange: -5.2
    },
    transactions: [
      { id: '1', type: 'income', category: 'Domicilios', amount: 90000, date: '10:30 AM', description: 'Turno mañana', paymentMethod: 'nequi', source: 'work' },
      { id: '2', type: 'expense', category: 'Gasolina', amount: 20000, date: '08:15 AM', description: 'Tanqueo Mobil', paymentMethod: 'cash' },
      { id: '3', type: 'expense', category: 'Alimentación', amount: 18000, date: '12:45 PM', description: 'Almuerzo corriente', paymentMethod: 'cash' },
      { id: '4', type: 'income', category: 'Freelance', amount: 30000, date: '02:00 PM', description: 'Logo rápido', paymentMethod: 'bank' }
    ],
    incomeSources: [
      { label: 'Domicilios', amount: 90000, percentage: 75, color: 'bg-primary' },
      { label: 'Freelance', amount: 30000, percentage: 25, color: 'bg-blue-400' }
    ],
    expenseCategories: [
      { label: 'Gasolina', amount: 20000, percentage: 41, color: 'bg-orange-500' },
      { label: 'Alimentación', amount: 18000, percentage: 37, color: 'bg-red-500' },
      { label: 'Otros', amount: 10000, percentage: 22, color: 'bg-gray-400' }
    ],
    chartData: [
      { label: '08:00', income: 0, expense: 20000 },
      { label: '10:00', income: 90000, expense: 0 },
      { label: '12:00', income: 0, expense: 18000 },
      { label: '14:00', income: 30000, expense: 10000 }
    ]
  },
  semana: {
    summary: {
      balance: 530000,
      totalIncome: 850000,
      totalExpenses: 320000,
      savings: 530000,
      savingsRate: 62.3,
      incomeChange: 8.4,
      expenseChange: 12.1
    },
    transactions: [], // Simplificado para mock
    incomeSources: [
      { label: 'Domicilios', amount: 650000, percentage: 76, color: 'bg-primary' },
      { label: 'Salario', amount: 200000, percentage: 24, color: 'bg-blue-400' }
    ],
    expenseCategories: [
      { label: 'Gasolina', amount: 120000, percentage: 37, color: 'bg-orange-500' },
      { label: 'Alimentación', amount: 100000, percentage: 31, color: 'bg-red-500' },
      { label: 'Moto', amount: 50000, percentage: 16, color: 'bg-purple-500' },
      { label: 'Otros', amount: 50000, percentage: 16, color: 'bg-gray-400' }
    ],
    chartData: [
      { label: 'Lun', income: 120000, expense: 45000 },
      { label: 'Mar', income: 110000, expense: 30000 },
      { label: 'Mie', income: 140000, expense: 50000 },
      { label: 'Jue', income: 90000, expense: 60000 },
      { label: 'Vie', income: 180000, expense: 40000 },
      { label: 'Sab', income: 210000, expense: 95000 }
    ]
  },
  mes: {
    summary: {
      balance: 1245000,
      totalIncome: 2850000,
      totalExpenses: 1605000,
      savings: 1245000,
      savingsRate: 43.6,
      incomeChange: 10.2,
      expenseChange: 4.1
    },
    transactions: [],
    incomeSources: [
      { label: 'Domicilios', amount: 2100000, percentage: 74, color: 'bg-primary' },
      { label: 'Salario', amount: 750000, percentage: 26, color: 'bg-blue-400' }
    ],
    expenseCategories: [
      { label: 'Universidad', amount: 600000, percentage: 37, color: 'bg-purple-600' },
      { label: 'Hogar', amount: 450000, percentage: 28, color: 'bg-blue-600' },
      { label: 'Gasolina', amount: 350000, percentage: 22, color: 'bg-orange-500' },
      { label: 'Otros', amount: 205000, percentage: 13, color: 'bg-gray-400' }
    ],
    chartData: [
      { label: 'Sem 1', income: 700000, expense: 400000 },
      { label: 'Sem 2', income: 750000, expense: 350000 },
      { label: 'Sem 3', income: 680000, expense: 500000 },
      { label: 'Sem 4', income: 720000, expense: 355000 }
    ]
  }
};