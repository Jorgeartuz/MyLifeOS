import { type ReactNode } from 'react'; // Agregamos 'type' aquí
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DailyAllocation } from '../finance/DailyAllocation';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { pathname } = useLocation();
  return (
    <div className="app-shell flex bg-background text-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden">
          <div className="app-content p-4 md:p-8 max-w-[1400px] mx-auto w-full">
            {pathname !== '/' && <DailyAllocation />}
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
};
