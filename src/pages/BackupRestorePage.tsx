
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BackupResult {
  success: boolean;
  backup?: string;
  metadata?: {
    totalRecords: number;
    tables: string[];
  };
  error?: string;
}

interface RestoreResult {
  success: boolean;
  restoredCount?: number;
  details?: Record<string, any>;
  error?: string;
}

const BackupRestorePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backupData, setBackupData] = useState('');
  const [lastBackup, setLastBackup] = useState<BackupResult | null>(null);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const { toast } = useToast();

  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    setLastBackup(null);
    
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: {
          action: 'backup',
          userId,
          options: {
            includeData: true,
            includeSchema: true,
            compressionLevel: 6
          }
        }
      });

      if (error) {
        throw error;
      }

      setLastBackup(data);
      
      toast({
        title: "Backup criado com sucesso!",
        description: `${data.metadata?.totalRecords || 0} registros foram salvos.`,
      });

    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Erro ao criar backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    if (!lastBackup?.backup) return;
    
    const blob = new Blob([lastBackup.backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alexia-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado",
      description: "O arquivo de backup está sendo baixado.",
    });
  };

  const handleRestoreBackup = async () => {
    if (!backupData.trim()) {
      toast({
        title: "Dados de backup necessários",
        description: "Por favor, cole os dados do backup no campo abaixo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRestoreResult(null);
    
    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: {
          action: 'restore',
          userId,
          backupData: backupData.trim()
        }
      });

      if (error) {
        throw error;
      }

      setRestoreResult(data);
      
      toast({
        title: "Restore realizado com sucesso!",
        description: `${data.restoredCount || 0} registros foram restaurados.`,
      });

    } catch (error) {
      console.error('Error restoring backup:', error);
      setRestoreResult({
        success: false,
        error: error.message
      });
      toast({
        title: "Erro ao restaurar backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBackupData(content);
      toast({
        title: "Arquivo carregado",
        description: "Dados do backup foram carregados com sucesso.",
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Gerencie backups dos seus dados do Alex iA de forma segura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Criar Backup
            </CardTitle>
            <CardDescription>
              Gere um backup completo dos seus dados incluindo conversas, memórias e documentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Criando...' : 'Criar Backup'}
            </Button>

            {lastBackup?.success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Backup criado com {lastBackup.metadata?.totalRecords} registros de {lastBackup.metadata?.tables?.length} tabelas.
                  <Button 
                    variant="link" 
                    onClick={handleDownloadBackup}
                    className="ml-2 p-0 h-auto"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Restore Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Restaurar Backup
            </CardTitle>
            <CardDescription>
              Restaure seus dados a partir de um arquivo de backup anterior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Carregar arquivo de backup:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ou cole os dados do backup:
              </label>
              <Textarea
                value={backupData}
                onChange={(e) => setBackupData(e.target.value)}
                placeholder="Cole aqui o conteúdo do arquivo de backup JSON..."
                rows={6}
                className="font-mono text-xs"
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta operação irá substituir todos os seus dados atuais pelos dados do backup.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleRestoreBackup}
              disabled={isLoading || !backupData.trim()}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Restaurando...' : 'Restaurar Backup'}
            </Button>

            {restoreResult && (
              <Alert>
                {restoreResult.success ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Restore concluído! {restoreResult.restoredCount} registros foram restaurados.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Erro no restore: {restoreResult.error}
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Backup:</strong> Clique em "Criar Backup" para gerar um arquivo JSON com todos os seus dados. Baixe e guarde o arquivo em local seguro.</p>
            <p><strong>Restore:</strong> Para restaurar, carregue o arquivo de backup ou cole o conteúdo JSON no campo apropriado e clique em "Restaurar Backup".</p>
            <p><strong>Segurança:</strong> Os backups contêm dados sensíveis. Mantenha-os seguros e não os compartilhe.</p>
            <p><strong>Compatibilidade:</strong> Use apenas backups gerados por esta versão do Alex iA.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestorePage;
