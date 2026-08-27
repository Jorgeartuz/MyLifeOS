import { PlusCircle, MinusCircle, ArrowLeftRight } from 'lucide-react';

export const QuickTransactionActions = () => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <button className="flex flex-col items-center justify-center p-4 bg-surface border border-border rounded-card hover:border-primary/50 transition-all group">
        <PlusCircle className="text-green-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Ingreso</span>
      </button>
      <button className="flex flex-col items-center justify-center p-4 bg-surface border border-border rounded-card hover:border-primary/50 transition-all group">
        <MinusCircle className="text-red-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Gasto</span>
      </button>
      <button className="flex flex-col items-center justify-center p-4 bg-surface border border-border rounded-card hover:border-primary/50 transition-all group">
        <ArrowLeftRight className="text-primary mb-2 group-hover:scale-110 transition-transform" size={24} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Traspaso</span>
      </button>
    </div>
  );
};