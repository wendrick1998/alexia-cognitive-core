
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Brain, FileText, MessageCircle, Plus, Sparkles } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useChatProcessor } from "@/hooks/useChatProcessor";
import ConversationSidebar from "./ConversationSidebar";

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentConversation, 
    messages, 
    loading, 
    createConversation,
    getCurrentOrCreateConversation,
    loadMessages,
    updateConversationTimestamp 
  } = useConversations();
  
  const { processing, processMessage } = useChatProcessor();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    const conversation = await getCurrentOrCreateConversation();
    if (!conversation) return;

    const response = await processMessage(messageText, conversation.id);
    
    if (response) {
      await updateConversationTimestamp(conversation.id);
      await loadMessages(conversation.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = async () => {
    await createConversation();
  };

  return (
    <div className="flex-1 flex bg-gradient-to-br from-slate-50 via-white to-blue-50/30 min-h-screen">
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col relative">
        {/* Premium Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-600 hover:text-slate-800 hover:bg-white/80 rounded-xl shadow-sm border border-slate-200/50"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {currentConversation?.name || 'Alex iA'}
                    </h1>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-2 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  {currentConversation && (
                    <p className="text-sm text-slate-500 flex items-center space-x-2">
                      <span>Conversa iniciada em {new Date(currentConversation.created_at).toLocaleDateString('pt-BR')}</span>
                      {currentConversation.message_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{currentConversation.message_count} mensagens</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewConversation}
              className="flex items-center space-x-2 rounded-xl border-slate-200 hover:bg-white/80 shadow-sm bg-white/60 backdrop-blur-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conversa</span>
            </Button>
          </div>
        </div>

        {/* Premium Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-transparent pointer-events-none" />
          
          {/* Welcome Message */}
          {messages.length === 0 && !loading && (
            <div className="relative max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                  Bem-vindo ao Alex iA Premium
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Seu agente cognitivo pessoal com busca semântica avançada, memória contextual e 
                  capacidades de raciocínio aprimoradas.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800">IA Cognitiva</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Processamento contextual avançado com memória persistente e raciocínio semântico.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Busca Semântica</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Encontra informações relevantes em seus documentos usando embeddings vetoriais.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Carregando conversa...</p>
              </div>
            </div>
          )}

          {/* Premium Messages */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 max-w-5xl mx-auto animate-fade-in ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {message.role === "assistant" && (
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
              )}
              
              <div className="max-w-3xl space-y-3">
                <div
                  className={`px-6 py-4 rounded-3xl shadow-lg relative overflow-hidden ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white ml-auto shadow-blue-200"
                      : "bg-white/90 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-slate-200"
                  }`}
                >
                  {message.role === "user" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20" />
                  )}
                  <div className="relative">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
                
                {/* Enhanced message metadata */}
                {message.role === "assistant" && message.llm_used && (
                  <div className="flex items-center gap-2 ml-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs">
                      <Brain className="w-3 h-3 mr-1" />
                      {message.llm_used}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      RAG
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>
              
              {message.role === "user" && (
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Enhanced Processing Indicator */}
          {processing && (
            <div className="flex items-start space-x-4 max-w-5xl mx-auto animate-fade-in">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="max-w-3xl px-6 py-4 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-base text-slate-700 font-medium">
                    Processando sua pergunta e buscando informações relevantes...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Premium Input Area */}
        <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-indigo-50/30" />
          <div className="max-w-5xl mx-auto relative">
            <div className="flex space-x-4 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Faça uma pergunta sobre seus documentos..."
                  className="pr-4 py-4 text-base rounded-2xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/90 backdrop-blur-sm shadow-lg text-slate-800 placeholder:text-slate-500"
                  disabled={processing}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || processing}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl border-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            {currentConversation && (
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Suas perguntas serão respondidas com base nos documentos processados usando busca semântica e IA premium
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
