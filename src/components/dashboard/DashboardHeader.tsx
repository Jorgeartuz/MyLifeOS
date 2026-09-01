interface DashboardHeaderProps {
  name?: string;
}

export const DashboardHeader = ({ name = 'Jorge' }: DashboardHeaderProps) => {
  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text tracking-tight">
        Buenos días, <span className="text-primary">{name}</span>
      </h1>
      <p className="text-text-secondary mt-1 text-sm md:text-base font-medium">
        Este es el resumen de tu vida.
      </p>
      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-4 opacity-80">
        {date}
      </p>
    </div>
  );
};