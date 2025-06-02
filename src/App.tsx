
import { Suspense, lazy, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { useEnvironmentValidation } from "@/hooks/useEnvironmentValidation";
import SplashScreen from "@/components/branding/SplashScreen";
import UpdatePrompt from "@/components/pwa/UpdatePrompt";
import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";
import { FullPageLoader } from "@/components/ui/page-loader";
import { RoutePrefetcher } from "@/components/ui/route-prefetcher";
import { ConnectionRetry } from "@/components/ui/connection-retry";
import "./App.css";

// Lazy load principais componentes
const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./components/auth/AuthPage"));
const NotFound = lazy(() => import("./pages/404"));

// Páginas específicas
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const IntegrationsManagerPage = lazy(() => import("./pages/IntegrationsManagerPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const CortexDashboard = lazy(() => import("./pages/CortexDashboard"));
const ValidationDashboard = lazy(() => import("./pages/ValidationDashboard"));

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const envStatus = useEnvironmentValidation();

  const handleSplashComplete = () => {
    console.log('🎬 Splash screen completed');
    setShowSplash(false);
  };

  // Show connection retry only for actual connection failures
  if (!envStatus.isValid && !envStatus.supabaseConnected && !showSplash) {
    return <ConnectionRetry />;
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
              <Route path="/cortex-dashboard" element={<CortexDashboard />} />
              <Route path="/validation" element={<ValidationDashboard />} />
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
    <AuthProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
