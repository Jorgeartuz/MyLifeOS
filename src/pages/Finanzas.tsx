import { useState, useEffect } from 'react';
import { FinanceHeader } from '../components/finance/FinanceHeader';
import { BalanceCard } from '../components/finance/BalanceCard';
import { AccountModal } from '../components/finance/AccountModal';
import { financeService } from '../services/finance.service';
import type { Account, AccountType } from '../types/finance';
import { Plus, Loader2, Wallet } from 'lucide-react';

const Finanzas = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Definimos la función de carga
  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const accountsData = await financeService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Corrección de Linter: Carga de datos asíncrona segura
  useEffect(() => {
    loadFinanceData();
  }, []); 

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const handleCreateAccount = async (name: string, type: AccountType, balance: number) => {
    await financeService.createAccount(name, type, balance);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Cargando tus finanzas...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <FinanceHeader />
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Nueva Cuenta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <BalanceCard totalBalance={totalBalance} accountsCount={accounts.length} />

          {accounts.length === 0 ? (
            <div className="bg-surface border-2 border-dashed border-border rounded-card p-12 text-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
                <Wallet size={32} />
              </div>
              <h3 className="font-bold text-text">No tienes cuentas</h3>
              <p className="text-text-secondary text-sm mt-1 mb-6">Agrega tu primera cuenta para comenzar.</p>
              <button onClick={() => setIsModalOpen(true)} className="bg-primary/10 text-primary px-6 py-2 rounded-xl font-bold text-sm hover:bg-primary/20 transition-all">
                Crear cuenta ahora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(account => (
                <div key={account.id} className="bg-surface p-6 rounded-card border border-border shadow-sm group hover:border-primary/30 transition-all">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{account.type.replace('_', ' ')}</p>
                  <h4 className="font-bold text-text text-lg">{account.name}</h4>
                  <p className="text-2xl font-black text-primary mt-2">${account.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadFinanceData}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
};

export default Finanzas;