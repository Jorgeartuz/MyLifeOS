export interface PlanningSettings {
  debt_percent: number;
  daily_essentials: number;
  cash_buffer: number;
  daily_km: number;
  strategy: 'avalanche' | 'snowball';
  goal_percent: number;
  daily_personal: number;
  personal_category_ids: string[];
}

export interface MaintenancePlan {
  id: string;
  motorcycle_id: string;
  name: string;
  interval_km: number;
  last_service_km: number;
  last_service_date: string;
  estimated_cost: number;
  active: boolean;
}

export interface OdometerReading {
  reading_date: string;
  odometer: number;
}

export interface MotoFund {
  balance: number;
}

export interface FundMovement {
  id: string;
  amount: number;
  kind: 'contribution' | 'service' | 'refund';
  created_at: string;
  description: string;
}
