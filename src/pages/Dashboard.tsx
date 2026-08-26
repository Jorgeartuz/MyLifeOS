import { useState, useMemo } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FinancialOverview } from '../components/dashboard/FinancialOverview';
import { WorkOverview } from '../components/dashboard/WorkOverview';
import { FinancialChart } from '../components/dashboard/FinancialChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { mockDashboardData, recentTransactions, upcomingEvents, insights } from '../components/dashboard/mockData';
import { Bike, Target, Calendar, Info } from 'lucide-react';

const Dashboard = () => {
  const [period, setPeriod] = useState('hoy');
  
  // Obtenemos los datos según el periodo seleccionado
  const data = mockDashboardData[period] || mockDashboardData.hoy;

  // Calculamos el insight una sola vez al montar el componente para evitar el error de "impure function"
  const randomInsight = useMemo(() => {
    return insights[Math.floor(Math.random() * insights.length)];
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER Y SELECTOR DE PERIODO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <DashboardHeader />
        
        <div className="flex bg-surface p-1 rounded-xl border border-border w-fit h-fit self-start">
          {['hoy', 'semana', 'mes'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                period === p ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA (Principal) */}
        <div className="lg:col-span-8 space-y-8">
          <FinancialOverview metrics={data.financials} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FinancialChart />
            <WorkOverview data={data.work} />
          </div>

          <RecentTransactions transactions={recentTransactions} />
        </div>

        {/* COLUMNA DERECHA (Side) */}
        <div className="lg:col-span-4 space-y-8">
          
          <section>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Acceso rápido</h3>
            <QuickActions />
          </section>

          {/* Estado de la Moto */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Bike size={20}/>
              </div>
              <h3 className="font-bold text-text">Estado de Moto</h3>
            </div>
            <p className="text-sm font-bold text-text uppercase tracking-tight">{data.moto.model}</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-medium">Kilometraje</span>
                <span className="font-bold">{data.moto.kilometers.toLocaleString()} km</span>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-[10px] font-bold text-text-secondary uppercase">Próximo: {data.moto.nextMaintenance}</p>
                <p className="text-sm font-bold text-primary mt-1">Faltan {(data.moto.nextMaintenanceKm - data.moto.kilometers).toLocaleString()} km</p>
              </div>
            </div>
          </div>

          {/* Meta de Ahorro */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-primary rounded-lg">
                <Target size={20}/>
              </div>
              <h3 className="font-bold text-text">Meta Principal</h3>
            </div>
            <p className="text-sm font-bold text-text">{data.goal.name}</p>
            <div className="mt-4">
               <div className="flex justify-between text-xs mb-2">
                 <span className="font-bold text-primary">{Math.round((data.goal.current / data.goal.target) * 100)}%</span>
                 <span className="text-text-secondary">${data.goal.current.toLocaleString()} / ${data.goal.target.toLocaleString()}</span>
               </div>
               <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
                 <div 
                   className="h-full bg-primary rounded-full transition-all duration-1000" 
                   style={{ width: `${(data.goal.current / data.goal.target) * 100}%` }}
                 />
               </div>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar size={20}/>
              </div>
              <h3 className="font-bold text-text">Próximos eventos</h3>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex justify-between items-center text-sm group">
                  <span className="font-medium text-text group-hover:text-primary transition-colors">{event.title}</span>
                  <span className="px-2 py-1 bg-background rounded text-[10px] font-bold text-text-secondary">{event.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-card">
             <div className="flex items-center gap-2 mb-3 text-primary">
                <Info size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">MyLife Insight</h3>
             </div>
             <p className="text-sm text-text leading-relaxed font-medium italic">
                "{randomInsight}"
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;