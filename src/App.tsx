import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { MainLayout } from './components/layout/MainLayout';
import { AuthForm } from './components/auth/AuthForm';
import { Loader2 } from 'lucide-react';

// Páginas
import Dashboard from './pages/Dashboard';
import Finanzas from './pages/Finanzas';
import Trabajo from './pages/Trabajo';
import Moto from './pages/Moto';
import Metas from './pages/Metas';
import Deudas from './pages/Deudas';
import Calendario from './pages/Calendario';
import Configuracion from './pages/Configuracion';

function App() {
  const [session, setSession] = useState<any>(null);
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
    return <AuthForm />;
  }

  // Si hay sesión, mostramos la aplicación principal
  return (
    <Router>
      <MainLayout>
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
      </MainLayout>
    </Router>
  );
}

export default App;