
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from './AccessibilityProvider';
import { Eye, Zap, Type, Focus, RotateCcw } from 'lucide-react';

const AccessibilityPanel = () => {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Acessibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Alto Contraste</label>
            <p className="text-xs text-muted-foreground">
              Aumenta o contraste para melhor visibilidade
            </p>
          </div>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSetting('highContrast', checked)}
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Movimento Reduzido
            </label>
            <p className="text-xs text-muted-foreground">
              Reduz animações e transições
            </p>
          </div>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
          />
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Type className="w-4 h-4" />
            Tamanho da Fonte
          </label>
          <Select
            value={settings.fontSize}
            onValueChange={(value) => updateSetting('fontSize', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequena</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="xl">Extra Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Focus Indicators */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Focus className="w-4 h-4" />
              Indicadores de Foco
            </label>
            <p className="text-xs text-muted-foreground">
              Mostra bordas ao navegar com teclado
            </p>
          </div>
          <Switch
            checked={settings.focusVisible}
            onCheckedChange={(checked) => updateSetting('focusVisible', checked)}
          />
        </div>

        {/* Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Status</span>
            <Badge variant="outline" className="text-xs">
              {Object.values(settings).filter(Boolean).length} ativos
            </Badge>
          </div>
          
          <Button
            onClick={resetSettings}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityPanel;
