
import { Bot, Brain, FileText } from "lucide-react";

const ChatWelcome = () => {
  return (
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
  );
};

export default ChatWelcome;
