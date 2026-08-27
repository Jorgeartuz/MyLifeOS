import { type Transaction } from '../../types/finance';
import { 
  Bike, 
  ShoppingBag, 
  BriefcaseBusiness, 
  GraduationCap, 
  Laptop, 
  Home, 
  Heart, 
  Wallet 
} from 'lucide-react';

const getIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('domicilio') || c.includes('trabajo')) return <BriefcaseBusiness size={18} />;
  if (c.includes('gasolina') || c.includes('moto')) return <Bike size={18} />;
  if (c.includes('alimentación')) return <ShoppingBag size={18} />;
  if (c.includes('universidad')) return <GraduationCap size={18} />;
  if (c.includes('hogar')) return <Home size={18} />;
  if (c.includes('tecnología')) return <Laptop size={18} />;
  if (c.includes('ocio')) return <Heart size={18} />;
  return <Wallet size={18} />;
};

const getMethodIcon = (method: string) => {
  if (method === 'cash') return 'Efectivo';
  if (method === 'nequi') return 'Nequi';
  return 'Banco';
};

export const RecentTransactions = ({ transactions }: { transactions: Transaction[] }) => {
  if (transactions.length === 0) return (
    <div className="bg-surface p-8 rounded-card border border-border text-center">
      <p className="text-text-secondary text-sm italic">No hay movimientos registrados en este período.</p>
    </div>
  );

  return (
    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-text">Movimientos recientes</h3>
        <button className="text-primary text-xs font-bold hover:underline">Ver todo</button>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((t) => (
          <div key={t.id} className="p-4 flex items-center justify-between hover:bg-background transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-text-secondary'}`}>
                {getIcon(t.category)}
              </div>
              <div>
                <p className="text-sm font-bold text-text">{t.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                  <span>{t.category}</span>
                  <span>•</span>
                  <span>{getMethodIcon(t.paymentMethod)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-text'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
              </p>
              <p className="text-[10px] text-text-secondary">{t.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};