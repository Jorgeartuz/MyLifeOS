import { Calendar } from 'lucide-react';
import { type EventItem } from '../../types/dashboard';

export const UpcomingEvents = ({ events }: { events: EventItem[] }) => (
  <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={20}/></div>
      <h3 className="font-bold text-text text-sm uppercase tracking-tight">Próximos eventos</h3>
    </div>
    <div className="space-y-4">
      {events.map((e, i) => (
        <div key={i} className="flex justify-between items-center text-sm group">
          <span className="font-medium text-text group-hover:text-primary transition-colors tracking-tight">{e.title}</span>
          <span className="px-2 py-1 bg-background rounded text-[10px] font-bold text-text-secondary">{e.date}</span>
        </div>
      ))}
    </div>
  </div>
);