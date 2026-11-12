import { supabase } from '../lib/supabase';
import { financeService } from './finance.service';
import type { CategoryType } from '../types/finance';
export const settingsService = {
  async load() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Inicia sesión para continuar.');
    const categories = await financeService.getCategories();
    return { user, categories };
  },
  async saveName(fullName: string) {
    if (!fullName.trim()) throw new Error('Ingresa tu nombre.');
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
    if (error) throw error;
  },
  async changePassword(password: string, currentPassword: string, email: string) {
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (authError) throw new Error('La contraseña actual no es correcta.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
  async addCategory(name: string, type: CategoryType) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Inicia sesión para continuar.');
    if (!name.trim()) throw new Error('Ingresa un nombre para la categoría.');
    const { error } = await supabase.from('categories').insert({ user_id: user.id, name: name.trim(), type, is_active: true });
    if (error) throw error;
  },
  async archiveCategory(id: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Inicia sesión para continuar.');
    const { error } = await supabase.from('categories').update({ is_active: false }).eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  },
};
