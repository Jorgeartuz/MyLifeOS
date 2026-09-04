import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import type { WorkPackage, WorkDelivery, WorkPeriod } from '../types/work';

export const workService = {
  // --- PAQUETES ---
  
  /**
   * Obtiene el paquete de domicilios que esté marcado como 'active' 
   * y que aún tenga domicilios disponibles.
   */
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

  /**
   * Registra la compra de un paquete:
   * 1. Crea un gasto en la cuenta seleccionada en Finanzas.
   * 2. Crea el registro del paquete en Trabajo.
   */
  async buyPackage(size: number, price: number, accountId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    // Buscamos una categoría de gasto (por defecto la primera que sea de tipo expense)
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .limit(1);

    if (!categories || categories.length === 0) {
      throw new Error('No se encontró una categoría de gastos para registrar la compra.');
    }

    // 1. Registrar el gasto real en Finanzas (esto actualiza el saldo de la cuenta)
    const transaction = await financeService.createTransaction({
      account_id: accountId,
      category_id: categories[0].id,
      amount: price,
      type: 'expense',
      description: `Compra paquete ${size} domicilios`,
      transaction_date: new Date().toISOString()
    });

    // 2. Crear el paquete en la tabla work_packages
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

  /**
   * Registra un domicilio individual:
   * 1. Calcula comisión (20% si no hay paquete, 0% si hay paquete).
   * 2. Si es transferencia, crea un ingreso en Finanzas en la cuenta elegida.
   * 3. Si hay paquete, descuenta 1 domicilio disponible.
   */
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

    // Lógica Financiera: Solo si es transferencia
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

    // 1. Insertar el registro del Domicilio
    const { data: delivery, error: dError } = await supabase
      .from('work_deliveries')
      .insert([{
        user_id: user.id,
        amount,
        payment_method: method,
        // CORRECCIÓN PUNTUAL: Si es efectivo, el account_id es estrictamente nulo
        account_id: method === 'transfer' ? (accountId || null) : null,
        package_id: activePackage?.id || null,
        commission_amount: commission,
        net_amount: net,
        financial_transaction_id: financialTxId
      }])
      .select().single();

    if (dError) throw dError;

    // 2. Si se usó un paquete, actualizamos su contador
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

  /**
   * Obtiene el historial de domicilios filtrado por periodo.
   */
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
    
    // Tipado del resultado incluyendo la relación con accounts
    return data as (WorkDelivery & { accounts: { name: string } | null })[];
  }
};