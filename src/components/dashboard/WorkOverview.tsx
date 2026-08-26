import { type WorkData, type WorkStatProps } from '../../types/dashboard';
import { Clock, Navigation, Package, Banknote } from 'lucide-react';

export const WorkOverview = ({ data }: { data: WorkData }) => {
  const netIncome = data.income - data.fuelCost - data.otherCosts;
  const hours = data.hours || 1; // Evitar división por cero
  const kilometers = data.kilometers || 1;
  
  const incomePerHour = netIncome / hours;
  const incomePerKm = netIncome / kilometers;

  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-text">Trabajo</h3>
          <p className="text-sm text-text-secondary">Tu rendimiento</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Ganancia Real</p>
          <p className="text-xl font-bold text-primary">${netIncome.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        <WorkStat icon={<Package size={18}/>} label="Domicilios" value={data.deliveries} />
        <WorkStat icon={<Navigation size={18}/>} label="Kilómetros" value={`${data.kilometers} km`} />
        <WorkStat icon={<Clock size={18}/>} label="Horas" value={`${data.hours}h`} />
        <WorkStat icon={<Banknote size={18}/>} label="$/hora" value={`$${Math.round(incomePerHour).toLocaleString()}/h`} color="text-green-600" />
      </div>
      
      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm">
        <span className="text-text-secondary font-medium">Promedio por Km</span>
        <span className="font-bold text-text">${Math.round(incomePerKm).toLocaleString()}/km</span>
      </div>
    </div>
  );
};

// Eliminamos el ANY y usamos la interfaz WorkStatProps
const WorkStat = ({ icon, label, value, color = "text-text" }: WorkStatProps) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-text-secondary">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-base font-bold ${color}`}>{value}</p>
  </div>
);