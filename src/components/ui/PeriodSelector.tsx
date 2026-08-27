import { type WorkPeriod } from '../../types/work';

interface PeriodSelectorProps {
  period: WorkPeriod;
  onChange: (period: WorkPeriod) => void;
}

export const PeriodSelector = ({ period, onChange }: PeriodSelectorProps) => {
  const options: { value: WorkPeriod; label: string }[] = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
  ];

  return (
    <div className="flex bg-surface p-1 rounded-xl border border-border w-fit h-fit self-start">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
            period === option.value ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};