
// ARQUIVO ARQUIVADO - Foi substituído por Index.tsx como entrada principal
// Mantido aqui apenas para referência histórica

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

// Páginas principais (PLACEHOLDERS - NÃO FUNCIONAIS)
const HomePage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white p-4">
    <div className="text-center max-w-2xl">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-6 flex items-center justify-center">
        <span className="text-3xl font-bold text-white">AI</span>
      </div>
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Alex iA
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        Seu agente cognitivo pessoal está pronto para ajudar
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">Chat Inteligente</h3>
          <p className="text-gray-400 text-sm">Converse naturalmente com Alex iA</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-green-400 mb-2">Memória Cognitiva</h3>
          <p className="text-gray-400 text-sm">Sistema de memória avançado</p>
        </div>
      </div>
    </div>
  </div>
);

const ChatPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
    <div className="text-center">
      <SmartLoadingSpinner type="chat" message="Chat em desenvolvimento..." size="md" />
    </div>
  </div>
);

const DocumentsPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
    <div className="text-center">
      <SmartLoadingSpinner type="database" message="Documentos em desenvolvimento..." size="md" />
    </div>
  </div>
);

const MemoryPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
    <div className="text-center">
      <SmartLoadingSpinner type="brain" message="Memória em desenvolvimento..." size="md" />
    </div>
  </div>
);

const MainApp: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* NOTA: Layout components (PWALayout, PremiumSidebar, BottomNavigation) 
          foram removidos desta versão arquivada - agora gerenciados pelo fluxo principal */}
      
      {/* Main Content Simplificado */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <h1 className="text-white text-xl font-bold">
            Alex iA - MainApp (Arquivo Histórico)
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Este componente foi substituído pelo sistema de roteamento principal
          </p>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MainApp;
