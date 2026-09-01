import { type Transaction } from '../../types/finance';
import { Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentTransactions = ({ transactions }: { transactions: Transaction[] }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-surface p-8 rounded-card border border-border text-center shadow-sm">
        <p className="text-text-secondary text-sm italic">No tienes movimientos todavía.</p>
        <Link to="/finanzas" className="text-primary text-xs font-bold mt-2 inline-block hover:underline">
          Registrar mi primer movimiento
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-text">Últimos movimientos</h3>
        <Link to="/finanzas" className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((t) => (
          <div key={t.id} className="p-4 flex items-center justify-between hover:bg-background transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-text-secondary'}`}>
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text leading-tight">{t.description || t.categories?.name}</p>
                <p className="text-[10px] text-text-secondary font-bold uppercase mt-0.5">{t.categories?.name || 'General'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${t.type === 'income' ? 'text-green-600' : 'text-text'}`}>
                {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
              </p>
              <p className="text-[10px] text-text-secondary font-medium italic">
                {new Date(t.transaction_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};