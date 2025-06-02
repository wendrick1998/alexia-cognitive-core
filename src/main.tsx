
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Performance monitoring otimizado
if ('performance' in window) {
  window.addEventListener('load', () => {
    // Log Core Web Vitals de forma mais eficiente
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    console.log('⚡ Performance Metrics:', {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    });
  });
}

// Error tracking otimizado
window.addEventListener('error', (event) => {
  // Só log de erros críticos para reduzir noise
  if (!event.message.includes('Script error') && !event.message.includes('Loading CSS chunk')) {
    console.error('🐛 Critical Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Filtrar erros de rede/carregamento não críticos
  if (!event.reason?.message?.includes('Loading chunk')) {
    console.error('🚫 Unhandled Promise Rejection:', event.reason);
  }
});

// Otimização de inicialização
const root = ReactDOM.createRoot(document.getElementById("root")!);

// Remover StrictMode em produção para melhor performance
const isProduction = import.meta.env.PROD;

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

if (isProduction) {
  root.render(<AppWrapper />);
} else {
  root.render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  );
}
