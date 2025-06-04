
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppProviders from '@/components/layout/AppProviders';
import AppRoutes from '@/components/layout/AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
