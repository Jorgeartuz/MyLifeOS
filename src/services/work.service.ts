import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import type { WorkPackage, WorkDelivery, WorkPeriod } from '../types/work';

export const workService = {
  // --- PAQUETES ---
  
  async getActivePackage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('work_packages')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('remaining_deliveries', 0)
      .order('purchased_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return (data && data.length > 0) ? (data[0] as WorkPackage) : null;
  },

  async buyPackage(size: number, price: number, accountId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    // Buscar categoría preferente de trabajo/gastos operativos
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('type', 'expense');

    let categoryId: string | null = null;
    if (categories && categories.length > 0) {
      const match = categories.find(c => 
        c.name.toLowerCase().includes('trabajo') || 
        c.name.toLowerCase().includes('domicilio') ||
        c.name.toLowerCase().includes('paquete')
      );
      categoryId = match ? match.id : categories[0].id;
    }

    const transaction = await financeService.createTransaction({
      account_id: accountId,
      category_id: categoryId,
      amount: price,
      type: 'expense',
      description: `Compra paquete ${size} domicilios`,
      transaction_date: new Date().toISOString()
    });

    try {
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
    } catch (err) {
      // Revertir transacción si falla la creación del paquete
      await financeService.deleteTransaction(transaction);
      throw err;
    }
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
        .maybeSingle();

      if (!cashAccount) throw new Error('Crea una cuenta de tipo "Efectivo" en Finanzas.');
      targetAccountId = cashAccount.id;
    }

    if (!targetAccountId) throw new Error('Cuenta no definida.');

    // Buscar categoría preferente de ingresos por domicilios
    const { data: inCategories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('type', 'income');

    let inCatId: string | null = null;
    if (inCategories && inCategories.length > 0) {
      const match = inCategories.find(c => 
        c.name.toLowerCase().includes('domicilio') || 
        c.name.toLowerCase().includes('trabajo')
      );
      inCatId = match ? match.id : inCategories[0].id;
    }

    // Registramos la ganancia neta en finanzas para que el saldo y las estadísticas concuerden
    const tx = await financeService.createTransaction({
      account_id: targetAccountId,
      category_id: inCatId, 
      amount: net,
      type: 'income',
      description: `Domicilio (${method === 'cash' ? 'Efectivo' : 'Transferencia'})${commission > 0 ? ` (Neto - 20% com: $${commission.toLocaleString('es-CO')})` : ''}`,
      transaction_date: new Date().toISOString()
    });

    try {
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
    } catch (err) {
      // Revertir transacción si falla la inserción de la entrega
      await financeService.deleteTransaction(tx);
      throw err;
    }
  },

  async getDeliveries(period: WorkPeriod) {
    let query = supabase
      .from('work_deliveries')
      .select('*, accounts(name, type)')
      .order('created_at', { ascending: false });

    const now = new Date();
    if (period === 'hoy') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
      query = query.gte('created_at', start);
    } else if (period === 'semana') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0).toISOString();
      query = query.gte('created_at', start);
    } else if (period === 'mes') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString();
      query = query.gte('created_at', start);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data as (WorkDelivery & { accounts: { name: string, type: string } | null })[];
  }
};
