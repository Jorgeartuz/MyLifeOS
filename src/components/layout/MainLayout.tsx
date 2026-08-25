import { type ReactNode } from 'react'; // Agregamos 'type' aquí
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background text-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 md:p-8 pb-24 md:pb-10 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
};