import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';

export default function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Simple update detection (in a real app, you'd use service workers)
    const checkForUpdates = () => {
      // This is a placeholder - in a real PWA, you'd check for service worker updates
      console.log('Checking for updates...');
    };

    checkForUpdates();
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-900 border shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Atualização disponível</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Uma nova versão está disponível
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleUpdate}
                className="text-xs bg-green-600 hover:bg-green-700"
              >
                Atualizar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="text-xs"
              >
                Depois
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
