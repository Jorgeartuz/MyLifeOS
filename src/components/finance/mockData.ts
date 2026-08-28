// src/components/dashboard/mockData.ts
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
      { 
        id: '1', 
        account_id: 'default', 
        type: 'income', 
        category: 'Domicilios', 
        amount: 90000, 
        date: '10:30 AM', 
        description: 'Turno mañana', 
        paymentMethod: 'nequi', 
        created_at: new Date().toISOString() 
      },
      { 
        id: '2', 
        account_id: 'default', 
        type: 'expense', 
        category: 'Gasolina', 
        amount: 20000, 
        date: '08:15 AM', 
        description: 'Tanqueo Mobil', 
        paymentMethod: 'cash', 
        created_at: new Date().toISOString() 
      }
    ],
    incomeSources: [
      { label: 'Domicilios', amount: 90000, percentage: 75, color: 'bg-primary' },
      { label: 'Freelance', amount: 30000, percentage: 25, color: 'bg-blue-400' }
    ],
    expenseCategories: [
      { label: 'Gasolina', amount: 20000, percentage: 41, color: 'bg-orange-500' },
      { label: 'Alimentación', amount: 18000, percentage: 37, color: 'bg-red-500' },
      { label: 'Otros', amount: 10000, percentage: 22, color: 'bg-gray-400' }
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
    transactions: [],
    incomeSources: [
      { label: 'Domicilios', amount: 650000, percentage: 76, color: 'bg-primary' },
      { label: 'Salario', amount: 200000, percentage: 24, color: 'bg-blue-400' }
    ],
    expenseCategories: [
      { label: 'Gasolina', amount: 120000, percentage: 37, color: 'bg-orange-500' },
      { label: 'Alimentación', amount: 100000, percentage: 31, color: 'bg-red-500' },
      { label: 'Moto', amount: 50000, percentage: 16, color: 'bg-purple-500' },
      { label: 'Otros', amount: 50000, percentage: 16, color: 'bg-gray-400' }
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
    ]
  }
};