import { money } from '../../lib/life';

export const FinancialChart = ({ income, expenses }: { income: number; expenses: number }) => {
  const maximum = Math.max(income, expenses, 1);
  return <div className="bg-surface p-6 rounded-card border border-border shadow-sm h-full">
    <h3 className="font-bold text-text mb-6">Ingresos vs Gastos</h3>
    <p className="text-xs text-text-secondary mb-6">Totales del período seleccionado</p>
    <div className="space-y-6">
      {[{ label: 'Ingresos', value: income, color: 'bg-primary' }, { label: 'Gastos', value: expenses, color: 'bg-red-400' }].map(item => <div key={item.label}>
        <div className="flex flex-wrap justify-between gap-2 text-sm mb-2"><span>{item.label}</span><strong>{money(item.value)}</strong></div>
        <div className="h-5 bg-background rounded-full overflow-hidden" role="img" aria-label={`${item.label}: ${money(item.value)}`}><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value / maximum * 100}%` }} /></div>
      </div>)}
      {income === 0 && expenses === 0 && <p className="text-sm text-text-secondary">No hay movimientos en este período.</p>}
    </div>
  </div>;
};