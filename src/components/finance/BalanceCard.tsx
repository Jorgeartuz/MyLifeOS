import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

interface BalanceCardProps {
  totalBalance: number;
  accountsCount: number;
}

export const BalanceCard = ({ totalBalance, accountsCount }: BalanceCardProps) => {
  return (
    <div className="bg-primary p-8 rounded-card shadow-xl shadow-primary/20 text-white relative overflow-hidden group mb-8">
      {/* Círculo decorativo de fondo */}
      <div className="absolute right-[-5%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
        <Wallet size={160} />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Balance Total</p>
            <h2 className="text-4xl font-black mt-2 transition-all">
              ${totalBalance.toLocaleString()}
            </h2>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-tighter">
              {accountsCount} {accountsCount === 1 ? 'Cuenta' : 'Cuentas'}
            </p>
          </div>
        </div>
        
        {/* Estos valores se mantendrán en 0 hasta que implementemos las transacciones reales */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase mb-1">
              <TrendingUp size={14} /> Ingresos
            </div>
            <p className="font-bold text-lg">$0</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase mb-1">
              <TrendingDown size={14} /> Gastos
            </div>
            <p className="font-bold text-lg">$0</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase mb-1">
              <PiggyBank size={14} /> Ahorro
            </div>
            <p className="font-bold text-lg">$0</p>
          </div>
        </div>
      </div>
    </div>
  );
};