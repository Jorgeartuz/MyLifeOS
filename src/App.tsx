import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { type Session } from '@supabase/supabase-js';
import { MainLayout } from './components/layout/MainLayout';
import { AuthForm } from './components/auth/AuthForm';
import { Loader2 } from 'lucide-react';
import { InstallAppButton } from './components/layout/InstallAppButton';

// Páginas
import Dashboard from './pages/Dashboard';
const Finanzas = lazy(() => import('./pages/Finanzas'));
const Trabajo = lazy(() => import('./pages/Trabajo'));
const Moto = lazy(() => import('./pages/Moto'));
const Metas = lazy(() => import('./pages/Metas'));
const Deudas = lazy(() => import('./pages/Deudas'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Configuracion = lazy(() => import('./pages/Configuracion'));

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios en el estado de autenticación (Login, Logout, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pantalla de carga mientras detectamos la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Si no hay sesión, mostramos el formulario de autenticación
  if (!session) {
    return <><AuthForm /><div className="fixed top-4 right-4 z-20"><InstallAppButton /></div></>;
  }

  // Si hay sesión, mostramos la aplicación principal
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<div className="py-16 flex justify-center" role="status"><Loader2 className="animate-spin text-primary" /><span className="sr-only">Abriendo módulo</span></div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/trabajo" element={<Trabajo />} />
          <Route path="/moto" element={<Moto />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/deudas" element={<Deudas />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/configuracion" element={<Configuracion />} />
          {/* Redirigir cualquier ruta desconocida al Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App;
