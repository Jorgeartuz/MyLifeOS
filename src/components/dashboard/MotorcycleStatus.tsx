import { Bike } from 'lucide-react';
import { type DashboardData } from '../../types/dashboard';

export const MotorcycleStatus = ({ moto }: { moto: DashboardData['moto'] }) => (
  <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Bike size={20}/></div>
      <h3 className="font-bold text-text text-sm uppercase tracking-tight">Estado de Moto</h3>
    </div>
    <p className="text-sm font-bold text-text uppercase tracking-tight">{moto.model}</p>
    <div className="mt-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary font-medium">Kilometraje</span>
        <span className="font-bold">{moto.kilometers.toLocaleString()} km</span>
      </div>
      <div className="p-3 bg-background rounded-lg border border-border">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Próximo: {moto.nextMaintenance}</p>
        <p className="text-sm font-bold text-primary mt-1">Faltan {(moto.nextMaintenanceKm - moto.kilometers).toLocaleString()} km</p>
      </div>
    </div>
  </div>
);