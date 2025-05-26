
import { cn } from "@/lib/utils";
import { 
  MessageCircle, 
  Brain, 
  FileText, 
  User, 
  FolderOpen, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: "chat",
    label: "Chat",
    icon: MessageCircle,
  },
  {
    id: "memory",
    label: "Gerenciar Memória",
    icon: Brain,
  },
  {
    id: "documents",
    label: "Documentos Conectados",
    icon: FileText,
  },
  {
    id: "preferences",
    label: "Preferências do Usuário",
    icon: User,
  },
  {
    id: "projects",
    label: "Meus Projetos",
    icon: FolderOpen,
  },
  {
    id: "settings",
    label: "Configurações de IA",
    icon: Settings,
  },
];

const Sidebar = ({ currentSection, onSectionChange }: SidebarProps) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Navegação
        </h2>
      </div>
      
      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                currentSection === item.id
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "mr-3 flex-shrink-0 h-5 w-5",
                currentSection === item.id ? "text-blue-500" : "text-gray-400"
              )} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Alex iA v1.0 Beta
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
