import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import type { WorkPackage, WorkDelivery, WorkPeriod } from '../types/work';

export const workService = {
  // --- PAQUETES ---
  async getActivePackage() {
    const { data, error } = await supabase
      .from('work_packages')
      .select('*')
      .eq('status', 'active')
      .gt('remaining_deliveries', 0)
      .maybeSingle();
    if (error) throw error;
    return data as WorkPackage | null;
  },

  async buyPackage(size: number, price: number, accountId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Registrar gasto en Finanzas
    const transaction = await financeService.createTransaction({
      account_id: accountId,
      category_id: '792f3922-069a-4f51-8740-42013f9c6691', // ID de categoría 'Trabajo' o 'Otros'
      amount: price,
      type: 'expense',
      description: `Compra paquete ${size} domicilios`,
      transaction_date: new Date().toISOString()
    });

    // 2. Crear paquete
    const { data, error } = await supabase
      .from('work_packages')
      .insert([{
        user_id: user?.id,
        package_size: size,
        price,
        remaining_deliveries: size,
        financial_transaction_id: transaction.id
      }])
      .select().single();

    if (error) throw error;
    return data;
  },

  // --- DOMICILIOS ---
  async registerDelivery(amount: number, method: 'cash' | 'transfer', accountId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const activePackage = await this.getActivePackage();

    let commission = 0;
    let net = amount;
    let financialTxId = null;

    // Lógica de Comisión vs Paquete
    if (!activePackage) {
      commission = amount * 0.20;
      net = amount - commission;
    }

    // Si es transferencia, crear ingreso en Finanzas
    if (method === 'transfer' && accountId) {
      const tx = await financeService.createTransaction({
        account_id: accountId,
        category_id: '792f3922-069a-4f51-8740-42013f9c6691', // Categoría Domicilios (Ingreso)
        amount: amount,
        type: 'income',
        description: `Domicilio $${amount}`,
        transaction_date: new Date().toISOString()
      });
      financialTxId = tx.id;
    }

    // 1. Insertar Domicilio
    const { data: delivery, error: dError } = await supabase
      .from('work_deliveries')
      .insert([{
        user_id: user?.id,
        amount,
        payment_method: method,
        account_id: accountId || null,
        package_id: activePackage?.id || null,
        commission_amount: commission,
        net_amount: net,
        financial_transaction_id: financialTxId
      }])
      .select().single();

    if (dError) throw dError;

    // 2. Si había paquete, descontar 1
    if (activePackage) {
      const newRemaining = activePackage.remaining_deliveries - 1;
      await supabase
        .from('work_packages')
        .update({ 
          remaining_deliveries: newRemaining,
          used_deliveries: activePackage.used_deliveries + 1,
          status: newRemaining === 0 ? 'exhausted' : 'active'
        })
        .eq('id', activePackage.id);
    }

    return delivery;
  },

  async getDeliveries(period: WorkPeriod) {
    let query = supabase
      .from('work_deliveries')
      .select('*, accounts(name)')
      .order('created_at', { ascending: false });

    const now = new Date();
    if (period === 'hoy') {
      query = query.gte('created_at', new Date(now.setHours(0,0,0,0)).toISOString());
    } else if (period === 'semana') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
      query = query.gte('created_at', startOfWeek);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as WorkDelivery[];
  }
};