import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  isRate?: boolean;
}

export const FinancialMetricCard = ({ title, value, change, icon, isRate }: Props) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-surface p-5 rounded-card border border-border shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-background rounded-lg text-primary">{icon}</div>
        {!isRate && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-xl font-bold text-text mt-1">
        {isRate ? `${value}%` : `$${value.toLocaleString()}`}
      </h3>
    </div>
  );
};