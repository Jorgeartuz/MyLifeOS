import React, { useState } from 'react';
import { X, Loader2, Target } from 'lucide-react';
import { goalsService } from '../../services/goals.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GoalModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || Number(targetAmount) <= 0) return;

    setLoading(true);
    try {
      await goalsService.createGoal(name, Number(targetAmount), targetDate || null);
      onSuccess();
      onClose();
      setName('');
      setTargetAmount('');
      setTargetDate('');
    } catch (error) {
      console.error(error);
      alert("Error al crear la meta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/20 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-card shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="font-bold text-text flex items-center gap-2">
            <Target size={18} className="text-primary" /> Nueva Meta de Ahorro
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">¿Qué quieres lograr?</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              placeholder="Ej. Moto nueva, Fondo de emergencia..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Monto Objetivo ($)</label>
            <input 
              type="number" 
              required 
              value={targetAmount} 
              onChange={e => setTargetAmount(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-lg font-bold"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Fecha límite (Opcional)</label>
            <input 
              type="date" 
              value={targetDate} 
              onChange={e => setTargetDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Establecer Meta'}
          </button>
        </form>
      </div>
    </div>
  );
};