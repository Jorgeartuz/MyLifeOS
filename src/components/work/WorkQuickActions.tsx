import { Play, PlusCircle, MinusCircle, Navigation, Square } from 'lucide-react';

interface WorkQuickActionsProps {
  hasActiveSession: boolean;
  onStart: () => Promise<void>;
  onUpdate: () => void;
  onEnd: () => Promise<void>;
}

export const WorkQuickActions = ({ hasActiveSession, onStart, onUpdate, onEnd }: WorkQuickActionsProps) => {
  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
      <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 text-center">Acciones de campo</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {!hasActiveSession ? (
          <button 
            onClick={onStart}
            className="col-span-2 flex flex-col items-center justify-center p-6 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Play size={24} fill="currentColor" />
            <span className="text-[10px] font-black uppercase mt-2 tracking-widest">Iniciar Jornada</span>
          </button>
        ) : (
          <>
            <button 
              onClick={onUpdate}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-green-100 bg-green-50 text-green-600 hover:bg-green-100 transition-all active:scale-95"
            >
              <PlusCircle size={20} />
              <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Ingreso</span>
            </button>
            <button 
              onClick={onUpdate}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95"
            >
              <MinusCircle size={20} />
              <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Gasto</span>
            </button>
            <button 
              onClick={onUpdate}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-orange-100 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all active:scale-95"
            >
              <Navigation size={20} />
              <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Registrar Km</span>
            </button>
            <button 
              onClick={onEnd}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background text-text-secondary hover:bg-border transition-all active:scale-95"
            >
              <Square size={20} fill="currentColor" />
              <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Cerrar</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};