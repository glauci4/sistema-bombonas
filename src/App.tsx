import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Bombonas from "./pages/Bombonas";
import Scanner from "./pages/Scanner";
import Map from "./pages/Map";
import Reports from "./pages/Reports"; 
import Demo from "./pages/Demo";
import AllAssets from "./pages/AllAssets";
import BombonaDetails from "./pages/BombonaDetails";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/demo" 
            element={
              <ProtectedRoute>
                <Demo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/all-assets" 
            element={
              <ProtectedRoute>
                <AllAssets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bombonas" 
            element={
              <ProtectedRoute>
                <Bombonas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bombonas/details/:id" 
            element={
              <ProtectedRoute>
                <BombonaDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scanner" 
            element={
              <ProtectedRoute>
                <Scanner />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mapa" 
            element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/relatorios" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;