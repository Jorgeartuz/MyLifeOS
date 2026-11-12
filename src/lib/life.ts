import type { Debt, Motorcycle } from '../types/life';

export const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const money = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
export const dateLabel = (date: string) => new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('es-CO');
export const errorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'code' in error && ['42P01', 'PGRST205', 'PGRST202'].includes(String(error.code))) return 'Falta actualizar la base de datos. Aplica la migración de MyLifeOs en Supabase y vuelve a intentar.';
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'No se pudo completar la operación. Intenta nuevamente.';
};
export const debtRemaining = (debt: Debt) => Math.max(0, Number(debt.original_amount) - debt.debt_payments.reduce((sum, p) => sum + Number(p.amount), 0));

export function automaticEvents(debts: Debt[], moto: Motorcycle | null) {
  const debtsDue = debts.filter(d => d.due_date && debtRemaining(d) > 0).map(d => ({ id: `debt-${d.id}`, title: `Pagar: ${d.name}`, event_date: d.due_date!, href: '/deudas' }));
  const documents = moto ? [{ label: 'SOAT', date: moto.soat_date }, { label: 'Tecnomecánica', date: moto.inspection_date }].flatMap(({ label, date }) => date ? [{ id: `moto-${label}`, title: `Vence ${label}`, event_date: date, href: '/moto' }] : []) : [];
  return [...debtsDue, ...documents];
}
