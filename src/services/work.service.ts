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
    if (!user) throw new Error('No hay usuario autenticado');

    // 1. Buscamos una categoría de gasto adecuada (ej: 'Otros gastos' o 'Moto')
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .limit(1);

    if (!categories || categories.length === 0) {
      throw new Error('No se encontró una categoría de gastos para registrar la compra.');
    }

    const categoryId = categories[0].id;

    // 2. Registrar el gasto en Finanzas (esto descuenta el saldo de la cuenta)
    const transaction = await financeService.createTransaction({
      account_id: accountId,
      category_id: categoryId,
      amount: price,
      type: 'expense',
      description: `Compra paquete ${size} domicilios`,
      transaction_date: new Date().toISOString()
    });

    // 3. Crear el paquete en la tabla work_packages
    const { data, error } = await supabase
      .from('work_packages')
      .insert([{
        user_id: user.id,
        package_size: size,
        price,
        remaining_deliveries: size,
        used_deliveries: 0,
        status: 'active',
        financial_transaction_id: transaction.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- DOMICILIOS ---
  async registerDelivery(amount: number, method: 'cash' | 'transfer', accountId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

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
      // Buscamos categoría de ingresos (ej: 'Domicilios')
      const { data: inCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .limit(1);

      const tx = await financeService.createTransaction({
        account_id: accountId,
        category_id: inCategories?.[0]?.id || '', 
        amount: amount,
        type: 'income',
        description: `Domicilio registrado $${amount}`,
        transaction_date: new Date().toISOString()
      });
      financialTxId = tx.id;
    }

    // 1. Insertar Domicilio
    const { data: delivery, error: dError } = await supabase
      .from('work_deliveries')
      .insert([{
        user_id: user.id,
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
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query = query.gte('created_at', startOfDay.toISOString());
    } else if (period === 'semana') {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      query = query.gte('created_at', startOfWeek.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as (WorkDelivery & { accounts: { name: string } | null })[];
  }
};