
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  CalendarDays,
  PlayCircle,
  Settings,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useConsolidationScheduler } from '@/hooks/useConsolidationScheduler';
import { useMemoryActivation } from '@/hooks/useMemoryActivation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ConsolidationPanel = () => {
  const { 
    schedules, 
    isRunning, 
    currentOperation,
    runConsolidation,
    toggleSchedule,
    forceConsolidation,
    getSystemStatus 
  } = useConsolidationScheduler();
  
  const { stats } = useMemoryActivation();
  const systemStatus = getSystemStatus();

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case 'hourly': return <Clock className="w-4 h-4" />;
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <CalendarDays className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getScheduleColor = (enabled: boolean, nextRun: string) => {
    if (!enabled) return 'bg-gray-100 text-gray-600';
    
    const timeUntilRun = new Date(nextRun).getTime() - Date.now();
    if (timeUntilRun < 60 * 60 * 1000) return 'bg-yellow-100 text-yellow-800'; // < 1 hora
    if (timeUntilRun < 24 * 60 * 60 * 1000) return 'bg-blue-100 text-blue-800'; // < 1 dia
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Status da Consolidação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalMemories}</div>
              <div className="text-sm text-gray-600">Memórias Totais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activeNodes}</div>
              <div className="text-sm text-gray-600">Nós Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.consolidationSessions}</div>
              <div className="text-sm text-gray-600">Sessões</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {systemStatus.isHealthy ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {systemStatus.isHealthy ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="text-sm text-gray-600">Sistema</div>
            </div>
          </div>

          {stats.lastConsolidation && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Última consolidação: {formatDistanceToNow(new Date(stats.lastConsolidation), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de Consolidação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Agendamentos Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getScheduleIcon(schedule.type)}
                <div>
                  <div className="font-medium capitalize">{schedule.type}</div>
                  <div className="text-sm text-gray-600">
                    {schedule.enabled ? (
                      <>Próxima execução: {formatDistanceToNow(new Date(schedule.nextRun), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}</>
                    ) : (
                      'Desabilitado'
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getScheduleColor(schedule.enabled, schedule.nextRun)}>
                  {schedule.enabled ? 'Ativo' : 'Inativo'}
                </Badge>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={() => toggleSchedule(schedule.type)}
                    disabled={isRunning}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runConsolidation(schedule.type)}
                    disabled={isRunning}
                  >
                    <PlayCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consolidação Manual */}
      <Card>
        <CardHeader>
          <CardTitle>Controle Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isRunning && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Activity className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-blue-800">
                  {currentOperation || 'Processando...'}
                </span>
              </div>
            )}
            
            <Button
              onClick={forceConsolidation}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Consolidando...' : 'Executar Consolidação Completa'}
            </Button>
            
            <div className="text-sm text-gray-600 text-center">
              Executa uma consolidação completa imediatamente
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próxima Execução */}
      {systemStatus.nextExecution && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Próxima execução automática</div>
              <div className="font-medium">
                {formatDistanceToNow(new Date(systemStatus.nextExecution), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </div>
              <Badge variant="outline" className="mt-2">
                {systemStatus.nextExecutionType}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidationPanel;
