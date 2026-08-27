import { type ReactNode } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank 
} from 'lucide-react';
import { type FinancialMetric } from '../../types/dashboard';

interface FinancialOverviewProps {
  metrics: {
    available: number;
    income: FinancialMetric;
    expenses: FinancialMetric;
    savings: FinancialMetric;
  };
}

// Interfaz para corregir el error de "any"
interface MetricCardProps {
  metric: FinancialMetric;
  icon: ReactNode;
  color: string;
  bg: string;
}

export const FinancialOverview = ({ metrics }: FinancialOverviewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Tarjeta de Disponible */}
      <div className="bg-primary p-6 rounded-card shadow-lg shadow-primary/20 text-white relative overflow-hidden group">
        <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Wallet size={120} />
        </div>
        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Dinero disponible</p>
        <h3 className="text-2xl font-bold mt-1">
          ${metrics.available.toLocaleString()}
        </h3>
        <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase bg-white/20 w-fit px-2 py-1 rounded-full">
          <span>Actualizado</span>
        </div>
      </div>

      <MetricCard 
        metric={metrics.income} 
        icon={<TrendingUp size={20}/>} 
        color="text-green-600" 
        bg="bg-green-50" 
      />
      <MetricCard 
        metric={metrics.expenses} 
        icon={<TrendingDown size={20}/>} 
        color="text-red-600" 
        bg="bg-red-50" 
      />
      <MetricCard 
        metric={metrics.savings} 
        icon={<PiggyBank size={20}/>} 
        color="text-blue-600" 
        bg="bg-blue-50" 
      />
    </div>
  );
};

const MetricCard = ({ metric, icon, color, bg }: MetricCardProps) => {
  const isPositive = metric.trend === 'up';

  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm transition-all hover:border-primary/30 group">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${bg} ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
          {Math.abs(metric.change)}%
        </div>
      </div>
      <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mt-4">{metric.title}</p>
      <h3 className="text-xl font-bold text-text mt-1">
        ${metric.value.toLocaleString()}
      </h3>
    </div>
  );
};