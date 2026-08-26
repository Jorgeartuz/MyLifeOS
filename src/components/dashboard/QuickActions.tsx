import { PlusCircle, MinusCircle, Play, Navigation, Wrench, Target } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    { label: 'Ingreso', icon: <PlusCircle />, color: 'bg-green-50 text-green-600 border-green-100' },
    { label: 'Gasto', icon: <MinusCircle />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Jornada', icon: <Play />, color: 'bg-blue-50 text-primary border-blue-100' },
    { label: 'Km', icon: <Navigation />, color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { label: 'Moto', icon: <Wrench />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Meta', icon: <Target />, color: 'bg-gray-50 text-gray-600 border-gray-100' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {actions.map((action, i) => (
        <button
          key={i}
          className={`flex flex-col items-center justify-center p-3 rounded-card border transition-all hover:scale-[1.02] active:scale-95 ${action.color}`}
          aria-label={`Acción rápida: ${action.label}`}
        >
          {action.icon}
          <span className="text-[10px] font-bold uppercase mt-2 tracking-tight">{action.label}</span>
        </button>
      ))}
    </div>
  );
};