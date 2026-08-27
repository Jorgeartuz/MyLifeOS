import { type WorkSummaryData } from '../../types/work';
import { Banknote, Fuel, Wallet, Package } from 'lucide-react';

export const WorkSummary = ({ data }: { data: WorkSummaryData }) => {
  const totalCosts = data.fuelCost + data.otherCosts;
  const netProfit = data.grossIncome - totalCosts;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-primary p-6 rounded-card text-white shadow-lg shadow-primary/20">
        <div className="flex items-center gap-2 opacity-80 mb-2">
          <Wallet size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ganancia Real</span>
        </div>
        <h3 className="text-3xl font-black">${netProfit.toLocaleString()}</h3>
        <p className="text-[10px] mt-2 font-medium opacity-70">Libre de gastos operativos</p>
      </div>

      <SummaryCard title="Ingresos Brutos" value={data.grossIncome} icon={<Banknote size={20}/>} color="text-text" />
      <SummaryCard title="Costos Totales" value={totalCosts} icon={<Fuel size={20}/>} color="text-red-600" />
      <SummaryCard title="Domicilios" value={data.deliveries} icon={<Package size={20}/>} color="text-text" isNumeric />
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color, isNumeric }: any) => (
  <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
    <div className="p-2 bg-background w-fit rounded-lg text-text-secondary mb-4">{icon}</div>
    <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">{title}</p>
    <h3 className={`text-xl font-bold mt-1 ${color}`}>
      {isNumeric ? value : `$${value.toLocaleString()}`}
    </h3>
  </div>
);