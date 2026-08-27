export const FinanceHeader = () => {
  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text">Finanzas</h1>
      <p className="text-text-secondary mt-1">Controla tu dinero y toma mejores decisiones.</p>
      <p className="text-xs font-bold text-primary uppercase tracking-widest mt-4 opacity-80">{date}</p>
    </div>
  );
};