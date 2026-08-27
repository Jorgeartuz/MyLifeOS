import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { type FinanceSummary } from '../../types/finance';

export const BalanceCard = ({ summary }: { summary: FinanceSummary }) => {
  return (
    <div className="bg-primary p-8 rounded-card shadow-xl shadow-primary/20 text-white relative overflow-hidden group mb-8">
      <div className="absolute right-[-5%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
        <Wallet size={160} />
      </div>
      
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Balance Total</p>
        <h2 className="text-4xl font-bold mt-2">${summary.balance.toLocaleString()}</h2>
        
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase mb-1">
              <TrendingUp size={14} /> Ingresos
            </div>
            <p className="font-bold text-lg">${summary.totalIncome.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase mb-1">
              <TrendingDown size={14} /> Gastos
            </div>
            <p className="font-bold text-lg">${summary.totalExpenses.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase mb-1">
              <PiggyBank size={14} /> Ahorro
            </div>
            <p className="font-bold text-lg">${summary.savings.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};