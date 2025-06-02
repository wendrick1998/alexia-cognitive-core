
import { Shield, Lock, Key, Smartphone, AlertTriangle, CheckCircle, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const SecurityPage = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginNotifications: true,
    sessionTimeout: true,
    deviceTracking: true,
    suspiciousActivity: true
  });

  const updateSetting = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const securityScore = 75; // Mock security score
  
  const recentActivity = [
    {
      action: 'Login successful',
      device: 'MacBook Pro - Chrome',
      location: 'São Paulo, SP',
      time: '2 horas atrás',
      status: 'success'
    },
    {
      action: 'Password changed',
      device: 'iPhone 15 - Safari',
      location: 'São Paulo, SP',
      time: '1 dia atrás',
      status: 'warning'
    },
    {
      action: 'Failed login attempt',
      device: 'Unknown Device',
      location: 'Rio de Janeiro, RJ',
      time: '3 dias atrás',
      status: 'danger'
    }
  ];

  const connectedDevices = [
    {
      name: 'MacBook Pro',
      browser: 'Chrome 121.0',
      location: 'São Paulo, SP',
      lastSeen: 'Agora',
      current: true
    },
    {
      name: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'São Paulo, SP',
      lastSeen: '2 horas atrás',
      current: false
    },
    {
      name: 'iPad Air',
      browser: 'Safari',
      location: 'São Paulo, SP',
      lastSeen: '1 dia atrás',
      current: false
    }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            Configurações de Segurança
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Mantenha sua conta segura com nossas ferramentas de proteção
          </p>
        </div>

        {/* Security Score */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Nível de Segurança
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {securityScore}% Seguro
              </Badge>
            </CardTitle>
            <CardDescription>
              Sua conta está bem protegida. Continue seguindo as melhores práticas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                style={{ width: `${securityScore}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>Básico</span>
              <span>Intermediário</span>
              <span>Avançado</span>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações de Proteção
            </CardTitle>
            <CardDescription>
              Configure as proteções da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Autenticação de dois fatores
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adicione uma camada extra de segurança
                </p>
              </div>
              <Switch
                checked={securitySettings.twoFactor}
                onCheckedChange={(value) => updateSetting('twoFactor', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Notificações de login</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receba alertas sobre novos logins
                </p>
              </div>
              <Switch
                checked={securitySettings.loginNotifications}
                onCheckedChange={(value) => updateSetting('loginNotifications', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Timeout automático de sessão</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Desconecta automaticamente após inatividade
                </p>
              </div>
              <Switch
                checked={securitySettings.sessionTimeout}
                onCheckedChange={(value) => updateSetting('sessionTimeout', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Rastreamento de dispositivos</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitora dispositivos conectados à conta
                </p>
              </div>
              <Switch
                checked={securitySettings.deviceTracking}
                onCheckedChange={(value) => updateSetting('deviceTracking', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Detecção de atividade suspeita</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitora tentativas de acesso não autorizadas
                </p>
              </div>
              <Switch
                checked={securitySettings.suspiciousActivity}
                onCheckedChange={(value) => updateSetting('suspiciousActivity', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password & Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Senha e Autenticação
            </CardTitle>
            <CardDescription>
              Gerencie sua senha e métodos de autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Configurar 2FA
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Chaves de Recuperação
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Ver Senhas Salvas
              </Button>
            </div>
            
            <Separator />
            
            <div className="text-sm space-y-2">
              <p><strong>Última alteração de senha:</strong> 15 dias atrás</p>
              <p><strong>Força da senha:</strong> <span className="text-green-600">Forte</span></p>
              <p><strong>2FA Status:</strong> <span className="text-red-600">Não configurado</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Dispositivos Conectados
            </CardTitle>
            <CardDescription>
              Monitore e gerencie dispositivos com acesso à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedDevices.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{device.name}</p>
                    {device.current && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {device.browser} • {device.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    Último acesso: {device.lastSeen}
                  </p>
                </div>
                {!device.current && (
                  <Button variant="destructive" size="sm">
                    Desconectar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas ações de segurança na sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.device} • {activity.location}
                  </p>
                </div>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Emergency Actions */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Ações de Emergência
            </CardTitle>
            <CardDescription>
              Use apenas se suspeitar que sua conta foi comprometida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="destructive" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Desconectar Todos os Dispositivos
              </Button>
              <Button variant="destructive" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Revogar Todas as Sessões
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityPage;
