
import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
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
      case "actions":
        return <ProjectsManager />;
      default:
        return <Chat />;
    }
  };

  return (
    <AppLayout currentSection={currentSection} onSectionChange={setCurrentSection}>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
