
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

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered successfully:', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New service worker available, will update on next visit');
              // Optionally show update notification
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
  
  // Handle service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 Message from service worker:', event.data);
    
    if (event.data.type === 'CACHE_UPDATED') {
      console.log('💾 Cache updated:', event.data.payload);
    }
  });
}

// PWA Install Prompt Detection
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (event) => {
  console.log('📱 PWA install prompt triggered');
  event.preventDefault();
  deferredPrompt = event;
  
  // Dispatch custom event for components to listen
  window.dispatchEvent(new CustomEvent('pwa-install-available', {
    detail: { prompt: event }
  }));
});

// PWA Install Success Detection
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA was installed successfully');
  deferredPrompt = null;
  
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// iOS PWA Detection and Optimization
const isIOSPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// iOS Specific Optimizations
if (isIOSPWA()) {
  console.log('🍎 Running as iOS PWA');
  
  // Prevent zoom on double tap
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  });
  
  // Prevent bounce scroll
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });
  
  // Add iOS PWA class for specific styling
  document.documentElement.classList.add('ios-pwa');
}

// Check if running in standalone mode
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('📱 Running in standalone mode');
  document.documentElement.classList.add('standalone-mode');
}

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
