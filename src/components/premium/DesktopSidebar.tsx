
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageSquare, 
  Search, 
  Brain, 
  FileText,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface DesktopSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const DesktopSidebar = ({ currentSection, onSectionChange }: DesktopSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navigationSections = [
    {
      id: 'main',
      title: 'Principal',
      items: [
        { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
        { id: 'chat', icon: MessageSquare, label: 'Chat IA', badge: 'Pro' },
        { id: 'search', icon: Search, label: 'Busca Semântica', badge: null },
        { id: 'memory', icon: Brain, label: 'Sistema Cognitivo', badge: 'AI' },
        { id: 'documents', icon: FileText, label: 'Documentos', badge: null },
      ]
    },
    {
      id: 'tools',
      title: 'Ferramentas',
      items: [
        { id: 'cognitive', icon: Sparkles, label: 'Sistema Neural', badge: 'Beta' },
        { id: 'analytics', icon: Brain, label: 'Analytics', badge: null },
      ]
    },
    {
      id: 'settings',
      title: 'Configurações',
      items: [
        { id: 'profile', icon: User, label: 'Perfil', badge: null },
        { id: 'settings', icon: Settings, label: 'Configurações', badge: null },
      ]
    }
  ];

  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Alex IA</h1>
            <p className="text-xs text-muted-foreground">Sistema Cognitivo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {navigationSections.map((section) => (
            <div key={section.id}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(section.id)}
                className="w-full justify-between p-2 h-auto text-muted-foreground hover:text-foreground"
              >
                <span className="text-xs font-medium uppercase tracking-wide">
                  {section.title}
                </span>
                {expandedSections.includes(section.id) ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>

              {expandedSections.includes(section.id) && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "w-full justify-start gap-3 h-10 px-3",
                        currentSection === item.id && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Sistema Neural v3.0</p>
          <p>Modo Dark Ativo</p>
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;
