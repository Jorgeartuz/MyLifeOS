import { useState, useEffect, useCallback } from 'react';
import { FinanceHeader } from '../components/finance/FinanceHeader';
import { BalanceCard } from '../components/finance/BalanceCard';
import { RecentTransactions } from '../components/finance/RecentTransactions';
import { TransactionModal } from '../components/finance/TransactionModal';
import { AccountModal } from '../components/finance/AccountModal';
import { financeService } from '../services/finance.service';
import type { Account, Category, Transaction } from '../types/finance';
import { Plus, Loader2, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Finanzas = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [accs, cats, txs] = await Promise.all([
        financeService.getAccounts(),
        financeService.getCategories(),
        financeService.getTransactions()
      ]);
      setAccounts(accs);
      setCategories(cats);
      setTransactions(txs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Cálculos reales basados en transacciones
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <FinanceHeader />
        <div className="flex gap-2">
          <button onClick={() => setIsAccModalOpen(true)} className="flex items-center gap-2 bg-white border border-border text-text px-4 py-2 rounded-xl font-bold text-sm hover:bg-background transition-all"><Wallet size={18} /> Cuentas</button>
          <button onClick={() => setIsTxModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"><Plus size={18} /> Nuevo Movimiento</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <BalanceCard totalBalance={totalBalance} accountsCount={accounts.length} />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
                <div className="flex items-center gap-2 text-green-600 mb-2"><ArrowUpCircle size={20} /><span className="text-[10px] font-bold uppercase tracking-widest">Ingresos Totales</span></div>
                <p className="text-2xl font-black">${totalIncome.toLocaleString()}</p>
             </div>
             <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
                <div className="flex items-center gap-2 text-red-600 mb-2"><ArrowDownCircle size={20} /><span className="text-[10px] font-bold uppercase tracking-widest">Gastos Totales</span></div>
                <p className="text-2xl font-black">${totalExpenses.toLocaleString()}</p>
             </div>
          </div>

          <RecentTransactions transactions={transactions} />
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <h3 className="font-bold text-text mb-4">Tus Cuentas</h3>
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="p-3 bg-background rounded-xl border border-border flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-text">{acc.name}</p>
                    <p className="text-[10px] text-text-secondary uppercase">{acc.type}</p>
                  </div>
                  <p className="font-bold text-sm text-primary">${acc.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AccountModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} onSuccess={loadData} onSubmit={async (n, t, b) => { await financeService.createAccount(n, t, b); }} />
      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} accounts={accounts} categories={categories} onSuccess={loadData} onSubmit={async (data) => { await financeService.createTransaction(data); }} />
    </div>
  );
};

export default Finanzas;