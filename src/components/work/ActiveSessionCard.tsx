import { Play, Square, Clock, Navigation, Package } from 'lucide-react';
import { type WorkSession } from '../../types/work';

export const ActiveSessionCard = ({ session }: { session: WorkSession | null }) => {
  if (!session) {
    return (
      <div className="bg-surface border-2 border-dashed border-border p-8 rounded-card text-center">
        <p className="text-text-secondary font-medium mb-4">No hay una jornada activa</p>
        <button 
          onClick={() => console.log('Iniciar jornada')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors"
        >
          <Play size={18} fill="currentColor" /> Iniciar jornada
        </button>
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
      
      <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Jornada en curso</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Inicio</p>
          <p className="text-lg font-bold text-text">{session.startTime}</p>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-primary opacity-40" />
          <div>
            <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Tiempo</p>
            <p className="text-lg font-bold text-text">4h 35m</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Package size={20} className="text-primary opacity-40" />
          <div>
            <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Entregas</p>
            <p className="text-lg font-bold text-text">{session.deliveries}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Navigation size={20} className="text-primary opacity-40" />
          <div>
            <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">Distancia</p>
            <p className="text-lg font-bold text-text">{session.kilometers} km</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
        <div>
          <p className="text-[10px] text-text-secondary font-bold uppercase">Ganancia estimada</p>
          <p className="text-xl font-black text-green-600">${session.netProfit.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => console.log('Finalizar jornada')}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors"
        >
          <Square size={16} fill="currentColor" /> Finalizar
        </button>
      </div>
    </div>
  );
};