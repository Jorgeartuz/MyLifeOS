import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  BriefcaseBusiness, 
  Bike, 
  MoreHorizontal,
  Target,
  CreditCard,
  CalendarDays,
  Settings,
  X
} from 'lucide-react';

export const MobileNav = () => {
  const [showMore, setShowMore] = useState(false);

  const primaryItems = [
    { path: '/', icon: <LayoutDashboard size={24} />, label: 'Inicio' },
    { path: '/finanzas', icon: <Wallet size={24} />, label: 'Dinero' },
    { path: '/trabajo', icon: <BriefcaseBusiness size={24} />, label: 'Trabajo' },
    { path: '/moto', icon: <Bike size={24} />, label: 'Moto' },
  ];

  const secondaryItems = [
    { path: '/metas', icon: <Target size={20} />, label: 'Metas' },
    { path: '/deudas', icon: <CreditCard size={20} />, label: 'Deudas' },
    { path: '/calendario', icon: <CalendarDays size={20} />, label: 'Calendario' },
    { path: '/configuracion', icon: <Settings size={20} />, label: 'Configuración' },
  ];

  return (
    <>
      {/* Overlay del Menú "Más" */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end justify-center bg-text/20 backdrop-blur-sm">
          <div className="w-full bg-surface rounded-t-[20px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-text text-lg">Otras opciones</h3>
              <button 
                onClick={() => setShowMore(false)}
                className="p-2 bg-background rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className="flex items-center gap-3 p-4 bg-background rounded-card border border-border active:scale-95 transition-all"
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegación Principal */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-2 flex justify-around items-center z-50 h-16 pb-safe">
        {primaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors
              ${isActive ? 'text-primary' : 'text-text-secondary'}
            `}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 font-bold tracking-tight uppercase">{item.label}</span>
          </NavLink>
        ))}
        
        <button
          onClick={() => setShowMore(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${showMore ? 'text-primary' : 'text-text-secondary'}`}
        >
          <MoreHorizontal size={24} />
          <span className="text-[10px] mt-0.5 font-bold tracking-tight uppercase">Más</span>
        </button>
      </nav>
    </>
  );
};