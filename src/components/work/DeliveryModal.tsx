import React, { useState } from 'react';
import { X, Loader2, Banknote, CreditCard, Save } from 'lucide-react';
import { workService } from '../../services/work.service';
import type { Account } from '../../types/finance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

export const DeliveryModal = ({ isOpen, onClose, accounts, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const [accountId, setAccountId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    
    // Validaciones básicas
    if (val <= 0) return;
    if (method === 'transfer' && !accountId) {
      alert("Selecciona la cuenta donde recibiste la transferencia");
      return;
    }

    setLoading(true);
    try {
      // Llamada al servicio que ahora gestiona la lógica financiera de ambos métodos
      await workService.registerDelivery(val, method, accountId || undefined);
      
      // Limpieza de estado
      setAmount('');
      setAccountId('');
      setMethod('cash');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al registrar el domicilio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-[24px] shadow-2xl animate-in zoom-in duration-200">
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="font-bold text-text">Registrar Domicilio</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-background rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Input de Valor (Optimizado para móvil) */}
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Valor del Domicilio</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
              <input 
                type="number" 
                inputMode="numeric"
                required 
                autoFocus
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-background border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-10 pr-4 outline-none text-3xl font-black text-text transition-all"
                placeholder="0"
              />
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setMethod('cash')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                method === 'cash' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border text-text-secondary hover:bg-background'
              }`}
            >
              <Banknote size={24} />
              <span className="text-xs font-bold uppercase tracking-tight">Efectivo</span>
            </button>
            <button 
              type="button"
              onClick={() => setMethod('transfer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                method === 'transfer' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border text-text-secondary hover:bg-background'
              }`}
            >
              <CreditCard size={24} />
              <span className="text-xs font-bold uppercase tracking-tight">Transferencia</span>
            </button>
          </div>

          {/* Selector de Cuenta Financiera (Solo para Transferencia) */}
          {method === 'transfer' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">¿A qué cuenta llegó el dinero?</label>
              <select 
                required 
                value={accountId} 
                onChange={e => setAccountId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20 appearance-none"
              >
                <option value="">Selecciona cuenta...</option>
                {accounts
                  /* FILTRO CRÍTICO: No mostramos cuentas de tipo 'cash' en el flujo de transferencia */
                  .filter(acc => acc.type !== 'cash') 
                  .map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))
                }
              </select>
              <p className="text-[10px] text-text-secondary italic px-1">
                Solo se muestran cuentas bancarias y billeteras digitales.
              </p>
            </div>
          )}

          {/* Botón de Acción */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={20} /> 
                <span className="uppercase tracking-widest">Guardar Registro</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};