import { useState, useMemo } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FinancialOverview } from '../components/dashboard/FinancialOverview';
import { WorkOverview } from '../components/dashboard/WorkOverview';
import { FinancialChart } from '../components/dashboard/FinancialChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { MotorcycleStatus } from '../components/dashboard/MotorcycleStatus';
import { GoalProgress } from '../components/dashboard/GoalProgress';
import { UpcomingEvents } from '../components/dashboard/UpcomingEvents';
import { MyLifeInsight } from '../components/dashboard/MyLifeInsight';
import { mockDashboardData, recentTransactions, upcomingEvents, insights } from '../components/dashboard/mockData';

const Dashboard = () => {
  const [period, setPeriod] = useState('hoy');
  const data = useMemo(() => mockDashboardData[period] || mockDashboardData.hoy, [period]);

  const randomInsight = useMemo(() => {
    return insights[Math.floor(Math.random() * insights.length)];
  }, [period]);

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
          <MyLifeInsight insight={randomInsight} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;