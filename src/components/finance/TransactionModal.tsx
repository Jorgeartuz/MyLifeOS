import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Account, Category, TransactionType } from '../../types/finance';

// Definimos la interfaz para los datos que se envían
interface TransactionPayload {
  account_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  transaction_date: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
  onSubmit: (data: TransactionPayload) => Promise<void>; // TIPADO AQUÍ
}

export const TransactionModal = ({ isOpen, onClose, accounts, categories, onSubmit, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !categoryId || Number(amount) <= 0) {
      alert("Por favor completa todos los campos correctamente");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        account_id: accountId,
        category_id: categoryId,
        amount: Number(amount),
        type,
        description,
        transaction_date: new Date(date).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (error: unknown) { // CAMBIADO A UNKNOWN
      const message = error instanceof Error ? error.message : "Error al registrar la transacción";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/20 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-card shadow-2xl border border-border animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="font-bold text-text">Registrar Movimiento</h3>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-background p-1 rounded-xl border border-border">
            <button 
              type="button" 
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-text-secondary'}`}
            >Gasto</button>
            <button 
              type="button" 
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-text-secondary'}`}
            >Ingreso</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Monto</label>
              <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-lg font-bold" placeholder="0.00" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Cuenta</label>
              <select required value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm outline-none">
                <option value="">Seleccionar...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (${a.balance.toLocaleString()})</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Categoría</label>
              <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm outline-none">
                <option value="">Seleccionar...</option>
                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Descripción</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm outline-none" placeholder="Ej. Almuerzo, Pago de turno..." />
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-dark'}`}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};