import { useLocation } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  
  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    const cleanPath = path.replace('/', '');
    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
  };

  return (
    <header className="h-16 bg-surface border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-base md:text-lg font-bold text-text tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center relative mr-2">
           <button 
            aria-label="Buscar"
            className="p-2 text-text-secondary hover:bg-background rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
        </div>

        <button 
          aria-label="Notificaciones"
          className="p-2 text-text-secondary hover:bg-background rounded-full transition-all active:scale-95 relative group"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-surface animate-pulse group-hover:animate-none"></span>
        </button>
        
        <div className="w-px h-6 bg-border mx-2 hidden md:block" />
        
        <div className="flex items-center gap-3 ml-1">
          <span className="text-sm font-semibold text-text hidden md:block">Jorge</span>
          <button 
            aria-label="Perfil de usuario"
            className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-text-secondary hover:border-primary/40 transition-colors active:ring-2 ring-primary/20"
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};