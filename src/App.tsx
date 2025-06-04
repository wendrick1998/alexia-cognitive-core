
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { SmartLoadingSpinner } from "@/components/ui/SmartLoadingSpinner";

// Lazy load pages for better performance
const BackupRestorePage = lazy(() => import("./pages/BackupRestorePage"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/backup-restore" 
              element={
                <Suspense fallback={<SmartLoadingSpinner type="database" message="Carregando sistema de backup..." />}>
                  <BackupRestorePage />
                </Suspense>
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
