import { useState } from 'react';
import { FinanceHeader } from '../components/finance/FinanceHeader';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import { BalanceCard } from '../components/finance/BalanceCard';
import { FinancialMetricCard } from '../components/finance/FinancialMetricCard';
import { RecentTransactions } from '../components/finance/RecentTransactions';
import { QuickTransactionActions } from '../components/finance/QuickTransactionActions';
import { CategoryBreakdown } from '../components/finance/CategoryBreakdown';
import { mockFinanceData } from '../components/finance/mockData';
import { TrendingUp, TrendingDown, PiggyBank, PieChart } from 'lucide-react';
import { type WorkPeriod } from '../types/work';

const Finanzas = () => {
  const [period, setPeriod] = useState<WorkPeriod>('hoy');
  const data = mockFinanceData[period];

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <FinanceHeader />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA */}
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

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-4 space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Acciones</h3>
            <QuickTransactionActions />
          </section>

          <CategoryBreakdown title="Distribución de Gastos" items={data.expenseCategories} />
          <CategoryBreakdown title="Fuentes de Ingreso" items={data.incomeSources} />
        </div>
      </div>
    </div>
  );
};

export default Finanzas;