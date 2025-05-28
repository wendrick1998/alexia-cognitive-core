
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Chat from "../components/Chat";
import ProjectsManager from "../components/ProjectsManager";
import MemoryManager from "../components/MemoryManager";
import DocumentsManager from "../components/DocumentsManager";
import SemanticSearch from "../components/SemanticSearch";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("chat");

  const renderContent = () => {
    switch (currentSection) {
      case "chat":
        return <Chat />;
      case "memory":
        return <MemoryManager />;
      case "documents":
        return <DocumentsManager />;
      case "search":
        return <SemanticSearch />;
      case "preferences":
        return (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Preferências do Usuário</h2>
              <p className="text-slate-600">Esta seção será desenvolvida em breve</p>
            </div>
          </div>
        );
      case "projects":
        return <ProjectsManager />;
      case "settings":
        return (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Configurações de IA</h2>
              <p className="text-slate-600">Esta seção será desenvolvida em breve</p>
            </div>
          </div>
        );
      default:
        return <Chat />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex w-full">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      <div className="flex-1 flex flex-col">
        <Header />
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
