export const WorkChart = () => (
  <div className="bg-surface p-6 rounded-card border border-border shadow-sm flex flex-col h-full">
    <h3 className="font-bold text-text mb-6">Ganancia por día</h3>
    <div className="flex-1 flex items-end gap-2 min-h-[160px]">
      {[60, 45, 90, 65, 80, 100, 70].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div 
            className="w-full bg-primary/20 group-hover:bg-primary transition-all rounded-t-sm" 
            style={{ height: `${h}%` }}
          />
          <span className="text-[10px] font-bold text-text-secondary uppercase">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
          </span>
        </div>
      ))}
    </div>
  </div>
);