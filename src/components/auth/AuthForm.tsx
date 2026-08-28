import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { signIn, signUp } from '../../services/auth.service';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const validateForm = (): string | null => {
    if (!email.trim() || !email.includes('@')) return 'Ingresa un correo electrónico válido';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (!isLogin) {
      if (!fullName.trim()) return 'El nombre completo es obligatorio';
      if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
        alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
        setIsLogin(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ¡IMPORTANTE! Asegúrate de que este RETURN exista y envuelva todo el HTML
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <div className="w-8 h-8 border-4 border-white rounded-md rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-text uppercase tracking-tight">
            MyLife<span className="text-primary">OS</span>
          </h1>
          <p className="text-text-secondary mt-2 text-sm">Tu sistema operativo personal</p>
        </div>

        <div className="bg-surface p-8 rounded-card border border-border shadow-sm">
          <h2 className="text-xl font-bold text-text mb-6">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-text-secondary" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    placeholder="Ej. Jorge Artuz"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-text-secondary" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-text-secondary" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-text-secondary" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle size={16} />
                <p className="text-[11px] font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? 'Entrar' : 'Registrarme'} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-border">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-widest"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};