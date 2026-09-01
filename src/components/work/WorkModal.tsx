import React, { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { type WorkSession } from '../../types/work';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: WorkSession | null;
  onSave: (updates: Partial<WorkSession>) => Promise<void>;
}

export const WorkModal = ({ isOpen, onClose, session, onSave }: Props) => {
  const [loading, setLoading] = useState(false);

  // SOLUCIÓN AL LINTER: 
  // Inicializamos el estado directamente con los valores de la sesión.
  // Ya no necesitamos el useEffect ni el resetForm.
  const [formData, setFormData] = useState({
    deliveries: session?.deliveries || 0,
    kilometers: Number(session?.kilometers) || 0,
    gross_income: Number(session?.gross_income) || 0,
    fuel_cost: Number(session?.fuel_cost) || 0,
    other_costs: Number(session?.other_costs) || 0,
    notes: session?.notes || ''
  });

  if (!isOpen || !session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch { 
      alert("Error al actualizar jornada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/20 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-card shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="font-bold text-text text-sm uppercase tracking-tight">Actualizar Actividad</h3>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Entregas</label>
              <input 
                type="number" 
                value={formData.deliveries} 
                onChange={e => setFormData({...formData, deliveries: parseInt(e.target.value) || 0})} 
                className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm focus:ring-2 ring-primary/20 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Kilómetros</label>
              <input 
                type="number" 
                step="0.1" 
                value={formData.kilometers} 
                onChange={e => setFormData({...formData, kilometers: parseFloat(e.target.value) || 0})} 
                className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm focus:ring-2 ring-primary/20 outline-none" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Ingresos Brutos ($)</label>
            <input 
              type="number" 
              value={formData.gross_income} 
              onChange={e => setFormData({...formData, gross_income: parseFloat(e.target.value) || 0})} 
              className="w-full bg-background border border-border rounded-xl py-3 px-4 text-xl font-black text-primary outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Gasolina ($)</label>
              <input 
                type="number" 
                value={formData.fuel_cost} 
                onChange={e => setFormData({...formData, fuel_cost: parseFloat(e.target.value) || 0})} 
                className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Otros Costos ($)</label>
              <input 
                type="number" 
                value={formData.other_costs} 
                onChange={e => setFormData({...formData, other_costs: parseFloat(e.target.value) || 0})} 
                className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm outline-none" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Guardar Jornada</>}
          </button>
        </form>
      </div>
    </div>
  );
};