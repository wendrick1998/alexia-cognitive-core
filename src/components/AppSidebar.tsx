
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  MessageCircle,
  Brain,
  FileText,
  Search,
  Zap,
  Settings,
  User,
  Plus,
  Star,
  Clock,
  Archive
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DarkModeToggle from './premium/DarkModeToggle';

interface AppSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const AppSidebar = ({ currentSection, onSectionChange }: AppSidebarProps) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      group: "Principal",
      items: [
        {
          id: "chat",
          title: "Chat",
          icon: MessageCircle,
          badge: null,
          description: "Conversas com IA"
        },
        {
          id: "search",
          title: "Busca Semântica",
          icon: Search,
          badge: "Premium",
          description: "Encontre qualquer informação"
        }
      ]
    },
    {
      group: "Conhecimento",
      items: [
        {
          id: "memory",
          title: "Memórias",
          icon: Brain,
          badge: null,
          description: "Gestão de conhecimento"
        },
        {
          id: "documents",
          title: "Documentos",
          icon: FileText,
          badge: null,
          description: "PDFs, textos e arquivos"
        }
      ]
    },
    {
      group: "Ferramentas",
      items: [
        {
          id: "actions",
          title: "Projetos",
          icon: Zap,
          badge: "Beta",
          description: "Ações automáticas"
        }
      ]
    }
  ];

  const quickActions = [
    { icon: Plus, label: "Nova Conversa", action: () => onSectionChange("chat") },
    { icon: Star, label: "Favoritos", action: () => {} },
    { icon: Clock, label: "Recentes", action: () => {} },
    { icon: Archive, label: "Arquivados", action: () => {} }
  ];

  return (
    <Sidebar className="border-r border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-colors duration-300">
      <SidebarHeader className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AlexIA</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Assistente Inteligente</p>
            </div>
          </div>
          <DarkModeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Ações Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="h-12 flex flex-col items-center justify-center gap-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 rounded-xl"
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Menu */}
        {navigationItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      isActive={currentSection === item.id}
                      className="w-full p-3 rounded-xl transition-all duration-200 group hover:bg-slate-50 dark:hover:bg-slate-800 data-[active=true]:bg-blue-50 dark:data-[active=true]:bg-blue-900/20 data-[active=true]:border-blue-200 dark:data-[active=true]:border-blue-700/50"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`p-2 rounded-lg transition-colors ${
                          currentSection === item.id 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        }`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
              <div className="flex items-center space-x-3 w-full">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {user?.email?.split('@')[0] || 'Usuário'}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Premium Account</p>
                </div>
                <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
