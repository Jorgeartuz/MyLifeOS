import { useState } from 'react';
import { WorkHeader } from '../components/work/WorkHeader';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import { ActiveSessionCard } from '../components/work/ActiveSessionCard';
import { WorkSummary } from '../components/work/WorkSummary';
import { ProductivityMetrics } from '../components/work/ProductivityMetrics';
import { WorkChart } from '../components/work/WorkChart';
import { RecentWorkSessions } from '../components/work/RecentWorkSessions';
import { WorkQuickActions } from '../components/work/WorkQuickActions';
import { MyLifeInsight } from '../components/dashboard/MyLifeInsight';
import { 
  workSummaries, 
  recentSessions, 
  currentSessionMock, 
  workInsights 
} from '../components/work/mockData';
import { type WorkPeriod } from '../types/work';

const Trabajo = () => {
  // Estado explícitamente tipado
  const [period, setPeriod] = useState<WorkPeriod>('hoy');

  // Acceso directo sin fallbacks silenciosos
  const data = workSummaries[period];
  const insight = workInsights[period];

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <WorkHeader />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <ActiveSessionCard session={period === 'hoy' ? currentSessionMock : null} />
          
          <WorkSummary data={data} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <WorkChart />
            <ProductivityMetrics data={data} />
          </div>

          <RecentWorkSessions sessions={recentSessions} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Acciones de campo</h3>
            <WorkQuickActions />
          </section>

          <MyLifeInsight insight={insight.message} />

          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <h3 className="text-sm font-bold text-text uppercase mb-4 tracking-tight">Estado de la Moto</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Basado en tus kilómetros registrados, el sistema estima que te faltan 762 km para el próximo mantenimiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trabajo;