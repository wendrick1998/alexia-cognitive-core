
import { 
  BarChart3,
  MessageCircle, 
  Brain, 
  FileText, 
  Search,
  Zap,
  Settings,
  User,
  Bot,
  Menu,
  Home,
  FolderOpen,
  Activity,
  TrendingUp,
  Users,
  Shield,
  Bell
} from 'lucide-react';

export type NavItem = {
  id: string;
  title: string;
  icon: React.FC<any>;
  path: string;
  description?: string;
  badge?: string;
  shortcut?: string;
};

export const menuSectionsConfig: { title?: string; items: NavItem[] }[] = [
  {
    title: "PRINCIPAL",
    items: [
      { 
        id: "dashboard", 
        title: "Dashboard", 
        icon: BarChart3, 
        path: "/dashboard",
        description: "Visão geral e insights",
        shortcut: "⌘D"
      },
      { 
        id: "chat", 
        title: "Chat", 
        icon: MessageCircle, 
        path: "/chat",
        description: "Conversas com IA",
        shortcut: "⌘N"
      },
      { 
        id: "search", 
        title: "Busca Semântica", 
        icon: Search, 
        path: "/search",
        description: "Encontre qualquer informação",
        badge: "Premium",
        shortcut: "⌘K"
      }
    ]
  },
  {
    title: "CONHECIMENTO",
    items: [
      { 
        id: "memory", 
        title: "Memórias", 
        icon: Brain, 
        path: "/memory",
        description: "Gestão de conhecimento"
      },
      { 
        id: "documents", 
        title: "Documentos", 
        icon: FileText, 
        path: "/documents",
        description: "PDFs, textos e arquivos"
      }
    ]
  },
  {
    title: "FERRAMENTAS",
    items: [
      { 
        id: "actions", 
        title: "Projetos", 
        icon: Zap, 
        path: "/actions",
        description: "Ações automáticas",
        badge: "Beta"
      }
    ]
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { 
        id: "preferences", 
        title: "Preferências do Usuário", 
        icon: User, 
        path: "/settings/profile",
        description: "Configurações pessoais"
      },
      { 
        id: "privacy", 
        title: "Configurações de IA", 
        icon: Settings, 
        path: "/settings/ai",
        description: "Configurações do sistema"
      },
      { 
        id: "llm-config", 
        title: "Config IA",
        icon: Bot, 
        path: "/llm-config",
        description: "Modelos e comportamento da IA"
      }
    ]
  }
];

// Itens específicos para BottomNavigation (mobile)
export const bottomNavItemsIds: string[] = [
  "dashboard", 
  "chat", 
  "search", 
  "llm-config", 
  "menu"
];

// Função helper para obter um item por ID
export const getNavItemById = (id: string): NavItem | undefined => {
  for (const section of menuSectionsConfig) {
    const item = section.items.find(item => item.id === id);
    if (item) return item;
  }
  return undefined;
};

// Função helper para obter todos os itens como array plano
export const getAllNavItems = (): NavItem[] => {
  return menuSectionsConfig.flatMap(section => section.items);
};

// Função helper para obter itens de uma seção específica
export const getNavItemsBySection = (sectionTitle: string): NavItem[] => {
  const section = menuSectionsConfig.find(s => s.title === sectionTitle);
  return section ? section.items : [];
};

// Configuração específica para BottomNavigation com item especial de Menu
export const bottomNavigationConfig = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    action: () => "dashboard"
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageCircle,
    action: () => "chat"
  },
  {
    id: "search",
    label: "Busca",
    icon: Search,
    action: () => "search"
  },
  {
    id: "llm-config",
    label: "Config IA",
    icon: Bot,
    action: () => "/llm-config" // Navega para rota específica
  },
  {
    id: "menu",
    label: "Menu",
    icon: Menu,
    action: "toggle-menu" // Ação especial para abrir menu
  }
];

// Exportar constantes para compatibilidade com componentes existentes
export const mainNavItems = getAllNavItems();
