
import React, { useState } from 'react';
import { Conversation } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputAreaProps {
  processing: boolean;
  onSendMessage: (message: string) => void;
  currentConversation: Conversation | null;
}

const ChatInputArea = ({
  processing,
  onSendMessage,
  currentConversation
}: ChatInputAreaProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || processing) return;
    
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/10 p-4 bg-black/50 backdrop-blur-xl">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            currentConversation 
              ? "Digite sua mensagem..." 
              : "Inicie uma nova conversa..."
          }
          disabled={processing}
          className="flex-1 resize-none min-h-[40px] max-h-[120px] bg-white/10 border-white/20 text-white placeholder-white/50"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || processing}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4"
        >
          {processing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInputArea;
