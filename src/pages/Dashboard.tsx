import { useState } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FinancialOverview } from '../components/dashboard/FinancialOverview';
import { WorkOverview } from '../components/dashboard/WorkOverview';
import { FinancialChart } from '../components/dashboard/FinancialChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import { MotorcycleStatus } from '../components/dashboard/MotorcycleStatus';
import { GoalProgress } from '../components/dashboard/GoalProgress';
import { UpcomingEvents } from '../components/dashboard/UpcomingEvents';
import { MyLifeInsight } from '../components/dashboard/MyLifeInsight';
import { mockDashboardData, recentTransactions, upcomingEvents } from '../components/dashboard/mockData';
import { type WorkPeriod } from '../types/work';

const Dashboard = () => {
  const [period, setPeriod] = useState<WorkPeriod>('hoy');
  const data = mockDashboardData[period];

  // Insight estático para el Dashboard basado en el periodo para evitar Math.random()
  const dashboardInsights: Record<WorkPeriod, string> = {
    hoy: "Tu disponible ha aumentado un 12% tras la jornada de la mañana.",
    semana: "Llevas un ritmo de ahorro excelente para tu meta de fondo de emergencia.",
    mes: "Este mes has reducido tus gastos hormiga en un 15%."
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <DashboardHeader />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <FinancialOverview metrics={data.financials} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FinancialChart />
            <WorkOverview data={data.work} />
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Acceso rápido</h3>
            <QuickActions />
          </section>
          <MotorcycleStatus moto={data.moto} />
          <GoalProgress goal={data.goal} />
          <UpcomingEvents events={upcomingEvents} />
          <MyLifeInsight insight={dashboardInsights[period]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;