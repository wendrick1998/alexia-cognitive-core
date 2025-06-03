
/**
 * @description Layout responsivo otimizado para diferentes dispositivos
 * @created_by Fase 2 - Otimização UX
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  className?: string;
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  footer,
  sidebarCollapsed = false,
  onSidebarToggle,
  className
}: ResponsiveLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-900 text-white', className)}>
      {/* Header */}
      {header && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-white/10"
        >
          {header}
        </motion.header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ 
              x: 0,
              width: sidebarCollapsed ? 80 : 300
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              'sticky top-0 h-screen bg-gray-800/50 border-r border-white/10',
              'hidden md:block overflow-hidden'
            )}
          >
            <div className="p-4">
              {sidebar}
            </div>
          </motion.aside>
        )}

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </motion.main>
      </div>

      {/* Footer */}
      {footer && (
        <motion.footer
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-800/50 border-t border-white/10 p-4"
        >
          {footer}
        </motion.footer>
      )}

      {/* Mobile sidebar overlay */}
      {sidebar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          style={{ pointerEvents: sidebarCollapsed ? 'none' : 'auto' }}
          onClick={onSidebarToggle}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: sidebarCollapsed ? -300 : 0 }}
            className="w-80 h-full bg-gray-800 border-r border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {sidebar}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default ResponsiveLayout;
