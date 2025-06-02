
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMemoryActivation } from '@/hooks/useMemoryActivation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ConsolidationSchedule {
  id: string;
  type: 'hourly' | 'daily' | 'weekly';
  lastRun: string | null;
  nextRun: string;
  enabled: boolean;
  processingNodes: number;
}

export function useConsolidationScheduler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { runMemoryConsolidation, stats } = useMemoryActivation();
  
  const [schedules, setSchedules] = useState<ConsolidationSchedule[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Configurar schedules padrão
  const initializeSchedules = useCallback(() => {
    const defaultSchedules: ConsolidationSchedule[] = [
      {
        id: 'hourly',
        type: 'hourly',
        lastRun: null,
        nextRun: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // próxima hora
        enabled: true,
        processingNodes: 0
      },
      {
        id: 'daily', 
        type: 'daily',
        lastRun: null,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // próximo dia
        enabled: true,
        processingNodes: 0
      },
      {
        id: 'weekly',
        type: 'weekly', 
        lastRun: null,
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // próxima semana
        enabled: false, // desabilitado por padrão
        processingNodes: 0
      }
    ];
    
    setSchedules(defaultSchedules);
  }, []);

  // Executar consolidação manual
  const runConsolidation = useCallback(async (type: 'hourly' | 'daily' | 'weekly') => {
    if (!user || isRunning) return;

    setIsRunning(true);
    setCurrentOperation(`Consolidação ${type}`);

    try {
      console.log(`🔄 Iniciando consolidação ${type}...`);
      
      // Executar consolidação baseada no tipo
      await runMemoryConsolidation();

      // Atualizar schedule após execução
      setSchedules(prev => prev.map(schedule => 
        schedule.type === type 
          ? {
              ...schedule,
              lastRun: new Date().toISOString(),
              nextRun: calculateNextRun(type),
              processingNodes: stats.totalMemories
            }
          : schedule
      ));

      toast({
        title: "Consolidação Concluída",
        description: `Consolidação ${type} executada com sucesso`,
      });

    } catch (error) {
      console.error(`❌ Erro na consolidação ${type}:`, error);
      toast({
        title: "Erro na Consolidação",
        description: `Falha na consolidação ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setCurrentOperation(null);
    }
  }, [user, isRunning, runMemoryConsolidation, stats.totalMemories, toast]);

  // Calcular próxima execução
  const calculateNextRun = (type: 'hourly' | 'daily' | 'weekly'): string => {
    const now = new Date();
    switch (type) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return now.toISOString();
    }
  };

  // Verificar execuções pendentes
  const checkPendingConsolidations = useCallback(async () => {
    if (!user || isRunning) return;

    const now = new Date();
    
    for (const schedule of schedules) {
      if (schedule.enabled && new Date(schedule.nextRun) <= now) {
        console.log(`⏰ Executando consolidação automática: ${schedule.type}`);
        await runConsolidation(schedule.type);
        break; // Executar apenas uma por vez
      }
    }
  }, [user, isRunning, schedules, runConsolidation]);

  // Toggle de schedule
  const toggleSchedule = useCallback((type: 'hourly' | 'daily' | 'weekly') => {
    setSchedules(prev => prev.map(schedule =>
      schedule.type === type
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ));
  }, []);

  // Executar consolidação forçada
  const forceConsolidation = useCallback(async () => {
    await runConsolidation('daily');
  }, [runConsolidation]);

  // Status do sistema
  const getSystemStatus = useCallback(() => {
    const enabledSchedules = schedules.filter(s => s.enabled).length;
    const nextExecution = schedules
      .filter(s => s.enabled)
      .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())[0];

    return {
      isHealthy: enabledSchedules > 0,
      enabledSchedules,
      totalSchedules: schedules.length,
      nextExecution: nextExecution?.nextRun || null,
      nextExecutionType: nextExecution?.type || null,
      isRunning,
      currentOperation
    };
  }, [schedules, isRunning, currentOperation]);

  // Inicialização e intervals
  useEffect(() => {
    if (user) {
      initializeSchedules();
    }
  }, [user, initializeSchedules]);

  // Verificar execuções pendentes a cada minuto
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkPendingConsolidations, 60 * 1000); // cada minuto
    return () => clearInterval(interval);
  }, [user, checkPendingConsolidations]);

  return {
    schedules,
    isRunning,
    currentOperation,
    runConsolidation,
    toggleSchedule,
    forceConsolidation,
    getSystemStatus
  };
}
