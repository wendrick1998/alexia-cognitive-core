
import { Suspense, lazy, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { useEnvironmentValidation } from "@/hooks/useEnvironmentValidation";
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

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const envStatus = useEnvironmentValidation();

  const handleSplashComplete = () => {
    console.log('🎬 Splash screen completed');
    setShowSplash(false);
  };

  // Mostrar erro se ambiente não estiver configurado corretamente
  if (!envStatus.isValid && !showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/10">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Configuração Incompleta
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            O Alex iA precisa de algumas configurações para funcionar corretamente:
          </p>
          <ul className="text-left text-sm text-gray-500 dark:text-gray-400 mb-6">
            {envStatus.missingSecrets.map(secret => (
              <li key={secret}>• {secret}</li>
            ))}
          </ul>
          <p className="text-xs text-gray-400">
            Verifique as configurações do projeto no Supabase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <AppContent />
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
