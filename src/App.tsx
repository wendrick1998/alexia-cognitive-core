
import { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { AuthProvider } from "@/hooks/useAuth";
import SplashScreen from "@/components/branding/SplashScreen";
import UpdatePrompt from "@/components/pwa/UpdatePrompt";
import { SkeletonPremium } from "@/components/ui/skeleton-premium";
import "./App.css";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/404"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Loading component
  const LoadingFallback = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md mx-auto p-8">
        <SkeletonPremium className="h-12 w-12 rounded-full mx-auto" variant="circular" />
        <SkeletonPremium className="h-8 w-48 mx-auto" />
        <SkeletonPremium className="h-4 w-32 mx-auto" />
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <SkeletonPremium key={i} className="h-2 w-2 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
              
              <Toaster />
              <UpdatePrompt />
            </>
          )}
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
