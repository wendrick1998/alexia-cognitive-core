
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Brain, FileText, MessageCircle } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useChatProcessor } from "@/hooks/useChatProcessor";
import { Badge } from "@/components/ui/badge";
import ConversationSidebar from "./ConversationSidebar";

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentConversation, 
    messages, 
    loading, 
    getCurrentOrCreateConversation,
    loadMessages,
    updateConversationTimestamp 
  } = useConversations();
  
  const { processing, processMessage } = useChatProcessor();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation on component mount only if none exists
  useEffect(() => {
    const initializeConversation = async () => {
      if (!currentConversation) {
        const conversation = await getCurrentOrCreateConversation();
        if (conversation) {
          await loadMessages(conversation.id);
        }
      }
    };
    
    initializeConversation();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || processing) return;

    const messageText = inputValue.trim();
    setInputValue("");

    // Get or create conversation
    const conversation = await getCurrentOrCreateConversation();
    if (!conversation) return;

    // Process the message through RAG pipeline
    const response = await processMessage(messageText, conversation.id);
    
    if (response) {
      // Update conversation timestamp
      await updateConversationTimestamp(conversation.id);
      // Reload messages to get the updated conversation
      await loadMessages(conversation.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex bg-gray-50">
      {/* Conversation Sidebar */}
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with conversation toggle */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-800"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  {currentConversation ? 'Chat com Alex iA' : 'Nova Conversa'}
                </h1>
                {currentConversation && (
                  <p className="text-sm text-gray-500">
                    Conversa iniciada em {new Date(currentConversation.created_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && !loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-2xl px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800">
                <p className="text-sm leading-relaxed">
                  Olá! Eu sou o Alex iA, seu agente cognitivo pessoal. Faça perguntas sobre seus documentos e eu usarei busca semântica para encontrar as informações mais relevantes e fornecer respostas contextualizadas.
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Carregando conversa...</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="max-w-2xl space-y-2">
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Show LLM info for assistant messages */}
                {message.role === "assistant" && message.llm_used && (
                  <div className="flex items-center gap-2 ml-1">
                    <Badge variant="secondary" className="text-xs">
                      <Brain className="w-3 h-3 mr-1" />
                      {message.llm_used}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      RAG
                    </Badge>
                  </div>
                )}
              </div>
              
              {message.role === "user" && (
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Processing indicator */}
          {processing && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-2xl px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600">
                    Processando sua pergunta e buscando informações relevantes...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto flex space-x-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Faça uma pergunta sobre seus documentos..."
              className="flex-1 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={processing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || processing}
              className="px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {currentConversation && (
            <div className="max-w-4xl mx-auto mt-2 text-center">
              <p className="text-xs text-gray-500">
                Suas perguntas serão respondidas com base nos documentos que você processou usando busca semântica e IA
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
