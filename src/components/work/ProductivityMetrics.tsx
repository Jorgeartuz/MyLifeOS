import { type ReactNode } from 'react';
import { type WorkSummaryData } from '../../types/work';
import { Clock, Navigation, Target, Zap } from 'lucide-react';

interface MetricItemProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export const ProductivityMetrics = ({ data }: { data: WorkSummaryData }) => {
  const netProfit = data.grossIncome - (data.fuelCost + data.otherCosts);
  
  // Evitar división por cero
  const hours = data.workedHours || 1;
  const kilometers = data.kilometers || 1;
  const deliveries = data.deliveries || 1;

  const perHour = Math.round(netProfit / hours);
  const perKm = Math.round(netProfit / kilometers);
  const perDelivery = Math.round(netProfit / deliveries);

  return (
    <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
      <h3 className="font-bold text-text mb-6 flex items-center gap-2">
        <Zap size={18} className="text-primary" /> Rendimiento
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <MetricItem icon={<Clock size={16}/>} label="Ganancia/Hora" value={`$${perHour.toLocaleString()}`} />
        <MetricItem icon={<Navigation size={16}/>} label="Ganancia/Km" value={`$${perKm.toLocaleString()}`} />
        <MetricItem icon={<Target size={16}/>} label="Ganancia/Dom" value={`$${perDelivery.toLocaleString()}`} />
        <MetricItem icon={<Zap size={16}/>} label="Eficiencia" value="84%" />
      </div>
    </div>
  );
};

const MetricItem = ({ icon, label, value }: MetricItemProps) => (
  <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-tight">{label}</p>
      <p className="text-sm font-bold text-text">{value}</p>
    </div>
  </div>
);