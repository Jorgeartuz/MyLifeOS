import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CalendarDays, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Header = () => {
  const location = useLocation();
  const [name, setName] = useState('Mi perfil');
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data: { user } }) => { if (active) setName(String(user?.user_metadata.full_name || 'Mi perfil')); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setName(String(session?.user.user_metadata.full_name || 'Mi perfil'));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const titles: Record<string, string> = { '/': 'Dashboard', '/finanzas': 'Finanzas', '/trabajo': 'Trabajo', '/moto': 'Moto', '/metas': 'Metas', '/deudas': 'Deudas', '/calendario': 'Calendario', '/configuracion': 'Configuración' };
  return <header className="h-16 bg-surface border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
    <h1 className="text-base md:text-lg font-bold tracking-tight">{titles[location.pathname] || 'MyLifeOs'}</h1>
    <div className="flex items-center gap-3">
      <Link to="/calendario" aria-label="Abrir calendario" className="p-2 text-text-secondary hover:bg-background rounded-full"><CalendarDays size={20} /></Link>
      <Link to="/configuracion" className="flex items-center gap-3" aria-label="Abrir mi perfil"><span className="text-sm font-semibold hidden md:block max-w-48 truncate">{name}</span><span className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-text-secondary"><User size={18} /></span></Link>
    </div>
  </header>;
};