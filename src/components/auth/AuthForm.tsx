import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
// Importamos las funciones individuales para evitar el error de SyntaxError
import { signIn, signUp } from '../../services/auth.service';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
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
        // Asumimos que signIn devuelve los datos o lanza un error si falla
        await signIn(email, password);
        // Si llega aquí, el login fue exitoso. 
        // App.tsx detectará el cambio de sesión automáticamente por onAuthStateChange.
      } else {
        // Asumimos que signUp devuelve los datos o lanza un error si falla
        await signUp(email, password, fullName);
        
        alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
        setIsLogin(true);
      }
    } catch (err: any) {
      // Como tus servicios probablemente lanzan el error, lo capturamos aquí
      console.error("Error de autenticación:", err);
      
      // Manejo de errores amigable
      if (err.message === 'Invalid login credentials') {
        setError('Correo o contraseña incorrectos');
      } else if (err.message === 'User already registered') {
        setError('Este correo ya está registrado');
      } else {
        setError(err.message || 'Ocurrió un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        {/* Logo de MyLifeOS */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <div className="w-8 h-8 border-4 border-white rounded-md rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-text uppercase tracking-tight">
            MyLife<span className="text-primary">OS</span>
          </h1>
          <p className="text-text-secondary mt-2 text-sm">Tu sistema operativo personal</p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-surface p-8 rounded-card border border-border shadow-sm">
          <h2 className="text-xl font-bold text-text mb-6">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase px-1 tracking-wider">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-text-secondary" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="Ej. Jorge Artuz"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1 tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-text-secondary" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1 tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-text-secondary" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase px-1 tracking-wider">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-text-secondary" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {/* Alerta de Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p className="text-[11px] font-bold leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Iniciar Sesión' : 'Crear mi cuenta'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Switcher entre Login y Register */}
          <div className="mt-8 text-center pt-6 border-t border-border">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs font-bold text-text-secondary hover:text-primary transition-colors uppercase tracking-widest"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Entra aquí'}
            </button>
          </div>
        </div>
        
        {/* Footer legal/info */}
        <p className="text-center text-[10px] text-text-secondary mt-8 uppercase tracking-widest font-medium">
          Seguridad garantizada por Supabase Auth
        </p>
      </div>
    </div>
  );
};