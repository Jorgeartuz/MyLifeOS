export const DashboardHeader = () => {
  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text">Buenos días, Jorge</h1>
      <p className="text-text-secondary mt-1">Este es el resumen de tu vida.</p>
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-4">{date}</p>
    </div>
  );
};