
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter as Router } from 'react-router-dom';

// QueryClient otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
            <Toaster />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
