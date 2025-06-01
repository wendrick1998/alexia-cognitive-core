import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Melhorar o code splitting e reduzir o tamanho dos bundles
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar as bibliotecas React em um chunk próprio
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separar as bibliotecas UI em um chunk próprio
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // Separar as bibliotecas de visualização 3D em um chunk próprio
          '3d-vendor': ['@react-three/drei', '@react-three/fiber', 'three'],
          // Separar as bibliotecas de formulários em um chunk próprio
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Separar as bibliotecas de gráficos em um chunk próprio
          'chart-vendor': ['recharts'],
        },
      },
    },
    // Aumentar o limite de aviso para chunks grandes
    chunkSizeWarningLimit: 800,
    // Otimizar o código para produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
}));
