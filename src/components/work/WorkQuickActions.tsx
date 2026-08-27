import { Play, PlusCircle, MinusCircle, Navigation, Square } from 'lucide-react';

export const WorkQuickActions = () => {
  const actions = [
    { label: 'Iniciar', icon: <Play size={20} fill="currentColor" />, color: 'text-primary bg-primary/5 border-primary/20' },
    { label: 'Ingreso', icon: <PlusCircle size={20} />, color: 'text-green-600 bg-green-50 border-green-100' },
    { label: 'Gasto', icon: <MinusCircle size={20} />, color: 'text-red-600 bg-red-50 border-red-100' },
    { label: 'Km', icon: <Navigation size={20} />, color: 'text-orange-600 bg-orange-50 border-orange-100' },
    { label: 'Cerrar', icon: <Square size={20} fill="currentColor" />, color: 'text-text-secondary bg-background border-border' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      {actions.map((a, i) => (
        <button 
          key={i}
          onClick={() => console.log(a.label)}
          className={`flex flex-col items-center justify-center p-4 rounded-card border transition-all active:scale-95 ${a.color}`}
        >
          {a.icon}
          <span className="text-[10px] font-black uppercase mt-2 tracking-widest">{a.label}</span>
        </button>
      ))}
    </div>
  );
};