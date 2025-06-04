
import { LucideIcon } from "lucide-react";
import { Home, MessageSquare, Brain, FileText, Search, Zap, Bot, Activity, Settings } from "lucide-react";

export interface NavSection {
  id: string;
  title: string;
  icon: keyof typeof import("lucide-react");
  path: string;
}

export const menuSections: NavSection[] = [
  { id: "dashboard", title: "Dashboard", icon: "Home", path: "/" },
  { id: "chat", title: "Chat", icon: "MessageSquare", path: "/chat" },
  { id: "memory", title: "Memória", icon: "Brain", path: "/memory" },
  { id: "documents", title: "Documentos", icon: "FileText", path: "/documents" },
  { id: "search", title: "Busca", icon: "Search", path: "/search" },
  { id: "actions", title: "Ações", icon: "Zap", path: "/actions" },
  { id: "autonomous", title: "Autônomo", icon: "Bot", path: "/autonomous" },
  { id: "performance", title: "Performance", icon: "Activity", path: "/performance" },
  { id: "settings", title: "Configurações", icon: "Settings", path: "/settings" },
];
