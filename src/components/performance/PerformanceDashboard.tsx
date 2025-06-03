
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CacheMonitor } from '@/components/cache/CacheMonitor';
import { SemanticCacheStats } from '@/components/cache/SemanticCacheStats';
import PerformanceOptimizer from './PerformanceOptimizer';
import { motion } from 'framer-motion';
import { Activity, Database, Settings } from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className }) => {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Dashboard</h1>
          <p className="text-gray-400">
            Monitore e otimize a performance do Alex iA em tempo real
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="cache" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cache
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Otimização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <CacheMonitor />
              <SemanticCacheStats />
            </motion.div>
          </TabsContent>

          <TabsContent value="cache" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              <CacheMonitor className="xl:col-span-1" />
              <SemanticCacheStats />
            </motion.div>
          </TabsContent>

          <TabsContent value="optimization">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PerformanceOptimizer />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default PerformanceDashboard;
