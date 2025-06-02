
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useEnvironmentValidation } from '@/hooks/useEnvironmentValidation';
import { usePWA } from '@/hooks/usePWA';
import { useAuth } from '@/hooks/useAuth';

export const SystemDiagnostics = () => {
  const [isOpen, setIsOpen] = useState(false);
  const envStatus = useEnvironmentValidation();
  const { capabilities } = usePWA();
  const { isAuthenticated, user } = useAuth();

  const diagnostics = [
    {
      category: 'Ambiente',
      status: envStatus.isValid ? 'success' : 'error',
      items: [
        {
          name: 'Supabase Conectado',
          status: envStatus.supabaseConnected ? 'success' : 'error',
          details: envStatus.supabaseConnected ? 'Configuração OK' : (envStatus.connectionError || 'Não configurado')
        },
        {
          name: 'Variáveis de Ambiente',
          status: envStatus.warnings.length === 0 ? 'success' : 'warning',
          details: envStatus.warnings.length === 0 
            ? 'Todas configuradas' 
            : `${envStatus.warnings.length} avisos`
        }
      ]
    },
    {
      category: 'Autenticação',
      status: isAuthenticated ? 'success' : 'warning',
      items: [
        {
          name: 'Status de Login',
          status: isAuthenticated ? 'success' : 'warning',
          details: isAuthenticated ? `Logado como ${user?.email}` : 'Não autenticado'
        }
      ]
    },
    {
      category: 'PWA',
      status: capabilities.isOnline ? 'success' : 'warning',
      items: [
        {
          name: 'Conexão',
          status: capabilities.isOnline ? 'success' : 'error',
          details: capabilities.isOnline ? 'Online' : 'Offline'
        },
        {
          name: 'Service Worker',
          status: capabilities.supportsPush ? 'success' : 'warning',
          details: capabilities.supportsPush ? 'Suportado' : 'Não suportado'
        },
        {
          name: 'Notificações',
          status: capabilities.hasNotificationPermission ? 'success' : 'warning',
          details: capabilities.hasNotificationPermission ? 'Ativas' : 'Não autorizadas'
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-700">OK</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Diagnóstico do Sistema</CardTitle>
                <CardDescription>
                  Verificar status dos componentes principais
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(envStatus.isValid && capabilities.isOnline ? 'success' : 'warning')}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {diagnostics.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{category.category}</h4>
                  {getStatusBadge(category.status)}
                </div>
                
                <div className="space-y-1 pl-4">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span>{item.name}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {item.details}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {envStatus.warnings.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Avisos de Configuração
                </h5>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {envStatus.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
