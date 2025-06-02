
import { Suspense, lazy, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { AuthProvider } from "@/hooks/useAuth";
import SplashScreen from "@/components/branding/SplashScreen";
import UpdatePrompt from "@/components/pwa/UpdatePrompt";
import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";
import { FullPageLoader } from "@/components/ui/page-loader";
import { RoutePrefetcher } from "@/components/ui/route-prefetcher";
import "./App.css";

// Lazy load principais componentes
const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./components/auth/AuthPage"));
const NotFound = lazy(() => import("./pages/404"));

// Páginas específicas
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const IntegrationsManagerPage = lazy(() => import("./pages/IntegrationsManagerPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));

// Create a client com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Reduzir tentativas para melhor performance
    },
  },
});

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    console.log('🎬 Splash screen completed');
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <>
              <Suspense fallback={<FullPageLoader text="Carregando aplicação..." />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/integrations-manager" element={<IntegrationsManagerPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
              
              <RoutePrefetcher />
              <Toaster />
              <UpdatePrompt />
              <PWAInstallBanner />
            </>
          )}
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
