import React, { useState } from 'react';
import { X, Loader2, PiggyBank } from 'lucide-react';
import { goalsService } from '../../services/goals.service';
import { type SavingsGoal } from '../../types/goals';
import { type Account } from '../../types/finance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  accounts: Account[];
  onSuccess: () => void;
}

export const ContributionModal = ({ isOpen, onClose, goal, accounts, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await goalsService.addContribution({
        goal_id: goal.id,
        account_id: accountId,
        amount: Number(amount),
        notes: notes || null
      });
      onSuccess();
      onClose();
      setAmount('');
      setAccountId('');
      setNotes('');
    } catch (err: unknown) { // CAMBIADO DE any A unknown
      const message = err instanceof Error ? err.message : "Error al realizar el ahorro";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/20 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-card shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h3 className="font-bold text-text flex items-center gap-2">
              <PiggyBank size={18} className="text-primary" /> Ahorrar para meta
            </h3>
            <p className="text-[10px] text-text-secondary font-bold uppercase mt-1">{goal.name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">¿Cuánto vas a ahorrar?</label>
            <input 
              type="number" 
              required 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-xl font-black text-primary"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">¿De qué cuenta sale el dinero?</label>
            <select 
              required 
              value={accountId} 
              onChange={e => setAccountId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecciona una cuenta...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Notas (Opcional)</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 outline-none text-sm"
              placeholder="Ej. Ahorro de la semana..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Ahorro'}
          </button>
        </form>
      </div>
    </div>
  );
};