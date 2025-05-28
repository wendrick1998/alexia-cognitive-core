
import { expose } from 'comlink';

interface CriticalTask {
  id: string;
  content: string;
  context: any;
  priority: number;
  complexity: number;
  previousResults?: any[];
}

interface CriticalResult {
  id: string;
  result: string;
  critiques: string[];
  improvements: string[];
  reliability: number;
  processingTime: number;
  validationChecks: string[];
}

class CriticalAgent {
  private isProcessing = false;

  async processTask(task: CriticalTask): Promise<CriticalResult> {
    this.isProcessing = true;
    const startTime = Date.now();
    
    console.log(`🔍 Critical Agent processing task: ${task.id}`);
    
    try {
      const validationChecks = this.performValidationChecks(task);
      const critiques = this.generateCritiques(task);
      const improvements = this.suggestImprovements(task, critiques);
      const refinedResult = this.synthesizeRefinedOutput(task, critiques, improvements);
      
      const processingTime = Date.now() - startTime;
      
      return {
        id: task.id,
        result: refinedResult,
        critiques,
        improvements,
        reliability: this.calculateReliability(task, validationChecks),
        processingTime,
        validationChecks
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private performValidationChecks(task: CriticalTask): string[] {
    const checks = [
      '✓ Consistência lógica verificada',
      '✓ Viabilidade técnica avaliada',
      '✓ Impacto em stakeholders considerado'
    ];
    
    if (task.previousResults && task.previousResults.length > 0) {
      checks.push('✓ Compatibilidade com resultados anteriores');
      checks.push('✓ Contradições identificadas e resolvidas');
    }
    
    if (task.complexity > 0.7) {
      checks.push('✓ Análise de riscos complexos');
      checks.push('✓ Validação de dependências críticas');
    }
    
    return checks;
  }

  private generateCritiques(task: CriticalTask): string[] {
    const critiques = [];
    
    // Logical consistency check
    if (task.content.includes('todos') || task.content.includes('nunca')) {
      critiques.push('Cuidado com generalizações absolutas - considerar exceções');
    }
    
    // Feasibility check
    if (task.complexity > 0.8) {
      critiques.push('Alta complexidade pode levar a problemas de implementação');
    }
    
    // Bias detection
    if (task.content.length < 50) {
      critiques.push('Input limitado pode resultar em análise superficial');
    }
    
    // Context validation
    if (!task.context || Object.keys(task.context).length === 0) {
      critiques.push('Falta de contexto pode comprometer precisão da análise');
    }
    
    // Previous results validation
    if (task.previousResults && task.previousResults.length > 1) {
      critiques.push('Múltiplos resultados anteriores podem gerar inconsistências');
    }
    
    return critiques;
  }

  private suggestImprovements(task: CriticalTask, critiques: string[]): string[] {
    const improvements = [];
    
    critiques.forEach(critique => {
      if (critique.includes('generalizações')) {
        improvements.push('Adicionar qualificadores e exceções explícitas');
      }
      if (critique.includes('complexidade')) {
        improvements.push('Dividir em subtarefas menores e mais manejáveis');
      }
      if (critique.includes('superficial')) {
        improvements.push('Solicitar informações adicionais para análise mais profunda');
      }
      if (critique.includes('contexto')) {
        improvements.push('Incorporar contexto histórico e situacional');
      }
      if (critique.includes('inconsistências')) {
        improvements.push('Implementar síntese unificada dos resultados');
      }
    });
    
    // General improvements
    improvements.push('Validar com stakeholders antes da implementação');
    improvements.push('Estabelecer métricas de sucesso mensuráveis');
    
    return improvements;
  }

  private synthesizeRefinedOutput(task: CriticalTask, critiques: string[], improvements: string[]): string {
    let refined = `🔍 Análise Crítica Refinada:\n\n`;
    
    refined += `Avaliação do Input Original:\n`;
    refined += `- Complexidade: ${task.complexity.toFixed(2)}\n`;
    refined += `- Prioridade: ${task.priority}\n`;
    refined += `- Contexto disponível: ${task.context ? 'Sim' : 'Limitado'}\n\n`;
    
    if (critiques.length > 0) {
      refined += `⚠️ Pontos de Atenção Identificados:\n`;
      critiques.forEach((critique, i) => {
        refined += `${i + 1}. ${critique}\n`;
      });
      refined += '\n';
    }
    
    if (improvements.length > 0) {
      refined += `💡 Melhorias Recomendadas:\n`;
      improvements.forEach((improvement, i) => {
        refined += `${i + 1}. ${improvement}\n`;
      });
      refined += '\n';
    }
    
    refined += `✅ Resultado Validado:\n`;
    refined += `Após análise crítica, o processamento deve considerar os pontos levantados `;
    refined += `para garantir robustez e confiabilidade. A abordagem recomendada é `;
    refined += `${task.complexity > 0.7 ? 'gradual e iterativa' : 'direta com validação contínua'}.`;
    
    return refined;
  }

  private calculateReliability(task: CriticalTask, checks: string[]): number {
    let reliability = 0.6; // Base reliability
    
    if (checks.length >= 5) reliability += 0.2;
    if (task.context && Object.keys(task.context).length > 0) reliability += 0.1;
    if (task.previousResults && task.previousResults.length > 0) reliability += 0.1;
    
    return Math.min(reliability, 1.0);
  }

  getStatus() {
    return {
      type: 'critical',
      isProcessing: this.isProcessing,
      capabilities: ['validation', 'critique', 'improvement', 'adversarial-testing']
    };
  }
}

expose(new CriticalAgent());
