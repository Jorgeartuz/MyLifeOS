export const WorkHeader = () => {
  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="mb-8">
      {/* Eliminada la clase text-text duplicada */}
      <h1 className="text-2xl md:text-3xl font-bold text-text tracking-tight">Trabajo</h1>
      <p className="text-text-secondary mt-1">Analiza tu rendimiento y el valor real de tu tiempo.</p>
      <p className="text-xs font-bold text-primary uppercase tracking-widest mt-4 opacity-80">{date}</p>
    </div>
  );
};