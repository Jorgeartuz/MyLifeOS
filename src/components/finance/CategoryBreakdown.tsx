import { type CategoryBreakdown as CategoryType } from '../../types/finance';

interface Props {
  title: string;
  items: CategoryType[];
}

export const CategoryBreakdown = ({ title, items }: Props) => (
  <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
    <h3 className="font-bold text-text mb-6 text-sm uppercase tracking-tight">{title}</h3>
    <div className="space-y-5">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] font-bold mb-2">
            <span className="text-text uppercase tracking-tight">{item.label}</span>
            <span className="text-text-secondary">${item.amount.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
            <div 
              className={`h-full ${item.color} rounded-full transition-all duration-500`} 
              style={{ width: `${item.percentage}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);