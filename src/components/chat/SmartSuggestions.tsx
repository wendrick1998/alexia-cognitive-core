
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface SmartSuggestionsProps {
  isVisible: boolean;
  onSuggestionSelect: (suggestion: string) => void;
}

const SUGGESTIONS = [
  'Como posso ajudar?',
  'Analise este documento',
  'Crie um resumo'
];

const SmartSuggestions = ({ isVisible, onSuggestionSelect }: SmartSuggestionsProps) => {
  const { hapticFeedback } = useMobileOptimization();

  if (!isVisible) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex gap-2 text-xs">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onTouchEnd={() => {
              hapticFeedback('light');
              onSuggestionSelect(suggestion);
            }}
            className={cn(
              "px-3 py-1 rounded-full bg-white/10 text-white/70",
              "touch-manipulation whitespace-nowrap",
              "hover:bg-white/20 hover:text-white transition-colors"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestions;
