
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Lock, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';

const SecuritySettings = () => {
  const { toast } = useToast();
  const [security, setSecurity] = useState({
    authentication: {
      requireMFA: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    encryption: {
      dataAtRest: true,
      dataInTransit: true,
      endToEndEncryption: false
    },
    access: {
      ipWhitelist: '',
      allowedDomains: '',
      requireVPN: false
    },
    audit: {
      logAllActions: true,
      retentionDays: 90,
      alertOnSuspiciousActivity: true
    }
  });

  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'OpenAI API', status: 'active', lastUsed: '2 minutos atrás' },
    { id: '2', name: 'Anthropic API', status: 'active', lastUsed: '15 minutos atrás' },
    { id: '3', name: 'Supabase API', status: 'active', lastUsed: '1 hora atrás' }
  ]);

  const handleSave = () => {
    toast({
      title: "Configurações de segurança salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const regenerateApiKey = (keyId: string) => {
    toast({
      title: "Chave API regenerada",
      description: "Uma nova chave foi gerada. Atualize suas integrações.",
    });
  };

  const securityScore = 85; // Calculado baseado nas configurações

  return (
    <div className="h-full overflow-y-auto scroll-container premium-scrollbar">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Configurações de Segurança</h1>
          <p className="text-white/60">Gerencie a segurança e proteção do sistema</p>
        </div>

        {/* Security Score */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pontuação de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-green-400">{securityScore}%</div>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-400 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${securityScore}%` }}
                  />
                </div>
                <p className="text-sm text-white/60 mt-2">
                  Boa segurança! Considere habilitar MFA para melhorar ainda mais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              Autenticação
            </CardTitle>
            <CardDescription>Configure as políticas de autenticação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação Multi-Fator (MFA)</Label>
                <p className="text-sm text-white/60">Requer código adicional para login</p>
              </div>
              <Switch
                checked={security.authentication.requireMFA}
                onCheckedChange={(checked) => 
                  setSecurity(prev => ({ 
                    ...prev, 
                    authentication: { ...prev.authentication, requireMFA: checked }
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de Sessão (horas)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={security.authentication.sessionTimeout}
                  onChange={(e) => 
                    setSecurity(prev => ({ 
                      ...prev, 
                      authentication: { ...prev.authentication, sessionTimeout: parseInt(e.target.value) }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Máx. Tentativas de Login</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={security.authentication.maxLoginAttempts}
                  onChange={(e) => 
                    setSecurity(prev => ({ 
                      ...prev, 
                      authentication: { ...prev.authentication, maxLoginAttempts: parseInt(e.target.value) }
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encryption Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Criptografia
            </CardTitle>
            <CardDescription>Configure as opções de criptografia de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Criptografia de Dados em Repouso</Label>
                <p className="text-sm text-white/60">Criptografar dados armazenados no banco</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <Badge variant="secondary">Ativo</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Criptografia de Dados em Trânsito</Label>
                <p className="text-sm text-white/60">HTTPS/TLS para todas as comunicações</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <Badge variant="secondary">Ativo</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Criptografia Ponta-a-Ponta</Label>
                <p className="text-sm text-white/60">Criptografia adicional para dados sensíveis</p>
              </div>
              <Switch
                checked={security.encryption.endToEndEncryption}
                onCheckedChange={(checked) => 
                  setSecurity(prev => ({ 
                    ...prev, 
                    encryption: { ...prev.encryption, endToEndEncryption: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* API Keys Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gerenciamento de Chaves API
            </CardTitle>
            <CardDescription>Monitore e gerencie as chaves de API do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">{key.name}</p>
                      <p className="text-sm text-white/60">Último uso: {key.lastUsed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                      {key.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateApiKey(key.id)}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Regenerar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Controle de Acesso
            </CardTitle>
            <CardDescription>Configure restrições de acesso ao sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ipWhitelist">Lista de IPs Permitidos</Label>
              <Input
                id="ipWhitelist"
                placeholder="192.168.1.1, 10.0.0.1 (deixe vazio para permitir todos)"
                value={security.access.ipWhitelist}
                onChange={(e) => 
                  setSecurity(prev => ({ 
                    ...prev, 
                    access: { ...prev.access, ipWhitelist: e.target.value }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requerer VPN</Label>
                <p className="text-sm text-white/60">Permitir acesso apenas através de VPN</p>
              </div>
              <Switch
                checked={security.access.requireVPN}
                onCheckedChange={(checked) => 
                  setSecurity(prev => ({ 
                    ...prev, 
                    access: { ...prev.access, requireVPN: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Audit Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Auditoria e Monitoramento
            </CardTitle>
            <CardDescription>Configure o sistema de auditoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registrar Todas as Ações</Label>
                <p className="text-sm text-white/60">Manter log detalhado de todas as atividades</p>
              </div>
              <Switch
                checked={security.audit.logAllActions}
                onCheckedChange={(checked) => 
                  setSecurity(prev => ({ 
                    ...prev, 
                    audit: { ...prev.audit, logAllActions: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Atividade Suspeita</Label>
                <p className="text-sm text-white/60">Notificar sobre atividades anômalas</p>
              </div>
              <Switch
                checked={security.audit.alertOnSuspiciousActivity}
                onCheckedChange={(checked) => 
                  setSecurity(prev => ({ 
                    ...prev, 
                    audit: { ...prev.audit, alertOnSuspiciousActivity: checked }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention">Retenção de Logs (dias)</Label>
              <Input
                id="retention"
                type="number"
                value={security.audit.retentionDays}
                onChange={(e) => 
                  setSecurity(prev => ({ 
                    ...prev, 
                    audit: { ...prev.audit, retentionDays: parseInt(e.target.value) }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
