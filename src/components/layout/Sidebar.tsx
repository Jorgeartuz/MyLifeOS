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
  ChevronRight
} from 'lucide-react';

const mainNav = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/finanzas', label: 'Finanzas', icon: <Wallet size={20} /> },
  { path: '/trabajo', label: 'Trabajo', icon: <BriefcaseBusiness size={20} /> },
  { path: '/moto', label: 'Moto', icon: <Bike size={20} /> },
  { path: '/metas', label: 'Metas', icon: <Target size={20} /> },
  { path: '/deudas', label: 'Deudas', icon: <CreditCard size={20} /> },
  { path: '/calendario', label: 'Calendario', icon: <CalendarDays size={20} /> },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`hidden md:flex flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out h-screen sticky top-0 z-40 ${
        isCollapsed ? 'w-[80px]' : 'w-64'
      }`}
      aria-label="Navegación principal"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/20">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight text-text uppercase transition-opacity duration-200">
              MyLife<span className="text-primary">OS</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-3 py-2.5 rounded-card transition-all duration-200 group
              ${isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-text-secondary hover:bg-background hover:text-text'}
            `}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
            )}
            
            {/* Tooltip visible solo cuando está colapsado */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-text text-white text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}

        {/* Separator */}
        <div className="my-4 border-t border-border mx-2" />

        <NavLink
          to="/configuracion"
          className={({ isActive }) => `
            relative flex items-center gap-3 px-3 py-2.5 rounded-card transition-all duration-200 group
            ${isActive 
              ? 'bg-primary/10 text-primary' 
              : 'text-text-secondary hover:bg-background hover:text-text'}
          `}
        >
          <Settings size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap text-sm">Configuración</span>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-text text-white text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Configuración
            </div>
          )}
        </NavLink>
      </nav>

      {/* User & Collapse Section */}
      <div className="p-4 bg-background/50 border-t border-border mt-auto">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          className="w-full flex items-center gap-3 px-3 py-2 mb-3 text-text-secondary hover:bg-surface hover:text-text rounded-card transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} className="mx-auto" /> : (
            <>
              <ChevronLeft size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">Ocultar menú</span>
            </>
          )}
        </button>

        <div className={`flex items-center gap-3 p-2 bg-surface rounded-card border border-border shadow-sm ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0 text-xs shadow-sm">
            J
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-text">Jorge</p>
              <p className="text-[10px] text-text-secondary truncate font-medium">Mi cuenta</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};