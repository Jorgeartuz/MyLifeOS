import { Target } from 'lucide-react';
import { type DashboardData } from '../../types/dashboard';

export const GoalProgress = ({ goal }: { goal: DashboardData['goal'] }) => {
  const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 text-primary rounded-lg"><Target size={20}/></div>
        <h3 className="font-bold text-text text-sm uppercase tracking-tight">Meta Principal</h3>
      </div>
      <p className="text-sm font-bold text-text">{goal.name}</p>
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-bold text-primary">{percent}%</span>
          <span className="text-text-secondary">${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
};