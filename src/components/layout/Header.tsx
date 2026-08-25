import { useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  
  const getTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    const title = path.split('/')[1];
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <header className="h-16 md:h-20 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-lg md:text-xl font-bold text-text">
          {getTitle(location.pathname)}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-text-secondary hover:bg-background rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-border">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-text">Jorge</p>
            <p className="text-xs text-text-secondary">Usuario</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-text-secondary">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};