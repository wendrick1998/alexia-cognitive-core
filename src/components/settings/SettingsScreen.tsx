
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Save,
  Moon,
  Sun,
  Monitor,
  Globe,
  Volume2
} from 'lucide-react';

const SettingsScreen = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Perfil
    name: 'Alex IA User',
    email: 'user@alexia.dev',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    
    // Aparência
    theme: 'system',
    fontSize: 16,
    compactMode: false,
    animations: true,
    
    // Notificações
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationVolume: 70,
    
    // IA
    aiResponseStyle: 'balanced',
    autoSave: true,
    contextMemory: true,
    voiceInput: false,
    
    // Privacidade
    dataCollection: true,
    analytics: false,
    crashReports: true
  });

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Configurações redefinidas",
      description: "Todas as configurações foram restauradas para os valores padrão.",
    });
  };

  return (
    <div className="h-full overflow-y-auto premium-scrollbar p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personalize sua experiência com o Alex IA
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacidade</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Configure suas informações básicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso horário</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalização Visual
              </CardTitle>
              <CardDescription>
                Ajuste a aparência da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Claro', icon: Sun },
                    { value: 'dark', label: 'Escuro', icon: Moon },
                    { value: 'system', label: 'Sistema', icon: Monitor }
                  ].map((theme) => (
                    <Button
                      key={theme.value}
                      variant={settings.theme === theme.value ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col gap-2"
                      onClick={() => setSettings({ ...settings, theme: theme.value })}
                    >
                      <theme.icon className="h-5 w-5" />
                      <span>{theme.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Tamanho da fonte: {settings.fontSize}px</Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => setSettings({ ...settings, fontSize: value[0] })}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo compacto</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reduzir espaçamentos para mais conteúdo
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animações</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ativar transições e efeitos visuais
                  </p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => setSettings({ ...settings, animations: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por email</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receber atualizações importantes por email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações push</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Alertas instantâneos no navegador
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sons de notificação</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reproduzir sons para alertas
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                />
              </div>

              {settings.soundEnabled && (
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Volume: {settings.notificationVolume}%
                  </Label>
                  <Slider
                    value={[settings.notificationVolume]}
                    onValueChange={(value) => setSettings({ ...settings, notificationVolume: value[0] })}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de IA
              </CardTitle>
              <CardDescription>
                Personalize o comportamento da inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Estilo de resposta</Label>
                <Select value={settings.aiResponseStyle} onValueChange={(value) => setSettings({ ...settings, aiResponseStyle: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Conciso</SelectItem>
                    <SelectItem value="balanced">Equilibrado</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Salvamento automático</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Salvar conversas automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Memória contextual</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    IA lembrará do contexto das conversas
                  </p>
                </div>
                <Switch
                  checked={settings.contextMemory}
                  onCheckedChange={(checked) => setSettings({ ...settings, contextMemory: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Entrada por voz</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usar reconhecimento de voz para input
                  </p>
                </div>
                <Switch
                  checked={settings.voiceInput}
                  onCheckedChange={(checked) => setSettings({ ...settings, voiceInput: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade e Dados
              </CardTitle>
              <CardDescription>
                Controle como seus dados são utilizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Coleta de dados de uso</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ajudar a melhorar o produto com dados anônimos
                  </p>
                </div>
                <Switch
                  checked={settings.dataCollection}
                  onCheckedChange={(checked) => setSettings({ ...settings, dataCollection: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permitir análise de uso para melhorias
                  </p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => setSettings({ ...settings, analytics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios de erro</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enviar relatórios automáticos de erro
                  </p>
                </div>
                <Switch
                  checked={settings.crashReports}
                  onCheckedChange={(checked) => setSettings({ ...settings, crashReports: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Restaurar Padrões
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreen;
