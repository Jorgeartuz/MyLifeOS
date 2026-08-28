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

// Función para obtener el icono basado en el nombre de la categoría que viene de la DB
const getIcon = (categoryName?: string) => {
  if (!categoryName) return <Wallet size={18} />;
  
  const name = categoryName.toLowerCase();
  if (name.includes('domicilio') || name.includes('trabajo')) return <BriefcaseBusiness size={18} />;
  if (name.includes('gasolina') || name.includes('moto')) return <Bike size={18} />;
  if (name.includes('alimentación') || name.includes('comida')) return <ShoppingBag size={18} />;
  if (name.includes('universidad') || name.includes('estudio')) return <GraduationCap size={18} />;
  if (name.includes('hogar')) return <Home size={18} />;
  if (name.includes('tecnología')) return <Laptop size={18} />;
  if (name.includes('ocio')) return <Heart size={18} />;
  
  return <Wallet size={18} />;
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
              {/* Le pasamos el nombre de la categoría que viene del JOIN */}
              <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-text-secondary'}`}>
                {getIcon(t.categories?.name)}
              </div>
              
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors tracking-tight">
                  {t.description || t.categories?.name || 'Sin descripción'}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  {/* Accedemos a la relación categories y accounts */}
                  <span>{t.categories?.name || 'General'}</span>
                  <span className="opacity-30">•</span>
                  <span>{t.accounts?.name || 'Cuenta'}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-sm font-black ${t.type === 'income' ? 'text-green-600' : 'text-text'}`}>
                {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
              </p>
              <p className="text-[10px] text-text-secondary font-medium italic">
                {/* Formateamos la fecha transaction_date */}
                {new Date(t.transaction_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};