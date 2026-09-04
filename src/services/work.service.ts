import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
// Importamos solo lo que realmente usamos para que no haya avisos de "unused"
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

    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .limit(1);

    if (!categories || categories.length === 0) {
      throw new Error('Crea una categoría de gastos primero en la sección de Finanzas.');
    }

    const transaction = await financeService.createTransaction({
      account_id: accountId,
      category_id: categories[0].id,
      amount: price,
      type: 'expense',
      description: `Compra paquete ${size} domicilios`,
      transaction_date: new Date().toISOString()
    });

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
    let targetAccountId = accountId;

    if (!activePackage) {
      commission = amount * 0.20;
      net = amount - commission;
    }

    if (method === 'cash') {
      const { data: cashAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'cash')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!cashAccount) throw new Error('Crea una cuenta de tipo "Efectivo" en Finanzas.');
      targetAccountId = cashAccount.id;
    }

    if (!targetAccountId) throw new Error('Cuenta no definida.');

    const { data: inCategories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'income')
      .limit(1);

    const tx = await financeService.createTransaction({
      account_id: targetAccountId,
      category_id: inCategories?.[0]?.id || null, 
      amount: amount,
      type: 'income',
      description: `Domicilio (${method === 'cash' ? 'Efectivo' : 'Transferencia'})`,
      transaction_date: new Date().toISOString()
    });

    const { data: delivery, error: dError } = await supabase
      .from('work_deliveries')
      .insert([{
        user_id: user.id,
        amount,
        payment_method: method,
        account_id: targetAccountId,
        package_id: activePackage?.id || null,
        commission_amount: commission,
        net_amount: net,
        financial_transaction_id: tx.id
      }])
      .select().single();

    if (dError) throw dError;

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
      .select('*, accounts(name, type)')
      .order('created_at', { ascending: false });

    const now = new Date();
    if (period === 'hoy') {
      const start = new Date(now.setHours(0,0,0,0)).toISOString();
      query = query.gte('created_at', start);
    } else if (period === 'semana') {
      const start = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
      query = query.gte('created_at', start);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Aquí es donde usamos el tipo WorkDelivery para que el aviso amarillo desaparezca
    return data as (WorkDelivery & { accounts: { name: string, type: string } | null })[];
  }
};