
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Brain, 
  Search,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

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

    setIsMenuOpen(!isMenuOpen);
    onMenuToggle();
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
        background: 'rgba(0, 0, 0, 0.7)',
      }}>
        {/* Safe area for mobile devices */}
        <div className="h-full px-6">
          <div className="flex items-center justify-between h-full max-w-lg mx-auto">
            {/* Navigation Items - Left Side */}
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
                      "active:scale-95 transform-gpu",
                      isActive && "animate-pulse"
                    )}
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/* Active Glow Background */}
                    {isActive && (
                      <>
                        <div 
                          className="absolute inset-0 rounded-full opacity-20 blur-[20px]"
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
                    
                    {/* Icon */}
                    <Icon 
                      className={cn(
                        "w-6 h-6 transition-all duration-300 ease-out relative z-10",
                        isActive 
                          ? "text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" 
                          : "text-white/40 group-hover:text-white/70"
                      )} 
                    />

                    {/* Notification Dot */}
                    {item.id === "chat" && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg" />
                    )}

                    {/* Processing Bar for AI */}
                    {item.id === "memory" && isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60" />
                    )}

                    {/* Ripple Effects */}
                    {ripples.map(ripple => (
                      <span
                        key={ripple.id}
                        className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
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
            
            {/* Hamburger Menu Button - Right Side */}
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ease-out group overflow-hidden",
                  "active:scale-95 transform-gpu",
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
                <div 
                  className="absolute inset-0 rounded-full animate-pulse opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                  }}
                />

                {/* Menu Icon with Rotation Animation */}
                <div className="relative z-10">
                  {isMenuOpen ? (
                    <X className="w-6 h-6 text-white transition-transform duration-300 rotate-180" />
                  ) : (
                    <Menu className="w-6 h-6 text-white transition-transform duration-300" />
                  )}
                </div>

                {/* Ripple Effects */}
                {ripples.map(ripple => (
                  <span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
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
          </div>
        </div>
      </nav>
    </>
  );
};

export default PremiumNavigationBar;
