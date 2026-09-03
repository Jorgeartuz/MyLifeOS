import React, { useState } from 'react';
import { X, Loader2, Package, Check } from 'lucide-react';
import { workService } from '../../services/work.service';
import type { Account } from '../../types/finance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

const PACKAGE_OPTIONS = [
  { size: 10, price: 8000, label: 'Paquete Básico' },
  { size: 25, price: 19000, label: 'Paquete Pro' },
  { size: 50, price: 36000, label: 'Paquete Premium' },
];

export const BuyPackageModal = ({ isOpen, onClose, accounts, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(1); // 25 por defecto
  const [accountId, setAccountId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      alert("Selecciona la cuenta con la que pagaste");
      return;
    }

    setLoading(true);
    try {
      const pkg = PACKAGE_OPTIONS[selectedIdx];
      await workService.buyPackage(pkg.size, pkg.price, accountId);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al comprar paquete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-[24px] shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="font-bold text-text">Comprar Paquete</h3>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            {PACKAGE_OPTIONS.map((pkg, i) => (
              <button
                key={pkg.size}
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedIdx === i ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedIdx === i ? 'bg-primary text-white' : 'bg-background text-text-secondary'}`}>
                    <Package size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-text">{pkg.label} ({pkg.size} domis)</p>
                    <p className="text-xs text-text-secondary">${pkg.price.toLocaleString()} pesos</p>
                  </div>
                </div>
                {selectedIdx === i && <Check size={20} className="text-primary" />}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">¿Cómo lo pagaste?</label>
            <select 
              required 
              value={accountId} 
              onChange={e => setAccountId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20"
            >
              <option value="">Selecciona cuenta...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : `Pagar $${PACKAGE_OPTIONS[selectedIdx].price.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};