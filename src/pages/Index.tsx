
import { useState } from "react";
import Header from "../components/Header";
import Chat from "../components/Chat";
import ProjectsManager from "../components/ProjectsManager";
import MemoryManager from "../components/MemoryManager";
import DocumentsManager from "../components/DocumentsManager";
import SemanticSearch from "../components/SemanticSearch";
import BottomNavigationBar from "../components/BottomNavigationBar";

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
      case "actions":
        return <ProjectsManager />;
      default:
        return <Chat />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col w-full">
      <Header />
      <main className="flex-1 pb-20 md:pb-16 overflow-auto">
        {renderContent()}
      </main>
      <BottomNavigationBar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
    </div>
  );
};

export default Index;
