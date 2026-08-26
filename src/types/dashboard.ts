// src/types/dashboard.ts

// Borramos la línea de ReactNode porque no la estamos usando aquí
export type Trend = 'up' | 'down' | 'neutral';

import { type ReactNode } from 'react';

export interface WorkStatProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

export interface EventItem {
  title: string;
  date: string;
  category: string;
}

export interface FinancialMetric {
  title: string;
  value: number;
  change: number;
  trend: Trend;
}

export interface WorkData {
  income: number;
  deliveries: number;
  kilometers: number;
  hours: number;
  fuelCost: number;
  otherCosts: number;
}

export interface Transaction {
  id: string;
  category: string;
  description: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface DashboardData {
  financials: {
    available: number;
    income: FinancialMetric;
    expenses: FinancialMetric;
    savings: FinancialMetric;
  };
  work: WorkData;
  moto: {
    model: string;
    kilometers: number;
    status: 'Operativa' | 'Mantenimiento' | 'Revisar';
    nextMaintenance: string;
    nextMaintenanceKm: number;
    lastMaintenanceKm: number;
  };
  goal: {
    name: string;
    current: number;
    target: number;
  };
}