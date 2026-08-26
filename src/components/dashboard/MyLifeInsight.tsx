import { Info } from 'lucide-react';

export const MyLifeInsight = ({ insight }: { insight: string }) => (
  <div className="bg-primary/5 border border-primary/20 p-6 rounded-card">
    <div className="flex items-center gap-2 mb-3 text-primary">
      <Info size={18} />
      <h3 className="font-bold text-xs uppercase tracking-widest">MyLife Insight</h3>
    </div>
    <p className="text-sm text-text leading-relaxed font-medium italic">"{insight}"</p>
  </div>
);