import { useState, useEffect, useCallback } from 'react';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { ContributionModal } from '../components/goals/ContributionModal';
import { goalsService } from '../services/goals.service';
import { financeService } from '../services/finance.service';
import { type SavingsGoal } from '../types/goals';
import { type Account } from '../types/finance';
import { Plus, Loader2, Target, AlertCircle } from 'lucide-react';

const Metas = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [goalsData, accountsData] = await Promise.all([
        goalsService.getGoals(),
        financeService.getAccounts()
      ]);
      setGoals(goalsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error cargando metas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // SOLUCIÓN LINTER: Efecto de carga pura
  useEffect(() => {
    let isMounted = true;
    
    const executeLoad = async () => {
      if (isMounted) {
        await loadData();
      }
    };

    executeLoad();
    
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const handleOpenContribution = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsContribModalOpen(true);
  };

  if (loading && goals.length === 0) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text tracking-tight">Mis Metas</h1>
          <p className="text-text-secondary mt-1 text-sm">Visualiza tus sueños y el camino para alcanzarlos.</p>
        </div>
        <button 
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Nueva Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-surface border-2 border-dashed border-border rounded-card p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
            <Target size={32} />
          </div>
          <h3 className="font-bold text-text text-lg">No tienes metas todavía</h3>
          <p className="text-text-secondary text-sm mt-1 mb-6">Establece tu primer objetivo para empezar a ahorrar.</p>
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="bg-primary/10 text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
          >
            Crear mi primera meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onAddFunds={handleOpenContribution} 
            />
          ))}
        </div>
      )}

      <div className="mt-12 bg-blue-50/50 border border-blue-100 p-6 rounded-card flex gap-4">
        <AlertCircle className="text-primary shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-primary text-xs uppercase tracking-widest">¿Cómo funciona el ahorro?</h4>
          <p className="text-xs text-text-secondary leading-relaxed mt-1">
            Al registrar un aporte, el sistema resta el monto del saldo de tu cuenta y lo suma al progreso visual de tu meta.
          </p>
        </div>
      </div>

      <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSuccess={loadData} />
      <ContributionModal 
        key={selectedGoal?.id || 'no-goal'} // Key para resetear el modal
        isOpen={isContribModalOpen} 
        onClose={() => setIsContribModalOpen(false)} 
        goal={selectedGoal} 
        accounts={accounts} 
        onSuccess={loadData} 
      />
    </div>
  );
};

export default Metas;