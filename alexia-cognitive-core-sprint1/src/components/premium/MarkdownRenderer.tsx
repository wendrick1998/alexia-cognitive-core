
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  // Processamento básico de markdown para melhor tipografia
  const processMarkdown = (text: string) => {
    // Substituir **texto** por <strong>texto</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Substituir *texto* por <em>texto</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Substituir `código` por <code>código</code>
    text = text.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Processar listas simples
    text = text.replace(/^\s*[-*+]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
    
    // Agrupar itens de lista consecutivos
    text = text.replace(/(<li[^>]*>.*<\/li>\s*)+/g, '<ul class="space-y-1 my-2">$&</ul>');
    
    // Processar quebras de linha
    text = text.replace(/\n\n/g, '</p><p class="mb-3">');
    text = text.replace(/\n/g, '<br />');
    
    return `<p class="mb-3">${text}</p>`;
  };

  return (
    <div 
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
