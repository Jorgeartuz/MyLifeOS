export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  // Campo calculado (Join o Sum)
  current_amount?: number;
  goal_contributions?: Pick<GoalContribution, 'amount' | 'contribution_date' | 'financial_transaction_id'>[];
}

export interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  account_id: string;
  amount: number;
  contribution_date: string;
  notes: string | null;
  created_at: string;
  financial_transaction_id?: string | null;
}
