
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, Smartphone, Volume2 } from 'lucide-react';

const NotificationsSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações de Notificações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Escolha como e quando você deseja receber notificações do Alex iA
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações Gerais
            </CardTitle>
            <CardDescription>
              Configure alertas gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Configurações gerais em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notificações por Email
            </CardTitle>
            <CardDescription>
              Configure alertas enviados por email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Notificações por email em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Notificações Push
            </CardTitle>
            <CardDescription>
              Configure notificações push para dispositivos móveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Notificações push em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Notificações Sonoras
            </CardTitle>
            <CardDescription>
              Configure alertas sonoros e vibrações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Configurações de som em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsSettings;
