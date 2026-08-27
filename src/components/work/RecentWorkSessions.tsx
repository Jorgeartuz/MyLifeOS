import { type WorkSession } from '../../types/work';
import { ChevronRight } from 'lucide-react';

export const RecentWorkSessions = ({ sessions }: { sessions: WorkSession[] }) => {
  return (
    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-text text-sm uppercase tracking-tight">Jornadas recientes</h3>
        <button className="text-primary text-xs font-bold hover:underline">Ver todas</button>
      </div>
      <div className="divide-y divide-border">
        {sessions.map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between hover:bg-background transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[50px]">
                <p className="text-xs font-black text-text uppercase leading-none">{s.date.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-text-secondary uppercase">{s.date.split(' ')[1]}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{s.deliveries} domicilios • {s.kilometers} km</p>
                <p className="text-[10px] text-text-secondary font-medium tracking-tight">
                  {s.startTime} - {s.endTime} ({s.workedHours}h)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-green-600 tracking-tight">+${s.netProfit.toLocaleString()}</p>
                <p className="text-[10px] text-text-secondary uppercase font-bold">Ganancia Real</p>
              </div>
              <ChevronRight size={16} className="text-text-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};