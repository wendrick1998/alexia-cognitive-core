
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Shield,
  Save
} from 'lucide-react';

const UserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    displayName: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    notifications: {
      email: true,
      push: false,
      insights: true,
      updates: false
    },
    appearance: {
      theme: 'dark',
      language: 'pt-BR',
      compactMode: false
    },
    privacy: {
      analytics: true,
      personalization: true,
      shareData: false
    }
  });

  const handleSave = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="h-full overflow-y-auto scroll-container premium-scrollbar">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Preferências do Usuário</h1>
          <p className="text-white/60">Personalize sua experiência no AlexIA</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Informações do Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-500 text-white text-lg">
                      {preferences.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Alterar foto</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nome de exibição</Label>
                    <Input
                      id="displayName"
                      value={preferences.displayName}
                      onChange={(e) => setPreferences(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={preferences.email}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Configurações de Notificação</CardTitle>
                <CardDescription>Configure como você quer receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por email</Label>
                    <p className="text-sm text-white/60">Receber atualizações importantes por email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, email: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Insights cognitivos</Label>
                    <p className="text-sm text-white/60">Notificações sobre novos insights descobertos</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.insights}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, insights: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Configurações de Aparência</CardTitle>
                <CardDescription>Personalize a interface do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo compacto</Label>
                    <p className="text-sm text-white/60">Interface mais densa com menos espaçamento</p>
                  </div>
                  <Switch
                    checked={preferences.appearance.compactMode}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        appearance: { ...prev.appearance, compactMode: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Configurações de Privacidade</CardTitle>
                <CardDescription>Controle como seus dados são utilizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Análise de uso</Label>
                    <p className="text-sm text-white/60">Permitir coleta de dados para melhorar o sistema</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        privacy: { ...prev.privacy, analytics: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Personalização</Label>
                    <p className="text-sm text-white/60">Usar dados para personalizar experiência</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.personalization}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        privacy: { ...prev.privacy, personalization: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
