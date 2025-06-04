
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServiceWorkerManager() {
  const [swStatus, setSwStatus] = useState<'registering' | 'ready' | 'updated' | 'error'>('registering');
  const [swVersion, setSwVersion] = useState<string>('1.0.0');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          setSwStatus('ready');
          
          registration.addEventListener('updatefound', () => {
            setSwStatus('updated');
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
          setSwStatus('error');
        });
    }
  }, []);

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      window.location.reload();
    }
  };

  // Only show in development mode or if there's an update
  if (swStatus === 'ready') return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader>
        <CardTitle className="text-sm">Service Worker</CardTitle>
        <CardDescription>
          {swStatus === 'registering' && 'Registrando...'}
          {swStatus === 'updated' && `Atualizado para versão ${swVersion}`}
          {swStatus === 'error' && 'Erro no registro'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={clearCache}>
            Limpar Cache
          </Button>
          {swStatus === 'updated' && (
            <Button size="sm" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
