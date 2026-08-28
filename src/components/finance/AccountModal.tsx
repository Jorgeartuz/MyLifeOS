import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { AccountType } from '../../types/finance'; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (name: string, type: AccountType, balance: number) => Promise<void>;
}

export const AccountModal = ({ isOpen, onClose, onSubmit, onSuccess }: Props) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(name, type, balance);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/20 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-card shadow-2xl border border-border animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="font-bold text-text">Agregar nueva cuenta</h3>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Nombre de la cuenta</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Ej. Nequi, Efectivo, Banco"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Tipo de cuenta</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full bg-background border border-border rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="cash">Efectivo</option>
              <option value="digital_wallet">Billetera Digital (Nequi/Daviplata)</option>
              <option value="bank">Cuenta de Ahorros</option>
              <option value="credit_card">Tarjeta de Crédito</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Saldo inicial</label>
            <input
              type="number"
              required
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Guardar Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};