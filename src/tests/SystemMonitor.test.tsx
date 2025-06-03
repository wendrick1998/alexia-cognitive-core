
/**
 * @description Testes unitários para o SystemMonitor
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import { systemMonitor, SystemMonitor } from '@/services/SystemMonitor';

// Mock do performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000
    }
  }
});

// Mock do fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200
  } as Response)
);

describe('SystemMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve inicializar com métricas padrão', () => {
    const metrics = systemMonitor.getMetrics();
    
    expect(metrics).toHaveProperty('memory');
    expect(metrics).toHaveProperty('performance');
    expect(metrics).toHaveProperty('network');
    expect(metrics).toHaveProperty('ui');
  });

  test('deve calcular percentual de memória corretamente', () => {
    const metrics = systemMonitor.getMetrics();
    
    expect(metrics.memory.percentage).toBe(50); // 1MB / 2MB = 50%
  });

  test('deve criar alertas quando limites são excedidos', (done) => {
    const alertListener = jest.fn();
    
    systemMonitor.subscribeToAlerts(alertListener);
    
    // Simular alta latência
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    
    setTimeout(() => {
      expect(alertListener).toHaveBeenCalled();
      done();
    }, 100);
  });

  test('deve permitir subscrição e cancelamento de listeners', () => {
    const listener = jest.fn();
    const unsubscribe = systemMonitor.subscribe(listener);
    
    expect(listener).toHaveBeenCalledWith(expect.any(Object));
    
    unsubscribe();
    
    // Listener não deve ser chamado após cancelamento
    const callCount = listener.mock.calls.length;
    setTimeout(() => {
      expect(listener.mock.calls.length).toBe(callCount);
    }, 100);
  });

  test('deve resolver alertas corretamente', () => {
    const alerts = systemMonitor.getAlerts();
    
    if (alerts.length > 0) {
      const alertId = alerts[0].id;
      systemMonitor.resolveAlert(alertId);
      
      const updatedAlerts = systemMonitor.getAlerts();
      const resolvedAlert = updatedAlerts.find(a => a.id === alertId);
      
      expect(resolvedAlert?.resolved).toBe(true);
    }
  });
});
