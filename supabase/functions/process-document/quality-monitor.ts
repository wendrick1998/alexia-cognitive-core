
// Quality monitoring system for PDF extraction

export interface QualityMetrics {
  extractionQuality: number;
  textLength: number;
  wordCount: number;
  avgWordLength: number;
  characterDiversity: number;
  specialCharRatio: number;
  readabilityScore: number;
}

export interface ProcessingQualityReport {
  documentId: string;
  metrics: QualityMetrics;
  warnings: string[];
  recommendations: string[];
  overallScore: number;
  timestamp: string;
}

export class QualityMonitor {
  
  static analyzeTextQuality(text: string): QualityMetrics {
    if (!text || text.length === 0) {
      return this.getEmptyMetrics();
    }
    
    const cleanText = text.trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const chars = cleanText.split('');
    
    // Calculate metrics
    const textLength = cleanText.length;
    const wordCount = words.length;
    const avgWordLength = wordCount > 0 ? words.reduce((sum, word) => sum + word.length, 0) / wordCount : 0;
    
    // Character diversity (unique characters / total characters)
    const uniqueChars = new Set(chars.map(c => c.toLowerCase())).size;
    const characterDiversity = textLength > 0 ? (uniqueChars / textLength) * 100 : 0;
    
    // Special character ratio
    const specialChars = chars.filter(c => /[^\w\s.,!?;:'"()-]/.test(c)).length;
    const specialCharRatio = textLength > 0 ? (specialChars / textLength) * 100 : 0;
    
    // Simple readability score based on word and sentence structure
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    const readabilityScore = this.calculateReadabilityScore(avgWordLength, avgWordsPerSentence);
    
    // Overall extraction quality
    const extractionQuality = this.calculateExtractionQuality({
      textLength,
      wordCount,
      avgWordLength,
      characterDiversity,
      specialCharRatio,
      readabilityScore
    });
    
    return {
      extractionQuality,
      textLength,
      wordCount,
      avgWordLength,
      characterDiversity,
      specialCharRatio,
      readabilityScore
    };
  }
  
  static generateQualityReport(documentId: string, text: string, method: string): ProcessingQualityReport {
    const metrics = this.analyzeTextQuality(text);
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Generate warnings based on metrics
    if (metrics.extractionQuality < 30) {
      warnings.push('Very low extraction quality detected');
      recommendations.push('Consider using a different PDF or converting to text format');
    } else if (metrics.extractionQuality < 60) {
      warnings.push('Low extraction quality');
      recommendations.push('Review extracted text for accuracy');
    }
    
    if (metrics.specialCharRatio > 20) {
      warnings.push('High special character ratio - may indicate extraction errors');
      recommendations.push('Check for encoding issues or corrupted text');
    }
    
    if (metrics.wordCount < 50) {
      warnings.push('Very short text extracted');
      recommendations.push('Verify PDF contains readable text content');
    }
    
    if (metrics.avgWordLength < 2 || metrics.avgWordLength > 15) {
      warnings.push('Unusual average word length detected');
      recommendations.push('Text may contain extraction artifacts');
    }
    
    if (metrics.characterDiversity < 5) {
      warnings.push('Low character diversity - may indicate repetitive or corrupted text');
    }
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(metrics, warnings.length);
    
    return {
      documentId,
      metrics,
      warnings,
      recommendations,
      overallScore,
      timestamp: new Date().toISOString()
    };
  }
  
  private static getEmptyMetrics(): QualityMetrics {
    return {
      extractionQuality: 0,
      textLength: 0,
      wordCount: 0,
      avgWordLength: 0,
      characterDiversity: 0,
      specialCharRatio: 0,
      readabilityScore: 0
    };
  }
  
  private static calculateReadabilityScore(avgWordLength: number, avgWordsPerSentence: number): number {
    // Simplified readability score (0-100)
    // Optimal: 4-6 char words, 15-20 words per sentence
    const wordLengthScore = Math.max(0, 100 - Math.abs(avgWordLength - 5) * 10);
    const sentenceLengthScore = Math.max(0, 100 - Math.abs(avgWordsPerSentence - 17.5) * 2);
    
    return (wordLengthScore + sentenceLengthScore) / 2;
  }
  
  private static calculateExtractionQuality(metrics: Partial<QualityMetrics>): number {
    const {
      textLength = 0,
      wordCount = 0,
      avgWordLength = 0,
      characterDiversity = 0,
      specialCharRatio = 0,
      readabilityScore = 0
    } = metrics;
    
    // Weight different factors
    let score = 0;
    
    // Text length factor (0-25 points)
    if (textLength > 1000) score += 25;
    else if (textLength > 500) score += 20;
    else if (textLength > 100) score += 15;
    else if (textLength > 50) score += 10;
    else if (textLength > 10) score += 5;
    
    // Word count factor (0-20 points)
    if (wordCount > 200) score += 20;
    else if (wordCount > 100) score += 15;
    else if (wordCount > 50) score += 10;
    else if (wordCount > 20) score += 5;
    
    // Average word length factor (0-15 points)
    if (avgWordLength >= 3 && avgWordLength <= 8) score += 15;
    else if (avgWordLength >= 2 && avgWordLength <= 12) score += 10;
    else if (avgWordLength >= 1 && avgWordLength <= 15) score += 5;
    
    // Character diversity factor (0-15 points)
    if (characterDiversity >= 8) score += 15;
    else if (characterDiversity >= 6) score += 10;
    else if (characterDiversity >= 4) score += 5;
    
    // Special character penalty (0 to -15 points)
    if (specialCharRatio < 5) score += 10;
    else if (specialCharRatio < 10) score += 5;
    else if (specialCharRatio > 25) score -= 15;
    else if (specialCharRatio > 15) score -= 10;
    
    // Readability factor (0-15 points)
    score += (readabilityScore / 100) * 15;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private static calculateOverallScore(metrics: QualityMetrics, warningCount: number): number {
    let score = metrics.extractionQuality;
    
    // Penalty for warnings
    score -= warningCount * 5;
    
    // Bonus for good metrics
    if (metrics.readabilityScore > 80) score += 5;
    if (metrics.characterDiversity > 10) score += 5;
    if (metrics.wordCount > 500) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  static logQualityReport(report: ProcessingQualityReport): void {
    console.log('\n📊 QUALITY ANALYSIS REPORT');
    console.log('═══════════════════════════════════════');
    console.log(`Document ID: ${report.documentId}`);
    console.log(`Overall Score: ${report.overallScore.toFixed(1)}/100`);
    console.log(`Extraction Quality: ${report.metrics.extractionQuality.toFixed(1)}%`);
    console.log(`Text Length: ${report.metrics.textLength} characters`);
    console.log(`Word Count: ${report.metrics.wordCount} words`);
    console.log(`Avg Word Length: ${report.metrics.avgWordLength.toFixed(1)} chars`);
    console.log(`Character Diversity: ${report.metrics.characterDiversity.toFixed(1)}%`);
    console.log(`Special Char Ratio: ${report.metrics.specialCharRatio.toFixed(1)}%`);
    console.log(`Readability Score: ${report.metrics.readabilityScore.toFixed(1)}/100`);
    
    if (report.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      report.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    console.log('═══════════════════════════════════════\n');
  }
}
