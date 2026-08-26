import { type Transaction } from '../../types/dashboard';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Bike, 
  ShoppingBag, 
  BriefcaseBusiness, 
  GraduationCap,
  Plus
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

// Función auxiliar para asignar iconos según la categoría
const getCategoryIcon = (category: string, type: 'income' | 'expense') => {
  const cat = category.toLowerCase();
  if (cat.includes('trabajo') || cat.includes('domicilio')) return <BriefcaseBusiness size={18} />;
  if (cat.includes('moto') || cat.includes('gasolina')) return <Bike size={18} />;
  if (cat.includes('alimento') || cat.includes('comida')) return <ShoppingBag size={18} />;
  if (cat.includes('universidad') || cat.includes('estudio')) return <GraduationCap size={18} />;
  
  // Icono por defecto según si es ingreso o gasto
  return type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />;
};

export const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-text">Actividad reciente</h3>
        <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
          <Plus size={14} /> Ver historial
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between group cursor-default"
          >
            <div className="flex items-center gap-4">
              {/* Icono de Categoría */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                transaction.type === 'income' 
                  ? 'bg-green-50 text-green-600 group-hover:bg-green-100' 
                  : 'bg-background text-text-secondary group-hover:bg-border'
              }`}>
                {getCategoryIcon(transaction.category, transaction.type)}
              </div>

              {/* Información del movimiento */}
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    {transaction.category}
                  </span>
                  <span className="text-border text-[10px]">•</span>
                  <p className="text-[11px] text-text-secondary">
                    {transaction.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Monto */}
            <div className="text-right">
              <p className={`text-sm font-bold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-text'
              }`}>
                {transaction.type === 'income' ? '+' : ''}
                ${transaction.amount.toLocaleString('es-CO')}
              </p>
              <p className="text-[10px] text-text-secondary font-medium italic">
                Confirmado
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Botón de acción rápida inferior (Opcional, estilo SaaS) */}
      <div className="mt-6 pt-6 border-t border-border">
        <button className="w-full py-2.5 bg-background hover:bg-border text-text-secondary text-xs font-bold rounded-lg transition-all active:scale-[0.98]">
          Descargar reporte del mes
        </button>
      </div>
    </div>
  );
};