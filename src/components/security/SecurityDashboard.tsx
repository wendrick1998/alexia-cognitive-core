
/**
 * @description Security monitoring dashboard
 * @created_by Security Audit - Alex iA
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Lock, Eye, TrendingUp } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SecurityEvent {
  id: string;
  action: string;
  resource: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  rateLimitViolations: number;
  lastActivity: string | null;
}

const SecurityDashboard = () => {
  const { user } = useSecureAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    rateLimitViolations: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSecurityData = async () => {
      try {
        // Mock data for now - will be replaced with real data once security_events table is available
        const mockEvents: SecurityEvent[] = [
          {
            id: '1',
            action: 'signin_success',
            resource: 'auth',
            severity: 'low',
            details: { email: user.email },
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            action: 'api_call_initiated',
            resource: 'process-chat-message',
            severity: 'low',
            details: { hasBody: true },
            created_at: new Date(Date.now() - 300000).toISOString()
          }
        ];

        setEvents(mockEvents);

        // Calculate metrics from mock data
        const totalEvents = mockEvents.length;
        const criticalEvents = mockEvents.filter(e => e.severity === 'critical').length;
        const failedLogins = mockEvents.filter(e => e.action.includes('signin_failed')).length;
        const rateLimitViolations = mockEvents.filter(e => e.action.includes('rate_limit')).length;
        const lastActivity = mockEvents[0]?.created_at || null;

        setMetrics({
          totalEvents,
          criticalEvents,
          failedLogins,
          rateLimitViolations,
          lastActivity
        });

      } catch (error) {
        console.error('Error in security dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, [user]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Eye className="w-4 h-4" />;
      case 'low': return <Activity className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Faça login para acessar o dashboard de segurança.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Dashboard de Segurança</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas de Login</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{metrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Falharam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{metrics.rateLimitViolations}</div>
            <p className="text-xs text-muted-foreground">Violações</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Timeline */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Eventos Recentes</TabsTrigger>
          <TabsTrigger value="critical">Críticos</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes</CardTitle>
              <CardDescription>
                Eventos de segurança registrados (dados simulados)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`p-1 rounded-full ${getSeverityColor(event.severity)} text-white`}>
                      {getSeverityIcon(event.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.resource}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </p>
                      {Object.keys(event.details).length > 0 && (
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum evento de segurança registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Críticos</CardTitle>
              <CardDescription>
                Eventos que requerem atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.filter(e => e.severity === 'critical').map((event) => (
                  <Alert key={event.id} className="border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription>
                      <strong>{event.action}</strong> em {event.resource}
                      <br />
                      <span className="text-sm text-gray-600">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
                {events.filter(e => e.severity === 'critical').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum evento crítico registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Autenticação</CardTitle>
              <CardDescription>
                Tentativas de login, logout e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.filter(e => e.action.includes('signin') || e.action.includes('signup') || e.action.includes('signout')).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.action}</span>
                        <Badge variant={event.action.includes('failed') ? 'destructive' : 'default'}>
                          {event.action.includes('failed') ? 'Falhou' : 'Sucesso'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
                {events.filter(e => e.action.includes('signin') || e.action.includes('signup') || e.action.includes('signout')).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum evento de autenticação registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
