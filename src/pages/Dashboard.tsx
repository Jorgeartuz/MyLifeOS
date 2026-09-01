import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
import { financeService } from '../services/finance.service';
import { workSummaries, motoMock, goalMock, workInsights } from '../components/dashboard/mockData';
import { type Transaction } from '../types/finance';
import { type WorkPeriod } from '../types/work';
import { Loader2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [period, setPeriod] = useState<WorkPeriod>('semana');
  const [userName, setUserName] = useState('Jorge');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para datos reales de Finanzas
  const [financialData, setFinancialData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    transactions: [] as Transaction[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener información del perfil del usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
          }
        }

        // 2. Obtener datos financieros reales usando el servicio existente
        const [accounts, transactions] = await Promise.all([
          financeService.getAccounts(),
          financeService.getTransactions(5) // Solo los últimos 5 para el Dashboard
        ]);

        const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
        
        // Calculamos totales basados en las transacciones (V1)
        // Nota: En fases posteriores esto se filtrará por el 'period' seleccionado
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((acc, curr) => acc + Number(curr.amount), 0);

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((acc, curr) => acc + Number(curr.amount), 0);

        setFinancialData({
          balance: totalBalance,
          income: totalIncome,
          expenses: totalExpenses,
          transactions: transactions
        });

      } catch (err) {
        console.error("Error cargando Dashboard:", err);
        setError("No pudimos cargar algunos datos del Dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-text-secondary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Sincronizando MyLifeOS...</p>
      </div>
    );
  }

  // Preparamos las métricas para FinancialOverview manteniendo compatibilidad visual
  const realFinancialMetrics = {
    available: financialData.balance,
    income: { title: 'Ingresos', value: financialData.income, change: 0, trend: 'neutral' as const },
    expenses: { title: 'Gastos', value: financialData.expenses, change: 0, trend: 'neutral' as const },
    savings: { title: 'Ahorro', value: financialData.income - financialData.expenses, change: 0, trend: 'neutral' as const }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-card flex items-center gap-3 text-red-600 text-sm font-medium">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <DashboardHeader name={userName} />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* SECCIÓN REAL: Finanzas */}
          <FinancialOverview metrics={realFinancialMetrics} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FinancialChart />
            {/* SECCIÓN MOCK: Trabajo (Pendiente migración) */}
            <WorkOverview data={workSummaries[period]} />
          </div>

          {/* SECCIÓN REAL: Transacciones recientes */}
          <RecentTransactions transactions={financialData.transactions} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Acceso rápido</h3>
            <QuickActions />
          </section>
          
          {/* SECCIONES MOCK: Pendientes migración */}
          <MotorcycleStatus moto={motoMock} />
          <GoalProgress goal={goalMock} />
          <MyLifeInsight insight={workInsights[period]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;