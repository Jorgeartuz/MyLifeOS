import { Target, Calendar, Plus } from 'lucide-react'; // Eliminado TrendingUp
import { type SavingsGoal } from '../../types/goals';

interface Props {
  goal: SavingsGoal;
  onAddFunds: (goal: SavingsGoal) => void;
}

export const GoalCard = ({ goal, onAddFunds }: Props) => {
  const current = goal.current_amount || 0;
  const progress = Math.min(Math.round((current / goal.target_amount) * 100), 100);
  const remaining = goal.target_amount - current;

  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm group hover:border-primary/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
          <Target size={24} />
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
            goal.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {goal.status}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-text text-lg mb-1">{goal.name}</h3>
      <div className="flex items-center gap-2 text-text-secondary text-xs mb-4">
        <Calendar size={14} />
        <span>{goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Sin fecha límite'}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-primary">{progress}% completado</span>
            <span className="text-text-secondary">${current.toLocaleString()} / ${goal.target_amount.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-background rounded-xl">
            <p className="text-[10px] text-text-secondary font-bold uppercase">Restante</p>
            <p className="text-sm font-bold text-text">${remaining > 0 ? remaining.toLocaleString() : 0}</p>
          </div>
          <button 
            onClick={() => onAddFunds(goal)}
            className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all active:scale-95 shadow-md shadow-primary/10"
          >
            <Plus size={16} /> Ahorrar
          </button>
        </div>
      </div>
    </div>
  );
};