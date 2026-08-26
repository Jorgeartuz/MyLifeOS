export const FinancialChart = () => {
  // Gráfica mock manual usando SVG
  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm h-full">
      <h3 className="font-bold text-text mb-6">Ingresos vs Gastos</h3>
      <div className="relative h-48 w-full flex items-end gap-2">
        {/* Esto es una representación visual simple de barras para no depender de librerías en esta fase */}
        {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
             <div className="w-full flex gap-1 items-end h-32">
                <div className="flex-1 bg-primary/20 group-hover:bg-primary/40 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                <div className="flex-1 bg-red-400/20 group-hover:bg-red-400/40 transition-colors rounded-t-sm" style={{ height: `${h * 0.4}%` }}></div>
             </div>
             <span className="text-[10px] font-bold text-text-secondary mt-2">D{i+1}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-4 text-xs font-bold">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full"></div> Ingresos</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-full"></div> Gastos</div>
      </div>
    </div>
  );
};