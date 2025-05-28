
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Brain, FileText, MessageCircle, Plus } from "lucide-react";
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
    <div className="flex-1 flex bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Conversation Sidebar */}
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {currentConversation ? 'Alex iA' : 'Nova Conversa'}
                  </h1>
                  {currentConversation && (
                    <p className="text-sm text-slate-500">
                      Conversa iniciada em {new Date(currentConversation.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => getCurrentOrCreateConversation()}
              className="flex items-center space-x-2 rounded-xl border-slate-200 hover:bg-slate-50"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conversa</span>
            </Button>
          </div>
        </div>

        {/* Messages Area with improved styling */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome message */}
          {messages.length === 0 && !loading && (
            <div className="flex items-start space-x-4 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-3xl px-6 py-4 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-lg">
                <p className="text-base leading-relaxed">
                  Olá! Eu sou o <span className="font-semibold text-blue-600">Alex iA</span>, seu agente cognitivo pessoal. 
                  Faça perguntas sobre seus documentos e eu usarei busca semântica para encontrar as informações mais relevantes 
                  e fornecer respostas contextualizadas.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Brain className="w-3 h-3 mr-1" />
                    IA Cognitiva
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <FileText className="w-3 h-3 mr-1" />
                    Busca Semântica
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-sm text-slate-600">Carregando conversa...</p>
              </div>
            </div>
          )}

          {/* Messages with improved styling */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 animate-fade-in ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="max-w-3xl space-y-3">
                <div
                  className={`px-6 py-4 rounded-3xl shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white ml-auto"
                      : "bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-800"
                  }`}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Enhanced LLM info for assistant messages */}
                {message.role === "assistant" && message.llm_used && (
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <Brain className="w-3 h-3 mr-1" />
                      {message.llm_used}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      <FileText className="w-3 h-3 mr-1" />
                      RAG
                    </Badge>
                  </div>
                )}
              </div>
              
              {message.role === "user" && (
                <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Enhanced processing indicator */}
          {processing && (
            <div className="flex items-start space-x-4 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-3xl px-6 py-4 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-base text-slate-600">
                    Processando sua pergunta e buscando informações relevantes...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Faça uma pergunta sobre seus documentos..."
                  className="pr-4 py-4 text-base rounded-2xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/90 backdrop-blur-sm shadow-lg"
                  disabled={processing}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || processing}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            {currentConversation && (
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500">
                  Suas perguntas serão respondidas com base nos documentos processados usando busca semântica e IA
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
