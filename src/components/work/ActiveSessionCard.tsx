import { Square, Clock, Navigation, Edit2 } from 'lucide-react'; // Eliminados Play y Package
import { type WorkSession } from '../../types/work';

interface ActiveSessionCardProps {
  session: WorkSession | null;
  onEnd: () => Promise<void>;
  onUpdate: () => void;
}

export const ActiveSessionCard = ({ session, onEnd, onUpdate }: ActiveSessionCardProps) => {
  if (!session) {
    return (
      <div className="bg-surface border-2 border-dashed border-border p-8 rounded-card text-center">
        <p className="text-text-secondary font-medium mb-4">No hay una jornada activa</p>
        <div className="flex items-center justify-center gap-3">
           <p className="text-xs text-text-secondary italic">Presiona "Iniciar" para comenzar a registrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-primary/20 rounded-card p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Jornada en curso</h3>
        <button 
          onClick={onUpdate}
          className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          title="Actualizar datos"
        >
          <Edit2 size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Inicio</p>
          <p className="text-lg font-bold text-text">
            {new Date(session.start_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-primary opacity-40" />
          <div>
            <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Entregas</p>
            <p className="text-lg font-bold text-text">{session.deliveries}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Navigation size={20} className="text-primary opacity-40" />
          <div>
            <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Km</p>
            <p className="text-lg font-bold text-text">{session.kilometers}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full">
            <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Ganancia</p>
            <p className="text-lg font-bold text-green-600">${Number(session.gross_income - session.fuel_cost - session.other_costs).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex justify-end">
        <button 
          onClick={onEnd}
          className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors"
        >
          <Square size={16} fill="currentColor" /> Finalizar Jornada
        </button>
      </div>
    </div>
  );
};