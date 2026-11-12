import { useState, useEffect, useCallback, useRef } from 'react'; // 1. Añadimos useRef
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FinancialOverview } from '../components/dashboard/FinancialOverview';
import { WorkOverview } from '../components/dashboard/WorkOverview';
import { FinancialChart } from '../components/dashboard/FinancialChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import { MotorcycleStatus } from '../components/dashboard/MotorcycleStatus';
import { GoalProgress } from '../components/dashboard/GoalProgress';
import { MyLifeInsight } from '../components/dashboard/MyLifeInsight';
import { dashboardService } from '../services/dashboard.service';
import { type WorkPeriod } from '../types/work';
import { type Transaction } from '../types/finance';
import { type SavingsGoal } from '../types/goals';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Motorcycle } from '../types/life';
import { errorMessage } from '../lib/life';
import { Feedback } from '../components/ui/Module';

interface DashboardSummary {
  user: { firstName: string };
  finances: {
    balance: number;
    income: number;
    expenses: number;
    recentTransactions: Transaction[];
  };
  work: {
    income: number;
    deliveries: number;
    kilometers: number;
    hours: number;
    fuelCost: number;
    otherCosts: number;
  };
  moto: (Motorcycle & { next_service_name?: string }) | null;
  goal: SavingsGoal | null;
}

const Dashboard = () => {
  const [period, setPeriod] = useState<WorkPeriod>('semana');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  
  // 2. Usamos una referencia para rastrear el primer renderizado
  const isFirstRender = useRef(true);

  const loadDashboard = useCallback(async () => {
    try {
      const result = await dashboardService.getDashboardData(period);
      setData(result);
      setError('');
    } catch (error) {
      console.error("Error al cargar Dashboard:", error);
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    let isMounted = true;

    const executeLoad = async () => {
      if (!isMounted) return;

      // 3. Si no es la primera vez (ej. el usuario cambió el periodo), mostramos el loading
      if (!isFirstRender.current) {
        setLoading(true);
      }
      
      await loadDashboard();
      
      // Ya no es el primer renderizado
      isFirstRender.current = false;
    };

    executeLoad();

    return () => {
      isMounted = false;
    };
  }, [loadDashboard]); // Ahora el linter no pide 'data' porque ya no la usamos aquí

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-text-secondary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium animate-pulse">Sincronizando MyLifeOS...</p>
      </div>
    );
  }

  if (!data) return <div className="space-y-4"><Feedback error={error} /><button className="module-button" onClick={loadDashboard}>Volver a intentar</button></div>;

  const financialMetrics = {
    available: data.finances.balance,
    income: { title: 'Ingresos', value: data.finances.income, change: 0, trend: 'neutral' as const },
    expenses: { title: 'Gastos', value: data.finances.expenses, change: 0, trend: 'neutral' as const },
    savings: { title: 'Ahorro', value: data.finances.income - data.finances.expenses, change: 0, trend: 'neutral' as const }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <Feedback error={error} />
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <DashboardHeader name={data.user.firstName} />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <FinancialOverview metrics={financialMetrics} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FinancialChart income={data.finances.income} expenses={data.finances.expenses} />
            <WorkOverview data={data.work} />
          </div>

          <RecentTransactions transactions={data.finances.recentTransactions} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Acceso rápido</h3>
            <QuickActions />
          </section>
          
          {data.moto ? <MotorcycleStatus moto={{
            model: data.moto.model,
            kilometers: Number(data.moto.odometer),
            status: 'Operativa',
            nextMaintenance: data.moto.next_service_name || 'Mantenimiento programado',
            nextMaintenanceKm: data.moto.next_maintenance_km,
            lastMaintenanceKm: 0
          }} /> : <Link to="/moto" className="block bg-surface p-6 rounded-card border border-border text-primary">Registra tu moto para ver su estado.</Link>}

          {data.goal ? (
            <GoalProgress goal={{
              name: data.goal.name,
              current: data.goal.current_amount || 0,
              target: data.goal.target_amount
            }} />
          ) : (
            <div className="bg-surface p-6 rounded-card border border-dashed border-border text-center">
              <p className="text-xs text-text-secondary italic">No tienes metas establecidas</p>
            </div>
          )}

          <MyLifeInsight insight={`Has realizado ${data.work.deliveries} domicilios en este periodo.`} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
