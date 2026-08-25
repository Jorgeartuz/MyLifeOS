import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  BriefcaseBusiness, 
  Bike, 
  Target, 
  CreditCard, 
  CalendarDays, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
  { path: '/finanzas', label: 'Finanzas', icon: <Wallet size={22} /> },
  { path: '/trabajo', label: 'Trabajo', icon: <BriefcaseBusiness size={22} /> },
  { path: '/moto', label: 'Moto', icon: <Bike size={22} /> },
  { path: '/metas', label: 'Metas', icon: <Target size={22} /> },
  { path: '/deudas', label: 'Deudas', icon: <CreditCard size={22} /> },
  { path: '/calendario', label: 'Calendario', icon: <CalendarDays size={22} /> },
  { path: '/configuracion', label: 'Configuración', icon: <Settings size={22} /> },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`hidden md:flex flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out h-screen sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight text-primary uppercase">MyLifeOS</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : ''}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-card transition-all duration-200 group
              ${isActive 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'text-text-secondary hover:bg-background hover:text-text'}
            `}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-border space-y-4">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 text-text-secondary hover:bg-background rounded-card transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span className="text-sm font-medium">Colapsar</span>}
        </button>

        <div className={`flex items-center gap-3 px-2 py-2 bg-background rounded-card ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
            J
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-text">Jorge</p>
              <button className="text-[10px] text-text-secondary hover:text-red-500 flex items-center gap-1 transition-colors uppercase font-bold tracking-wider">
                <LogOut size={10} /> Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};