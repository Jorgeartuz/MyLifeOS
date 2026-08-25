import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

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
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;