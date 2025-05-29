
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  className?: string;
}

const SyntaxHighlighter = ({ code, language = 'javascript', className = '' }: SyntaxHighlighterProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Função simples de syntax highlighting (pode ser expandida com highlight.js)
  const highlightCode = (text: string, lang: string) => {
    // Por enquanto, retorna o código sem highlighting
    // Em uma implementação completa, usaríamos highlight.js ou similar
    return text;
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden">
        {/* Header do code block */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161B22] border-b border-white/10">
          <span className="text-white/60 text-xs font-medium">{language}</span>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
        
        {/* Código */}
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm text-white/90 font-mono leading-relaxed">
            <code>{highlightCode(code, language)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SyntaxHighlighter;
