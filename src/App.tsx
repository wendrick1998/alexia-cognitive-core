
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import PWAAuthPage from '@/components/auth/PWAAuthPage';
import PremiumAppLayout from '@/components/layout/PremiumAppLayout';
import Chat from '@/components/Chat';
import Dashboard from '@/components/dashboard/Dashboard';
import CortexDashboard from '@/pages/CortexDashboard';
import UnifiedDashboardPage from '@/pages/UnifiedDashboardPage';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import TaskFrameworkDashboard from '@/components/autonomous/TaskFrameworkDashboard';
import MultiAgentDashboard from '@/components/multiagent/MultiAgentDashboard';
import AdaptiveLearningDashboardPage from '@/pages/AdaptiveLearningDashboardPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [currentSection, setCurrentSection] = useState('chat');

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth route */}
            <Route path="/auth" element={<PWAAuthPage />} />
            
            <Route path="/" element={
              <AuthGuard>
                <PremiumAppLayout currentSection={currentSection} onSectionChange={handleSectionChange}>
                  <Chat />
                </PremiumAppLayout>
              </AuthGuard>
            } />
            
            <Route path="/dashboard" element={
              <AuthGuard>
                <PremiumAppLayout currentSection="dashboard" onSectionChange={handleSectionChange}>
                  <Dashboard />
                </PremiumAppLayout>
              </AuthGuard>
            } />

            <Route path="/unified-dashboard" element={
              <AuthGuard>
                <UnifiedDashboardPage />
              </AuthGuard>
            } />

            <Route path="/performance-dashboard" element={
              <AuthGuard>
                <PremiumAppLayout currentSection="performance" onSectionChange={handleSectionChange}>
                  <PerformanceDashboard />
                </PremiumAppLayout>
              </AuthGuard>
            } />

            <Route path="/autonomous-dashboard" element={
              <AuthGuard>
                <PremiumAppLayout currentSection="autonomous" onSectionChange={handleSectionChange}>
                  <TaskFrameworkDashboard />
                </PremiumAppLayout>
              </AuthGuard>
            } />

            <Route path="/multiagent-dashboard" element={
              <AuthGuard>
                <PremiumAppLayout currentSection="multiagent" onSectionChange={handleSectionChange}>
                  <MultiAgentDashboard />
                </PremiumAppLayout>
              </AuthGuard>
            } />

            <Route path="/adaptive-learning-dashboard" element={
              <AuthGuard>
                <AdaptiveLearningDashboardPage />
              </AuthGuard>
            } />
            
            <Route path="/cortex" element={<CortexDashboard />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster />
          <SonnerToaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
