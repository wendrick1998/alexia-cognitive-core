
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';

interface MessageEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

const MessageEditor = ({ initialContent, onSave, onCancel }: MessageEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, []);

  const handleSave = () => {
    if (content.trim() !== initialContent.trim()) {
      onSave(content.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[100px] bg-[#1A1A1A] border-white/20 focus:border-blue-400 text-white resize-none"
        placeholder="Edite sua mensagem..."
      />
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">
          ⌘ + Enter para salvar • Esc para cancelar
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="border-white/20 text-white/70 hover:bg-white/10"
          >
            <X className="w-3 h-3 mr-1" />
            Cancelar
          </Button>
          
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="w-3 h-3 mr-1" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;
