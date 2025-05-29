
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { X, Camera, User, Bot, Palette, Bell, Shield, ChevronRight, Upload } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useAuth } from "@/hooks/useAuth";
import DarkModeToggle from "@/components/premium/DarkModeToggle";

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_MODELS = [
  { id: 'auto', name: 'Auto', description: 'Escolha inteligente' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Raciocínio avançado' },
  { id: 'claude', name: 'Claude', description: 'Criativo e analítico' },
  { id: 'deepseek', name: 'DeepSeek', description: 'Programação expert' },
  { id: 'groq', name: 'Groq', description: 'Ultra rápido' },
];

const ACCENT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
];

const SettingsScreen = ({ isOpen, onClose }: SettingsScreenProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useDarkMode();
  
  // Settings state
  const [selectedModel, setSelectedModel] = useState('auto');
  const [autoRouting, setAutoRouting] = useState(true);
  const [fontSize, setFontSize] = useState([16]);
  const [density, setDensity] = useState('normal');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [pauseLearning, setPauseLearning] = useState(false);
  const [selectedAccentColor, setSelectedAccentColor] = useState('#3B82F6');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl h-[90vh] bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Configurações</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-100px)]">
          
          {/* Profile Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    defaultValue={user?.email?.split('@')[0] || 'Usuário'}
                    className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1">Plano Gratuito</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI & Models Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                IA & Modelos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modelo Padrão</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {AI_MODELS.find(m => m.id === selectedModel)?.name}
                  </p>
                </div>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-3 py-2 text-sm"
                >
                  {AI_MODELS.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Roteamento Automático</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Escolha inteligente de modelo</p>
                </div>
                <Switch 
                  checked={autoRouting} 
                  onCheckedChange={setAutoRouting}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Palette className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{theme}</p>
                </div>
                <DarkModeToggle />
              </div>

              <div className="space-y-2">
                <p className="font-medium">Cor de Destaque</p>
                <div className="flex gap-2">
                  {ACCENT_COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedAccentColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedAccentColor === color.value ? 'border-gray-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Tamanho da Fonte</p>
                  <span className="text-sm text-gray-500">{fontSize[0]}px</span>
                </div>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <p className="font-medium">Densidade</p>
                <div className="flex gap-2">
                  {['compact', 'normal', 'comfort'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDensity(d)}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        density === d 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receber notificações</p>
                </div>
                <Switch 
                  checked={pushNotifications} 
                  onCheckedChange={setPushNotifications}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sons</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Efeitos sonoros</p>
                </div>
                <Switch 
                  checked={sounds} 
                  onCheckedChange={setSounds}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Não Perturbe</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">22:00 - 08:00</p>
                </div>
                <Switch 
                  checked={doNotDisturb} 
                  onCheckedChange={setDoNotDisturb}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                Privacidade & Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="text-left">
                  <p className="font-medium">Exportar Dados</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Download dos seus dados</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pausar Aprendizado</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">IA não aprende com conversas</p>
                </div>
                <Switch 
                  checked={pauseLearning} 
                  onCheckedChange={setPauseLearning}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="text-left">
                  <p className="font-medium text-red-600 dark:text-red-400">Limpar Memórias</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remove todas as memórias</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <div className="text-left">
                  <p className="font-medium text-red-600 dark:text-red-400">Deletar Conta</p>
                  <p className="text-sm text-red-400">Ação irreversível</p>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
