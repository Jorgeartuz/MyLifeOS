import { useState, useMemo } from 'react';
import { FinanceHeader } from '../components/finance/FinanceHeader';
import { PeriodSelector } from '../components/dashboard/PeriodSelector'; // Reutilizamos el selector
import { BalanceCard } from '../components/finance/BalanceCard';
import { FinancialMetricCard } from '../components/finance/FinancialMetricCard';
import { RecentTransactions } from '../components/finance/RecentTransactions';
import { QuickTransactionActions } from '../components/finance/QuickTransactionActions';
import { mockFinanceData } from '../components/finance/mockData';
import { TrendingUp, TrendingDown, PiggyBank, PieChart } from 'lucide-react';

const Finanzas = () => {
  const [period, setPeriod] = useState('hoy');
  const data = useMemo(() => mockFinanceData[period] || mockFinanceData.hoy, [period]);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <FinanceHeader />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA - Flujo de Dinero */}
        <div className="lg:col-span-8 space-y-8">
          <BalanceCard summary={data.summary} />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FinancialMetricCard title="Ingresos" value={data.summary.totalIncome} change={data.summary.incomeChange} icon={<TrendingUp size={18}/>} />
            <FinancialMetricCard title="Gastos" value={data.summary.totalExpenses} change={data.summary.expenseChange} icon={<TrendingDown size={18}/>} />
            <FinancialMetricCard title="Ahorro" value={data.summary.savings} change={2.5} icon={<PiggyBank size={18}/>} />
            <FinancialMetricCard title="Tasa Ahorro" value={data.summary.savingsRate} change={0} icon={<PieChart size={18}/>} isRate />
          </div>

          <RecentTransactions transactions={data.transactions} />
        </div>

        {/* COLUMNA DERECHA - Análisis y Acciones */}
        <div className="lg:col-span-4 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Acciones</h3>
            <QuickTransactionActions />
          </section>

          {/* Distribución de Gastos */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <h3 className="font-bold text-text mb-6 text-sm uppercase tracking-tight">Distribución de Gastos</h3>
            <div className="space-y-5">
              {data.expenseCategories.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-bold mb-2">
                    <span className="text-text uppercase tracking-tight">{item.label}</span>
                    <span className="text-text-secondary">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fuentes de Ingreso */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <h3 className="font-bold text-text mb-6 text-sm uppercase tracking-tight">Fuentes de Ingreso</h3>
            <div className="space-y-5">
              {data.incomeSources.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-bold mb-2">
                    <span className="text-text uppercase tracking-tight">{item.label}</span>
                    <span className="text-text-secondary">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finanzas;