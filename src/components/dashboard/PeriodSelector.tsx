interface PeriodSelectorProps {
  period: string;
  onChange: (period: string) => void;
}

export const PeriodSelector = ({ period, onChange }: PeriodSelectorProps) => {
  return (
    <div className="flex bg-surface p-1 rounded-xl border border-border w-fit h-fit self-start">
      {['hoy', 'semana', 'mes'].map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
            period === p ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};