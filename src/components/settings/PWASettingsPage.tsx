
import React from 'react';
import ServiceWorkerManager from '@/components/optimization/ServiceWorkerManager';

const PWASettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações de PWA e Service Worker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie e visualize o status do Service Worker e funcionalidades PWA
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <ServiceWorkerManager />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
          Informação
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400">
          Esta seção permite depurar o comportamento offline e de cache do aplicativo.
        </div>
      </div>
    </div>
  );
};

export default PWASettingsPage;
