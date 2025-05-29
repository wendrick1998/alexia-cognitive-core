
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  className?: string;
}

const SyntaxHighlighter = ({ code, language = 'javascript', className = '' }: SyntaxHighlighterProps) => {
  const [copied, setCopied] = useState(false);
  const { isOled, isDark } = useDarkMode();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Enhanced syntax highlighting with proper dark mode colors
  const highlightCode = (text: string, lang: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      let highlightedLine = line;
      
      // Keywords (purple/blue)
      highlightedLine = highlightedLine.replace(
        /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|async|await|try|catch|throw|new|this|super|extends|implements|interface|type|enum)\b/g,
        `<span class="text-purple-400"">$1</span>`
      );
      
      // Strings (green)
      highlightedLine = highlightedLine.replace(
        /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        `<span class="text-green-400">$1$2$1</span>`
      );
      
      // Comments (gray)
      highlightedLine = highlightedLine.replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/g,
        `<span class="text-gray-500 italic">$1</span>`
      );
      
      // Numbers (orange)
      highlightedLine = highlightedLine.replace(
        /\b(\d+\.?\d*)\b/g,
        `<span class="text-orange-400">$1</span>`
      );
      
      // Functions (cyan)
      highlightedLine = highlightedLine.replace(
        /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
        `<span class="text-cyan-400">$1</span>`
      );

      return (
        <div key={index} className="table-row">
          <span className="table-cell text-right pr-4 text-white/30 select-none user-select-none w-8 text-xs">
            {index + 1}
          </span>
          <span 
            className="table-cell text-white/90 font-mono text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }}
          />
        </div>
      );
    });
  };

  const getBackgroundClass = () => {
    if (isOled) return 'bg-black';
    if (isDark) return 'bg-[#0D1117]';
    return 'bg-gray-50';
  };

  const getHeaderClass = () => {
    if (isOled) return 'bg-black border-white/10';
    if (isDark) return 'bg-[#161B22] border-white/10';
    return 'bg-gray-100 border-gray-200';
  };

  const getBorderClass = () => {
    if (isOled || isDark) return 'border-white/10';
    return 'border-gray-200';
  };

  return (
    <div className={`relative group ${className}`}>
      <div className={`${getBackgroundClass()} border ${getBorderClass()} rounded-xl overflow-hidden shadow-lg`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2 ${getHeaderClass()} border-b ${getBorderClass()}`}>
          <span className={`text-xs font-medium ${isOled || isDark ? 'text-white/60' : 'text-gray-600'}`}>
            {language}
          </span>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 ${
              isOled || isDark 
                ? 'text-white/60 hover:text-white hover:bg-white/10' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
        
        {/* Code */}
        <div className="p-4 overflow-x-auto">
          <div className="table w-full">
            {highlightCode(code, language)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyntaxHighlighter;
