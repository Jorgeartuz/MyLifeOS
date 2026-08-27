import { useState, useMemo } from 'react';
import { WorkHeader } from '../components/work/WorkHeader';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { ActiveSessionCard } from '../components/work/ActiveSessionCard';
import { WorkSummary } from '../components/work/WorkSummary';
import { ProductivityMetrics } from '../components/work/ProductivityMetrics';
import { WorkChart } from '../components/work/WorkChart';
import { RecentWorkSessions } from '../components/work/RecentWorkSessions';
import { WorkQuickActions } from '../components/work/WorkQuickActions';
import { workSummaries, recentSessions, currentSessionMock } from '../components/work/mockData';
import { Info } from 'lucide-react';

const Trabajo = () => {
  const [period, setPeriod] = useState('hoy');
  
  // SOLUCIÓN AL LINTER: Estado inicial para el insight (se calcula una sola vez)
  const [workInsight] = useState(() => {
    const insights = [
      "Esta semana recorriste 15% menos kilómetros y generaste más ingresos.",
      "Tu ganancia por hora hoy es un 12% superior al promedio del mes.",
      "El sábado sigue siendo tu día más productivo en términos de $/km."
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  });

  const data = useMemo(() => workSummaries[period] || workSummaries.hoy, [period]);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <WorkHeader />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-8 space-y-8">
          <ActiveSessionCard session={period === 'hoy' ? currentSessionMock : null} />
          
          <WorkSummary data={data} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <WorkChart />
            <ProductivityMetrics data={data} />
          </div>

          <RecentWorkSessions sessions={recentSessions} />
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-4 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Acciones de campo</h3>
            <WorkQuickActions />
          </section>

          {/* Insight Card */}
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-card">
             <div className="flex items-center gap-2 mb-3 text-primary">
                <Info size={18} />
                <h3 className="font-bold text-xs uppercase tracking-widest">Work Insight</h3>
             </div>
             <p className="text-sm text-text leading-relaxed font-medium italic">
                "{workInsight}"
             </p>
          </div>

          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <h3 className="text-sm font-bold text-text uppercase mb-4 tracking-tight">Estado de la Moto</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Basado en tus kilómetros de hoy, te faltan 721 km para el próximo cambio de aceite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trabajo;