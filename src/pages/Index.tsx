
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Chat from "../components/Chat";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("chat");

  const renderContent = () => {
    switch (currentSection) {
      case "chat":
        return <Chat />;
      case "memory":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gerenciar Memória</h2>
              <p className="text-gray-600">Esta seção será desenvolvida em breve</p>
            </div>
          </div>
        );
      case "documents":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Documentos Conectados</h2>
              <p className="text-gray-600">Esta seção será desenvolvida em breve</p>
            </div>
          </div>
        );
      case "preferences":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Preferências do Usuário</h2>
              <p className="text-gray-600">Esta seção será desenvolvida em breve</p>
            </div>
          </div>
        );
      case "projects":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Histórico de Projetos</h2>
              <p className="text-gray-600">Esta seção será desenvolvida em breve</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Configurações de IA</h2>
              <p className="text-gray-600">Esta seção será desenvolvida em breve</p>
            </div>
          </div>
        );
      default:
        return <Chat />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      <div className="flex-1 flex flex-col">
        <Header />
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
