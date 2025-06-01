
import { expose } from 'comlink';

interface CreativeTask {
  id: string;
  content: string;
  context: any;
  priority: number;
  complexity: number;
}

interface CreativeResult {
  id: string;
  result: string;
  alternatives: string[];
  novelty: number;
  processingTime: number;
  inspiration: string[];
}

class CreativeAgent {
  private isProcessing = false;

  async processTask(task: CreativeTask): Promise<CreativeResult> {
    this.isProcessing = true;
    const startTime = Date.now();
    
    console.log(`🎨 Creative Agent processing task: ${task.id}`);
    
    try {
      const inspiration = this.generateInspiration(task);
      const creativeResult = this.performLateralThinking(task, inspiration);
      const alternatives = this.generateAlternatives(task, creativeResult);
      
      const processingTime = Date.now() - startTime;
      
      return {
        id: task.id,
        result: creativeResult,
        alternatives,
        novelty: this.calculateNovelty(creativeResult),
        processingTime,
        inspiration
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private generateInspiration(task: CreativeTask): string[] {
    const inspirationSources = [
      'Biomimética: Soluções encontradas na natureza',
      'Analogias: Transferência de conceitos entre domínios',
      'Inversão: Questionamento de premissas básicas',
      'Combinação: Fusão de elementos aparentemente díspares',
      'Simplificação radical: Redução à essência'
    ];
    
    // Select inspiration based on task complexity
    const count = Math.ceil(task.complexity * inspirationSources.length);
    return inspirationSources.slice(0, count);
  }

  private performLateralThinking(task: CreativeTask, inspiration: string[]): string {
    let creative = `💡 Solução Criativa:\n\n`;
    
    creative += `Abordagem Inovadora:\n`;
    creative += `Inspirado em: ${inspiration[0]}\n\n`;
    
    if (task.content.toLowerCase().includes('problema') || task.content.toLowerCase().includes('challenge')) {
      creative += this.generateProblemSolution(task);
    } else if (task.content.toLowerCase().includes('design') || task.content.toLowerCase().includes('interface')) {
      creative += this.generateDesignSolution(task);
    } else {
      creative += this.generateGeneralSolution(task);
    }
    
    creative += `\nPerspectivas Alternativas:\n`;
    creative += `- Visão do usuário: Como isso impacta a experiência?\n`;
    creative += `- Visão sistêmica: Como se integra ao ecossistema?\n`;
    creative += `- Visão futurista: Como evoluirá ao longo do tempo?\n`;
    
    return creative;
  }

  private generateProblemSolution(task: CreativeTask): string {
    return `Solução Inovadora:
1. Redefinir o problema: Talvez não seja o problema que pensamos
2. Abordagem indireta: Resolver problemas adjacentes primeiro
3. Gamificação: Transformar o desafio em experiência engajante
4. Crowdsourcing: Aproveitar inteligência coletiva
5. Tecnologia emergente: Usar ferramentas de próxima geração`;
  }

  private generateDesignSolution(task: CreativeTask): string {
    return `Design Revolucionário:
1. Interface adaptativa: Evolui com o comportamento do usuário
2. Minimalismo inteligente: Menos é mais, mas contextualmente
3. Feedback multissensorial: Além do visual e auditivo
4. Personalização profunda: Cada usuário tem experiência única
5. Design emergente: A interface se auto-organiza`;
  }

  private generateGeneralSolution(task: CreativeTask): string {
    return `Abordagem Criativa:
1. Pensamento divergente: Explorar múltiplas direções
2. Síntese inesperada: Combinar elementos não óbvios
3. Prototipagem rápida: Testar ideias rapidamente
4. Feedback iterativo: Refinar através de ciclos curtos
5. Experimentação controlada: Validar hipóteses criativas`;
  }

  private generateAlternatives(task: CreativeTask, mainResult: string): string[] {
    const alternatives = [
      'Versão minimalista: Reduzir à essência funcional',
      'Versão maximalista: Explorar todas as possibilidades',
      'Versão híbrida: Combinar melhores elementos',
      'Versão disruptiva: Quebrar paradigmas existentes'
    ];
    
    // Add task-specific alternatives
    if (task.complexity > 0.7) {
      alternatives.push('Versão modular: Implementar em fases');
    }
    
    return alternatives.slice(0, 3);
  }

  private calculateNovelty(result: string): number {
    let novelty = 0.5; // Base novelty
    
    if (result.includes('inovador') || result.includes('revolucionário')) novelty += 0.2;
    if (result.includes('emergente') || result.includes('adaptativo')) novelty += 0.2;
    if (result.includes('disruptiva') || result.includes('paradigma')) novelty += 0.1;
    
    return Math.min(novelty, 1.0);
  }

  getStatus() {
    return {
      type: 'creative',
      isProcessing: this.isProcessing,
      capabilities: ['lateral-thinking', 'innovation', 'design-thinking', 'brainstorming']
    };
  }
}

expose(new CreativeAgent());
