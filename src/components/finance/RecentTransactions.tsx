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

// Función auxiliar para obtener el icono según la categoría
const getIcon = (category?: string) => {
  if (!category) return <Wallet size={18} />;
  
  const c = category.toLowerCase();
  if (c.includes('domicilio') || c.includes('trabajo')) return <BriefcaseBusiness size={18} />;
  if (c.includes('gasolina') || c.includes('moto')) return <Bike size={18} />;
  if (c.includes('alimentación') || c.includes('comida')) return <ShoppingBag size={18} />;
  if (c.includes('universidad') || c.includes('estudio')) return <GraduationCap size={18} />;
  if (c.includes('hogar') || c.includes('vivienda')) return <Home size={18} />;
  if (c.includes('tecnología')) return <Laptop size={18} />;
  if (c.includes('ocio') || c.includes('entretenimiento')) return <Heart size={18} />;
  
  return <Wallet size={18} />;
};

// Función auxiliar para el texto del método de pago
const getMethodText = (method?: string) => {
  if (!method) return 'Efectivo';
  
  const m = method.toLowerCase();
  if (m === 'cash') return 'Efectivo';
  if (m === 'nequi') return 'Nequi';
  if (m === 'bank' || m === 'transferencia') return 'Transferencia';
  if (m === 'credit_card') return 'T. Crédito';
  if (m === 'debit_card') return 'T. Débito';
  
  return method;
};

export const RecentTransactions = ({ transactions }: { transactions: Transaction[] }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-surface p-8 rounded-card border border-border text-center shadow-sm">
        <p className="text-text-secondary text-sm italic">No hay movimientos registrados.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-text">Movimientos recientes</h3>
        <button className="text-primary text-xs font-bold hover:underline">Ver todo</button>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((t) => (
          <div key={t.id} className="p-4 flex items-center justify-between hover:bg-background transition-colors group">
            <div className="flex items-center gap-4">
              {/* Icono dinámico según categoría */}
              <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-text-secondary'}`}>
                {getIcon(t.category)}
              </div>
              
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors tracking-tight">
                  {t.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  <span>{t.category || 'General'}</span>
                  <span className="opacity-30">•</span>
                  <span>{getMethodText(t.paymentMethod)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-sm font-black ${t.type === 'income' ? 'text-green-600' : 'text-text'}`}>
                {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString()}
              </p>
              <p className="text-[10px] text-text-secondary font-medium italic">
                {t.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};