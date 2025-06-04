
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Bot, Shield, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const SettingsLayout = () => {
  const navigationItems = [
    {
      id: 'profile',
      title: 'Perfil do Usuário',
      path: 'profile',
      icon: User,
      description: 'Configurações pessoais e preferências'
    },
    {
      id: 'ai',
      title: 'Configurações de IA',
      path: 'ai',
      icon: Bot,
      description: 'Modelos e comportamento da IA'
    },
    {
      id: 'security',
      title: 'Segurança',
      path: 'security',
      icon: Shield,
      description: 'Privacidade e segurança'
    },
    {
      id: 'notifications',
      title: 'Notificações',
      path: 'notifications',
      icon: Bell,
      description: 'Alertas e notificações'
    }
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configurações
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie suas preferências e configurações do Alex iA
          </p>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors duration-200 group",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                    )} />
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "font-medium text-sm",
                        isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
                      )}>
                        {item.title}
                      </div>
                      <div className={cn(
                        "text-xs mt-1",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Dica
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Use as configurações para personalizar sua experiência com o Alex iA
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingsLayout;
