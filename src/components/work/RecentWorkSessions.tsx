import { type WorkSession } from '../../types/work';
import { ChevronRight } from 'lucide-react';

export const RecentWorkSessions = ({ sessions }: { sessions: WorkSession[] }) => {
  return (
    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-text text-sm uppercase tracking-tight">Jornadas recientes</h3>
        <button className="text-primary text-xs font-bold hover:underline" type="button">Ver todas</button>
      </div>
      <div className="divide-y divide-border">
        {sessions.map((s) => {
          // Calculamos valores derivados que no están en la tabla directamente
          const dateObj = new Date(s.start_time);
          const day = dateObj.toLocaleDateString('es-ES', { day: '2-digit' });
          const month = dateObj.toLocaleDateString('es-ES', { month: 'short' });
          const netProfit = s.gross_income - s.fuel_cost - s.other_costs;
          const workedHours = s.worked_minutes ? (s.worked_minutes / 60).toFixed(1) : '0';

          return (
            <div key={s.id} className="p-4 flex items-center justify-between hover:bg-background transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[50px]">
                  <p className="text-xs font-black text-text uppercase leading-none">{day}</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">{month}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                    {s.deliveries} domicilios • {s.kilometers} km
                  </p>
                  <p className="text-[10px] text-text-secondary font-medium tracking-tight">
                    {workedHours}h trabajadas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-black text-green-600 tracking-tight">
                    +${netProfit.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold">Ganancia Neta</p>
                </div>
                <ChevronRight size={16} className="text-text-secondary" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};