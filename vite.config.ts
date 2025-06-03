
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Análise visual do bundle
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    // Compressão gzip e brotli
    mode === 'production' && compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    mode === 'production' && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizar o código para produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    // Aumentar o limite de aviso para chunks grandes
    chunkSizeWarningLimit: 200,
    // Configurar rollup para otimização avançada
    rollupOptions: {
      output: {
        // Manual chunks para separar dependências grandes
        manualChunks: {
          // Chunk para React e dependências core
          'react-vendor': [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          // Chunk para bibliotecas UI do Radix/Shadcn
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
          // Chunk para bibliotecas de visualização 3D
          'three-vendor': [
            'three',
            '@react-three/fiber',
            '@react-three/drei'
          ],
          // Chunk para bibliotecas de formulários
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          // Chunk para bibliotecas de gráficos
          'chart-vendor': [
            'recharts'
          ],
          // Chunk para bibliotecas de animação
          'animation-vendor': [
            'framer-motion'
          ],
          // Chunk para Supabase e query
          'data-vendor': [
            '@supabase/supabase-js',
            '@tanstack/react-query'
          ],
          // Chunk para utilitários
          'utils-vendor': [
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'date-fns',
            'uuid',
            'lucide-react'
          ]
        },
        // Configurar nomes de arquivo com hash para cache busting
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '') 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      // Configurações para otimização
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // Configurar target para suporte moderno
    target: 'esnext',
    // Habilitar sourcemaps em desenvolvimento
    sourcemap: mode === 'development',
  },
  // Otimizações para desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
  // Configurar cache para melhor performance
  cacheDir: 'node_modules/.vite',
}));
