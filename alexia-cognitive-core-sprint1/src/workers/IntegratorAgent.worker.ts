
import { expose } from 'comlink';

interface IntegratorTask {
  id: string;
  content: string;
  context: any;
  priority: number;
  complexity: number;
  agentResults: any[];
}

interface IntegratorResult {
  id: string;
  result: string;
  synthesis: string;
  confidence: number;
  processingTime: number;
  connections: number;
  coherenceScore: number;
}

class IntegratorAgent {
  private isProcessing = false;

  async processTask(task: IntegratorTask): Promise<IntegratorResult> {
    this.isProcessing = true;
    const startTime = Date.now();
    
    console.log(`🔄 Integrator Agent processing task: ${task.id}`);
    
    try {
      const connections = this.findConnections(task.agentResults);
      const synthesis = this.performSynthesis(task, task.agentResults);
      const coherentResult = this.ensureCoherence(task, synthesis);
      const coherenceScore = this.calculateCoherence(coherentResult);
      
      const processingTime = Date.now() - startTime;
      
      return {
        id: task.id,
        result: coherentResult,
        synthesis,
        confidence: this.calculateConfidence(task, coherentResult),
        processingTime,
        connections,
        coherenceScore
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private findConnections(results: any[]): number {
    let connections = 0;
    
    if (!results || results.length < 2) return connections;
    
    // Find common themes
    const allContent = results.map(r => r.result || '').join(' ').toLowerCase();
    const commonWords = this.extractCommonConcepts(allContent);
    connections += commonWords.length;
    
    // Find complementary insights
    const insights = results.flatMap(r => r.insights || []);
    const uniqueInsights = new Set(insights);
    connections += Math.floor(uniqueInsights.size / 2);
    
    // Find contradictions that need resolution
    const contradictions = this.findContradictions(results);
    connections += contradictions;
    
    return connections;
  }

  private extractCommonConcepts(text: string): string[] {
    const words = text.split(/\s+/);
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 4) { // Filter short words
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });
    
    return Array.from(wordCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([word, _]) => word)
      .slice(0, 5);
  }

  private findContradictions(results: any[]): number {
    let contradictions = 0;
    
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const result1 = (results[i].result || '').toLowerCase();
        const result2 = (results[j].result || '').toLowerCase();
        
        // Simple contradiction detection
        if ((result1.includes('não') && result2.includes('sim')) ||
            (result1.includes('impossible') && result2.includes('possible')) ||
            (result1.includes('simples') && result2.includes('complexo'))) {
          contradictions++;
        }
      }
    }
    
    return contradictions;
  }

  private performSynthesis(task: IntegratorTask, results: any[]): string {
    let synthesis = `🔄 Síntese Integrada:\n\n`;
    
    if (!results || results.length === 0) {
      synthesis += `Nenhum resultado de agentes para sintetizar.\n`;
      return synthesis;
    }
    
    synthesis += `Integração de ${results.length} perspectivas especializadas:\n\n`;
    
    // Analytical perspective
    const analyticalResult = results.find(r => r.type === 'analytical' || (r.insights && r.reasoning));
    if (analyticalResult) {
      synthesis += `📊 Perspectiva Analítica:\n`;
      synthesis += `${this.extractKey(analyticalResult.result, 200)}\n\n`;
    }
    
    // Creative perspective
    const creativeResult = results.find(r => r.type === 'creative' || (r.alternatives && r.novelty));
    if (creativeResult) {
      synthesis += `🎨 Perspectiva Criativa:\n`;
      synthesis += `${this.extractKey(creativeResult.result, 200)}\n\n`;
    }
    
    // Critical perspective
    const criticalResult = results.find(r => r.type === 'critical' || (r.critiques && r.improvements));
    if (criticalResult) {
      synthesis += `🔍 Perspectiva Crítica:\n`;
      synthesis += `${this.extractKey(criticalResult.result, 200)}\n\n`;
    }
    
    // Integration insights
    synthesis += `🔗 Insights Integrados:\n`;
    const allInsights = results.flatMap(r => r.insights || []);
    const uniqueInsights = [...new Set(allInsights)];
    uniqueInsights.slice(0, 5).forEach((insight, i) => {
      synthesis += `${i + 1}. ${insight}\n`;
    });
    
    return synthesis;
  }

  private extractKey(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    
    // Find a good breaking point
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > maxLength * 0.8 ? 
      truncated.substring(0, lastSpace) + '...' : 
      truncated + '...';
  }

  private ensureCoherence(task: IntegratorTask, synthesis: string): string {
    let coherent = `🎯 Resposta Integrada e Coerente:\n\n`;
    
    coherent += `Para a solicitação: "${this.extractKey(task.content, 100)}"\n\n`;
    
    coherent += `Análise Multidimensional:\n`;
    coherent += `${synthesis}\n\n`;
    
    coherent += `Recomendação Unificada:\n`;
    coherent += `Com base na análise integrada de múltiplas perspectivas especializadas, `;
    coherent += `a abordagem recomendada combina:\n`;
    coherent += `- Rigor analítico para fundamentação sólida\n`;
    coherent += `- Criatividade para soluções inovadoras\n`;
    coherent += `- Validação crítica para garantir qualidade\n`;
    coherent += `- Integração holística para máxima efetividade\n\n`;
    
    coherent += `Esta síntese representa o melhor dos insights especializados, `;
    coherent += `otimizada para ${task.complexity > 0.7 ? 'máxima profundidade' : 'clareza e praticidade'}.`;
    
    return coherent;
  }

  private calculateCoherence(result: string): number {
    let coherence = 0.5; // Base coherence
    
    // Check for structured sections
    if (result.includes('Perspectiva') && result.includes('Recomendação')) coherence += 0.2;
    
    // Check for logical flow
    if (result.includes('Com base') || result.includes('Portanto')) coherence += 0.1;
    
    // Check for integration indicators
    if (result.includes('combina') || result.includes('integra')) coherence += 0.2;
    
    return Math.min(coherence, 1.0);
  }

  private calculateConfidence(task: IntegratorTask, result: string): number {
    let confidence = 0.6; // Base confidence
    
    if (task.agentResults && task.agentResults.length >= 3) confidence += 0.2;
    if (result.length > 800) confidence += 0.1; // More comprehensive = higher confidence
    if (result.includes('Recomendação') && result.includes('fundamentação')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  getStatus() {
    return {
      type: 'integrator',
      isProcessing: this.isProcessing,
      capabilities: ['synthesis', 'integration', 'coherence', 'unification']
    };
  }
}

expose(new IntegratorAgent());
