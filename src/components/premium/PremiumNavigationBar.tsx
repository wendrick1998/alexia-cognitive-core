
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Brain, 
  Search,
  X,
  Menu
} from "lucide-react";
import { useState } from "react";
import PremiumSidebar from "./PremiumSidebar";

interface PremiumNavigationBarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle: () => void;
  className?: string;
}

const navigationItems = [
  {
    id: "chat",
    icon: MessageCircle,
  },
  {
    id: "memory",
    icon: Brain,
  },
  {
    id: "search", 
    icon: Search,
  },
];

const PremiumNavigationBar = ({ 
  currentSection, 
  onSectionChange, 
  onMenuToggle,
  className = "" 
}: PremiumNavigationBarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  const handleItemClick = (itemId: string, event: React.MouseEvent) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onSectionChange(itemId);
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Ripple effect for menu button
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    setSidebarOpen(!sidebarOpen);
    onMenuToggle();
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Premium Background Overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-black pointer-events-none z-40" />
      
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-[70px]",
        "backdrop-blur-[20px]",
        "border-t border-white/10",
        className
      )} 
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
      }}>
        <div className="h-full px-6">
          <div className="flex items-center justify-between h-full max-w-lg mx-auto">
            {/* Menu Button - Agora na ESQUERDA */}
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out group overflow-hidden",
                  "active:scale-95 transform-gpu spring-touch",
                  "border border-white/20 hover:border-white/30"
                )}
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Gradient Border Glow */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                    padding: '1px',
                  }}
                />
                
                {/* Pulse Animation for Notifications */}
                {hasNotifications && (
                  <div 
                    className="absolute inset-0 rounded-full animate-pulse opacity-20 premium-notification-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                    }}
                  />
                )}

                {/* Menu Icon */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {sidebarOpen ? (
                    <X className="w-5 h-5 text-white transition-transform duration-300 rotate-180" />
                  ) : (
                    <Menu className="w-5 h-5 text-white transition-transform duration-300" />
                  )}
                </div>

                {/* Ripple Effects */}
                {ripples.map(ripple => (
                  <span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
                    style={{
                      left: ripple.x - 10,
                      top: ripple.y - 10,
                      width: 20,
                      height: 20,
                    }}
                  />
                ))}
              </button>
            </div>

            {/* Navigation Items - Agora na DIREITA */}
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleItemClick(item.id, e)}
                    className={cn(
                      "relative flex items-center justify-center transition-all duration-300 ease-out rounded-full p-3 group overflow-hidden",
                      "active:scale-95 transform-gpu spring-touch"
                    )}
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/* Active Glow Background */}
                    {isActive && (
                      <>
                        <div 
                          className="absolute inset-0 rounded-full opacity-20 blur-[20px] premium-glow-active"
                          style={{
                            background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                          }}
                        />
                        <div 
                          className="absolute inset-0 rounded-full opacity-10"
                          style={{
                            background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                          }}
                        />
                      </>
                    )}
                    
                    {/* Icon - Exactly 24px */}
                    <Icon 
                      className={cn(
                        "w-6 h-6 transition-all duration-300 ease-out relative z-10",
                        isActive 
                          ? "text-white premium-glow-active" 
                          : "text-white/40 group-hover:text-white/70"
                      )} 
                    />

                    {/* Chat Notification Dot */}
                    {item.id === "chat" && hasNotifications && (
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg animate-pulse" />
                    )}

                    {/* AI Processing Bar */}
                    {item.id === "memory" && isActive && isProcessing && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-80 animate-pulse" />
                    )}

                    {/* Ripple Effects */}
                    {ripples.map(ripple => (
                      <span
                        key={ripple.id}
                        className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
                        style={{
                          left: ripple.x - 10,
                          top: ripple.y - 10,
                          width: 20,
                          height: 20,
                        }}
                      />
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Sidebar - Agora abre pela ESQUERDA */}
      <PremiumSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentSection={currentSection}
        onSectionChange={onSectionChange}
      />
    </>
  );
};

export default PremiumNavigationBar;
