import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Bombonas from './pages/Bombonas';
import BombonaDetails from './pages/BombonaDetails';
import EditBombona from './pages/EditBombona';
import Lavagens from './pages/Lavagens';
import Despachos from './pages/Despachos';
import Reports from './pages/Reports';
import Scanner from './pages/Scanner';
import Map from './pages/Map';
import LavagemDetails from './pages/LavagemDetails';

function App() {
  return (
    <TooltipProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/bombonas" element={<ProtectedRoute><Bombonas /></ProtectedRoute>} />
              <Route path="/bombonas/details/:id" element={<ProtectedRoute><BombonaDetails bombonaId="" bombonaName="" onLocationUpdated={() => {}} /></ProtectedRoute>} />
              <Route path="/bombonas/edit/:id" element={<ProtectedRoute><EditBombona /></ProtectedRoute>
                } 
              />
              <Route path="/lavagens" element={<ProtectedRoute><Lavagens /></ProtectedRoute>} />
              <Route path="/despachos" element={<ProtectedRoute><Despachos /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
              <Route path="/mapa" element={<ProtectedRoute><Map /></ProtectedRoute>} />
              <Route path="/lavagens/details/:id" element={<ProtectedRoute><LavagemDetails /></ProtectedRoute>} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </TooltipProvider>
  );
}

export default App;