import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, BriefcaseBusiness, Bike, Menu } from 'lucide-react';

export const MobileNav = () => {
  const items = [
    { path: '/', icon: <LayoutDashboard size={24} />, label: 'Inicio' },
    { path: '/finanzas', icon: <Wallet size={24} />, label: 'Finanzas' },
    { path: '/trabajo', icon: <BriefcaseBusiness size={24} />, label: 'Trabajo' },
    { path: '/moto', icon: <Bike size={24} />, label: 'Moto' },
    { path: '/configuracion', icon: <Menu size={24} />, label: 'Más' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-2 py-1 flex justify-around items-center z-50 pb-safe">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors
            ${isActive ? 'text-primary' : 'text-text-secondary'}
          `}
        >
          {item.icon}
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};