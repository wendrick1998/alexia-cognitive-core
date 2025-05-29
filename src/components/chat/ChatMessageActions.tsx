
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  RotateCcw, 
  Edit3, 
  Pin, 
  Smile,
  MoreHorizontal,
  Check
} from 'lucide-react';
import { Message } from '@/hooks/useConversations';

interface ChatMessageActionsProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onPin?: () => void;
  onReaction?: (emoji: string) => void;
}

const ChatMessageActions = ({
  message,
  onRegenerate,
  onEdit,
  onCopy,
  onPin,
  onReaction
}: ChatMessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else {
      await navigator.clipboard.writeText(message.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reactions = ['👍', '👎', '❤️', '😊', '🤔', '🔥'];

  return (
    <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="flex items-center space-x-1 bg-[#1A1A1A] border border-white/20 rounded-lg p-1 shadow-xl">
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>

        {onEdit && (
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        )}

        {!isUser && onRegenerate && (
          <Button
            onClick={onRegenerate}
            variant="ghost"
            size="sm"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}

        <div className="relative">
          <Button
            onClick={() => setShowReactions(!showReactions)}
            variant="ghost"
            size="sm"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
          >
            <Smile className="w-3 h-3" />
          </Button>

          {showReactions && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#1A1A1A] border border-white/20 rounded-lg p-2 flex space-x-1">
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReaction?.(emoji);
                    setShowReactions(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {onPin && (
          <Button
            onClick={onPin}
            variant="ghost"
            size="sm"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
          >
            <Pin className="w-3 h-3" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
        >
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default ChatMessageActions;
