
import ResponseSource from '../ResponseSource';

interface ChatMessageExtrasProps {
  message: any;
}

const ChatMessageExtras = ({ message }: ChatMessageExtrasProps) => {
  if (message.role !== 'assistant' || !message.metadata) {
    return null;
  }
  
  return (
    <ResponseSource 
      fromCache={message.metadata.fromCache}
      usedFallback={message.metadata.usedFallback}
      originalModel={message.metadata.originalModel}
      currentModel={message.metadata.currentModel}
      responseTime={message.metadata.responseTime}
    />
  );
};

export default ChatMessageExtras;
