import { useState, useEffect, useCallback } from 'react';
import { WorkHeader } from '../components/work/WorkHeader';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import { ActiveSessionCard } from '../components/work/ActiveSessionCard';
import { WorkSummary } from '../components/work/WorkSummary';
import { ProductivityMetrics } from '../components/work/ProductivityMetrics';
import { WorkChart } from '../components/work/WorkChart';
import { RecentWorkSessions } from '../components/work/RecentWorkSessions';
import { WorkQuickActions } from '../components/work/WorkQuickActions';
import { WorkModal } from '../components/work/WorkModal';
import { workService } from '../services/work.service';
import { type WorkPeriod, type WorkSession, type WorkSummaryData } from '../types/work';
import { Loader2 } from 'lucide-react';

const Trabajo = () => {
  const [period, setPeriod] = useState<WorkPeriod>('hoy');
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [active, history] = await Promise.all([
        workService.getActiveSession(),
        workService.getSessions(period)
      ]);
      setActiveSession(active);
      setSessions(history);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  // SOLUCIÓN LINTER: Ejecución segura del efecto asíncrono
  useEffect(() => {
    let isMounted = true;
    const executeLoad = async () => {
      if (isMounted) await loadData();
    };
    executeLoad();
    return () => { isMounted = false; };
  }, [loadData]);

  const summary: WorkSummaryData = sessions.reduce((acc, s) => ({
    grossIncome: acc.grossIncome + Number(s.gross_income),
    deliveries: acc.deliveries + s.deliveries,
    kilometers: acc.kilometers + Number(s.kilometers),
    workedMinutes: acc.workedMinutes + (s.worked_minutes || 0),
    fuelCost: acc.fuelCost + Number(s.fuel_cost),
    otherCosts: acc.otherCosts + Number(s.other_costs),
    totalSessions: acc.totalSessions + 1,
    workedHours: (acc.workedMinutes + (s.worked_minutes || 0)) / 60
  }), { grossIncome: 0, deliveries: 0, kilometers: 0, workedMinutes: 0, fuelCost: 0, otherCosts: 0, totalSessions: 0, workedHours: 0 });

  const handleStartWork = async () => {
    try {
      await workService.startSession();
      await loadData();
    } catch (err: unknown) { // CORRECCIÓN: eliminada el any
      const message = err instanceof Error ? err.message : 'Error desconocido';
      alert(message);
    }
  };

  const handleEndWork = async () => {
    if (!activeSession) return;
    if (window.confirm("¿Deseas finalizar la jornada actual?")) {
      try {
        await workService.endSession(activeSession);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <WorkHeader />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <ActiveSessionCard 
            session={activeSession} 
            onEnd={handleEndWork} 
            onUpdate={() => setIsModalOpen(true)}
          />
          
          <WorkSummary data={summary} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <WorkChart />
            <ProductivityMetrics data={summary} />
          </div>

          <RecentWorkSessions sessions={sessions.filter(s => s.status === 'completed')} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <WorkQuickActions 
            hasActiveSession={!!activeSession} 
            onStart={handleStartWork}
            onUpdate={() => setIsModalOpen(true)}
            onEnd={handleEndWork}
          />
        </div>
      </div>

      <WorkModal 
  // La KEY es la clave. Al cambiar el ID o el estado de apertura, 
  // React destruye el modal viejo y crea uno nuevo con los datos frescos en el useState.
  key={`${activeSession?.id}-${isModalOpen}`} 
  isOpen={isModalOpen} 
  session={activeSession} 
  onClose={() => setIsModalOpen(false)} 
  onSave={async (updates) => {
    if (activeSession) {
      await workService.updateSession(activeSession.id, updates);
      await loadData();
    }
  }}
/>
    </div>
  );
};

export default Trabajo;