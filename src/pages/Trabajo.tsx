import { useState, useEffect, useCallback } from 'react';
import { PeriodSelector } from '../components/ui/PeriodSelector';
import { workService } from '../services/work.service';
import { financeService } from '../services/finance.service';
import type { WorkDelivery, WorkPackage, WorkPeriod } from '../types/work';
import type { Account } from '../types/finance';
import { Plus, Package, Wallet, ArrowRight, Loader2, History } from 'lucide-react';
import { DeliveryModal } from '../components/work/DeliveryModal';
import { BuyPackageModal } from '../components/work/BuyPackageModal';

const Trabajo = () => {
  const [period, setPeriod] = useState<WorkPeriod>('hoy');
  const [loading, setLoading] = useState(true);
  const [activePackage, setActivePackage] = useState<WorkPackage | null>(null);
  const [deliveries, setDeliveries] = useState<WorkDelivery[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  // Función de carga estable
  const loadData = useCallback(async () => {
    try {
      const [pkg, delivs, accs] = await Promise.all([
        workService.getActivePackage(),
        workService.getDeliveries(period),
        financeService.getAccounts()
      ]);
      setActivePackage(pkg);
      setDeliveries(delivs);
      setAccounts(accs);
    } catch (error) {
      console.error('Error al cargar datos de trabajo:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  // SOLUCIÓN AL LINTER: Ejecución segura del efecto
  useEffect(() => {
    let isMounted = true;

    const executeLoad = async () => {
      if (isMounted) {
        // Solo activamos loading si no es la primera carga para evitar parpadeos
        if (deliveries.length > 0) setLoading(true);
        await loadData();
      }
    };

    executeLoad();

    return () => {
      isMounted = false;
    };
  }, [loadData, deliveries.length]);

  // Cálculos de Resumen
  const summary = deliveries.reduce((acc, d) => ({
    count: acc.count + 1,
    gross: acc.gross + Number(d.amount),
    cash: acc.cash + (d.payment_method === 'cash' ? Number(d.amount) : 0),
    transfer: acc.transfer + (d.payment_method === 'transfer' ? Number(d.amount) : 0),
    commission: acc.commission + Number(d.commission_amount),
    net: acc.net + Number(d.net_amount)
  }), { count: 0, gross: 0, cash: 0, transfer: 0, commission: 0, net: 0 });

  if (loading && deliveries.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-text-secondary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Actualizando registros...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Botón Flotante para Móvil */}
      <button 
        onClick={() => setIsDeliveryModalOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-2xl active:scale-95 md:hidden"
        aria-label="Registrar domicilio"
      >
        <Plus size={28} />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-text tracking-tight">Mi Trabajo</h1>
        <div className="flex gap-2 items-center">
          <PeriodSelector period={period} onChange={setPeriod} />
          <button 
            onClick={() => setIsDeliveryModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all"
          >
            <Plus size={18} /> Registrar Domicilio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tarjeta de Paquete */}
          <div className="bg-surface p-6 rounded-card border border-border shadow-sm overflow-hidden relative">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">Paquete Actual</h3>
                {activePackage ? (
                  <>
                    <p className="text-3xl font-black text-primary">{activePackage.remaining_deliveries} / {activePackage.package_size}</p>
                    <p className="text-xs text-text-secondary mt-1 font-medium italic">Paquete Pro en uso</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-bold text-orange-600 italic">Sin paquete activo</p>
                    <p className="text-xs text-text-secondary mt-1 font-medium">Comisión del 20% aplicada por domicilio</p>
                  </>
                )}
              </div>
              <button 
                disabled={!!activePackage}
                onClick={() => setIsPackageModalOpen(true)}
                className="bg-background border border-border p-3 rounded-2xl hover:border-primary/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                title={activePackage ? "Ya tienes un paquete activo" : "Comprar nuevo paquete"}
              >
                <Package className="text-primary group-hover:scale-110 transition-transform" size={24} />
              </button>
            </div>
            {activePackage && (
              <div className="mt-5 w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${(activePackage.remaining_deliveries / activePackage.package_size) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Resumen Financiero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Ganancia Neta" value={summary.net} color="text-green-600" />
            <StatCard label="Total Bruto" value={summary.gross} color="text-text" />
            <StatCard label="En Efectivo" value={summary.cash} color="text-text-secondary" />
            <StatCard label="Transferencias" value={summary.transfer} color="text-primary" />
          </div>

          {/* Historial */}
          <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <History size={18} className="text-text-secondary" />
              <h3 className="font-bold text-text text-sm uppercase tracking-wider">Historial ({period})</h3>
            </div>
            <div className="divide-y divide-border">
              {deliveries.map((d) => (
                <div key={d.id} className="p-4 flex justify-between items-center hover:bg-background transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className={`p-2.5 rounded-xl ${d.payment_method === 'cash' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-primary'}`}>
                      {d.payment_method === 'cash' ? <Wallet size={18} /> : <ArrowRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">${Number(d.amount).toLocaleString('es-CO')}</p>
                      <p className="text-[10px] text-text-secondary font-bold uppercase mt-0.5">
                        {d.payment_method} {d.accounts?.name && `• ${d.accounts.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-green-600">+${Number(d.net_amount).toLocaleString('es-CO')}</p>
                    <p className="text-[9px] text-text-secondary font-bold uppercase tracking-tighter">
                      {d.package_id ? 'PAQUETE ACTIVO' : `COMISIÓN -$${Number(d.commission_amount).toLocaleString('es-CO')}`}
                    </p>
                  </div>
                </div>
              ))}
              {deliveries.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-sm text-text-secondary italic">No has registrado domicilios en este período.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-primary/5 border border-primary/10 p-6 rounded-card">
              <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-2">Tip de trabajo</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Recuerda que trabajar con paquete te ahorra un 20% en cada domicilio. Actualmente tu ganancia neta es el reflejo real de lo que tienes en el bolsillo.
              </p>
           </div>
        </div>
      </div>

      <DeliveryModal 
        isOpen={isDeliveryModalOpen} 
        onClose={() => setIsDeliveryModalOpen(false)} 
        accounts={accounts} 
        onSuccess={loadData} 
      />

      <BuyPackageModal 
        isOpen={isPackageModalOpen} 
        onClose={() => setIsPackageModalOpen(false)} 
        accounts={accounts} 
        onSuccess={loadData} 
      />
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="bg-surface p-5 rounded-card border border-border group hover:border-primary/20 transition-colors shadow-sm">
    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em]">{label}</p>
    <p className={`text-xl font-black mt-2 ${color}`}>${value.toLocaleString('es-CO')}</p>
  </div>
);

export default Trabajo;