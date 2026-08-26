import { Info } from 'lucide-react';

export const MyLifeInsight = ({ insight }: { insight: string }) => {
  return (
    <div className="bg-primary/5 border border-primary/20 p-6 rounded-card">
      <div className="flex items-center gap-2 mb-3 text-primary">
        <span className="p-1 bg-primary/10 rounded">
          <Info size={16} />
        </span>
        <h3 className="font-bold text-xs uppercase tracking-widest">MyLife Insight</h3>
      </div>
      <p className="text-sm text-text leading-relaxed font-medium italic">
        "{insight}"
      </p>
    </div>
  );
};