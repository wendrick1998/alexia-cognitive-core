
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  sidebarWidth?: string;
}

const ResponsiveLayout = ({
  children,
  sidebar,
  header,
  className,
  sidebarWidth = '300px'
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className={cn('h-screen flex flex-col overflow-hidden', className)}>
      {/* Header */}
      {header && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-40"
        >
          {header}
        </motion.header>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <>
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.aside
                  key="sidebar"
                  initial={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={cn(
                    'flex-shrink-0 border-r border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl',
                    isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative',
                    'overflow-hidden'
                  )}
                  style={{ width: sidebarWidth }}
                >
                  {sidebar}
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />
            )}

            {/* Mobile Toggle Button */}
            {isMobile && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="fixed top-4 left-4 z-50"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                >
                  {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex-1 overflow-hidden bg-gray-50/50 dark:bg-gray-950/50"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
